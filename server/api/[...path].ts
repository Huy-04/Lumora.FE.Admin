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

const isLocalHttpRequest = (event: Parameters<typeof getRequestURL>[0]) => {
  const url = getRequestURL(event);
  return url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
};

const relaxSecureCookieForLocalHttp = (cookie: string) =>
  cookie.replace(/;\s*Secure/gi, "");

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

  // Forward headers — special handling for Set-Cookie to avoid
  // the Fetch spec combining them into a single comma-separated value.
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

    // Overwrite the combined header with individual entries.
    setResponseHeader(event, "set-cookie", cookies);
  }

  return upstream.body;
});
