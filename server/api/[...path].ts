import { getMethod, getProxyRequestHeaders, getRequestURL, getRequestWebStream, setResponseHeader, setResponseStatus } from "h3";

const PUBLIC_AUTH_PATHS = new Set([
  "authentication/login",
  "authentication/admin-login",
  "authentication/register",
  "authentication/request-password-reset",
  "authentication/resend-password-reset-otp",
  "authentication/verify-password-reset-otp",
  "authentication/complete-password-reset",
]);

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "content-length",
  "content-encoding",
]);

type StreamedRequestInit = RequestInit & {
  duplex?: "half";
};

const isJsonContentType = (contentType: string | null) =>
  Boolean(contentType && /(?:application\/json|application\/problem\+json|.+\+json)(?:;|$)/i.test(contentType));

const isLocalHttpRequest = (event: Parameters<typeof getRequestURL>[0]) => {
  const url = getRequestURL(event);
  return url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
};

const relaxSecureCookieForLocalHttp = (cookie: string) =>
  cookie.replace(/;\s*Secure/gi, "");

const tryCloseBrackets = (prefix: string): string | null => {
  const opens: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{" || ch === "[") opens.push(ch);
    if (ch === "}") { if (opens.length && opens[opens.length - 1] === "{") opens.pop(); else return null; }
    if (ch === "]") { if (opens.length && opens[opens.length - 1] === "[") opens.pop(); else return null; }
  }

  if (inString) return null;

  return prefix + opens.reverse().map((c) => c === "{" ? "}" : "]").join("");
};

const tryRecoverJson = (rawText: string): unknown | null => {
  try {
    return JSON.parse(rawText);
  } catch {
    // Continue to recovery.
  }

  const trimmed = rawText.trim();

  if (trimmed.startsWith("[")) {
    const lastComma = trimmed.lastIndexOf("},");
    const lastBrace = trimmed.lastIndexOf("}");

    if (lastBrace !== -1) {
      const cutPoint = lastComma !== -1 ? lastComma + 1 : lastBrace + 1;
      const candidate = trimmed.slice(0, cutPoint) + "]";

      try {
        return JSON.parse(candidate);
      } catch {
        const closed = tryCloseBrackets(candidate);
        if (closed) {
          try { return JSON.parse(closed); } catch { /* fall through */ }
        }
      }
    }
  }

  if (trimmed.startsWith("{")) {
    const strategies: Array<() => string | null> = [
      () => {
        const idx = trimmed.lastIndexOf("},");
        return idx !== -1 ? trimmed.slice(0, idx + 1) : null;
      },
      () => {
        const idx = trimmed.lastIndexOf(',"');
        return idx !== -1 ? trimmed.slice(0, idx) : null;
      },
      () => {
        const idx = trimmed.lastIndexOf("}");
        return idx !== -1 ? trimmed.slice(0, idx + 1) : null;
      },
      () => {
        const idx = trimmed.lastIndexOf("],");
        return idx !== -1 ? trimmed.slice(0, idx + 1) : null;
      },
      () => {
        const idx = trimmed.lastIndexOf("]");
        return idx !== -1 ? trimmed.slice(0, idx + 1) : null;
      },
    ];

    for (const strategy of strategies) {
      const prefix = strategy();
      if (prefix === null) continue;

      const closed = tryCloseBrackets(prefix);
      if (closed === null) continue;

      try {
        return JSON.parse(closed);
      } catch {
      }
    }
  }

  return null;
};

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const pathParam = event.context.params?.path;
  const path = Array.isArray(pathParam) ? pathParam.join("/") : pathParam;

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing API path.",
    });
  }

  const targetBase = runtimeConfig.apiProxyTarget.replace(/\/$/, "");
  const query = getRequestURL(event).search;
  const normalizedPath = path.toLowerCase();
  const headers = getProxyRequestHeaders(event);
  const method = getMethod(event);

  // Public auth routes should not inherit stale auth cookies/headers.
  if (PUBLIC_AUTH_PATHS.has(normalizedPath)) {
    delete headers.cookie;
    delete headers.authorization;
  }

  if (import.meta.dev && targetBase.startsWith("https://localhost")) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const canHaveBody = !["GET", "HEAD"].includes(method);
  const requestInit: StreamedRequestInit = {
    method,
    headers,
  };

  if (canHaveBody) {
    requestInit.body = getRequestWebStream(event) as BodyInit;
    requestInit.duplex = "half";
  }

  let upstream: Response;

  try {
    upstream = await fetch(`${targetBase}/api/${path}${query}`, requestInit);
  } catch (error) {
    setResponseStatus(event, 503, "Service Unavailable");
    setResponseHeader(event, "content-type", "application/problem+json; charset=utf-8");

    return {
      type: "about:blank",
      title: "BackendUnavailable",
      status: 503,
      detail: "The Lumora API is currently unavailable for this admin request.",
    };
  }

  // Forward status
  setResponseStatus(event, upstream.status, upstream.statusText);

  // Forward headers
  for (const [key, value] of upstream.headers.entries()) {
    if (HOP_BY_HOP.has(key.toLowerCase())) {
      continue;
    }

    setResponseHeader(event, key, value);
  }

  // Set-Cookie must be forwarded individually (fetch() combines them).
  const setCookies = upstream.headers.getSetCookie?.();
  if (setCookies?.length) {
    const cookies = import.meta.dev && isLocalHttpRequest(event)
      ? setCookies.map(relaxSecureCookieForLocalHttp)
      : setCookies;

    setResponseHeader(event, "set-cookie", cookies);
  }

  if (method === "HEAD" || upstream.status === 204 || upstream.status === 304) {
    return null;
  }

  const contentType = upstream.headers.get("content-type");

  if (isJsonContentType(contentType)) {
    const rawText = await upstream.text();
    if (normalizedPath.startsWith("permissions")) {
    }

    const recovered = tryRecoverJson(rawText);
    if (recovered !== null) {
      return recovered;
    }

    setResponseStatus(event, 502, "Bad Gateway");
    setResponseHeader(event, "content-type", "application/problem+json; charset=utf-8");

    return {
      type: "about:blank",
      title: "UpstreamJsonError",
      status: 502,
      detail: "The upstream server returned an invalid JSON response.",
    };
  }

  return upstream.body;
});
