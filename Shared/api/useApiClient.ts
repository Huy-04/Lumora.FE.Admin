import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";
import { getProblemCodes, getProblemDetails, getProblemStatus } from "./apiErrors";
import type { CurrentUserResponse } from "~/features/auth/types";

interface ApiRequestOptions extends NitroFetchOptions<NitroFetchRequest> {
  skipAuthRefresh?: boolean;
}

// Module-level promise to deduplicate concurrent refresh attempts across
// all useApiClient() instances.  Without this, each composable call creates
// its own closure and fires a separate refresh, but the backend uses token
// rotation, so the second refresh would try the (now-revoked) old token.
let refreshPromise: Promise<boolean> | null = null;

const logApiDebug = (message: string, payload?: unknown) => {
  if (import.meta.dev) {
    console.debug(message, payload);
  }
};

const logApiError = (message: string, payload?: unknown) => {
  if (import.meta.dev) {
    console.error(message, payload);
  }
};

export const useApiClient = () => {
  const requestFetch = import.meta.server ? useRequestFetch() : $fetch;
  const identity = useDeviceIdentity();
  const sessionHint = useSessionHint();
  const session = useState<CurrentUserResponse | null>("auth:session", () => null);
  const status = useState<"idle" | "loading" | "authenticated" | "guest">("auth:status", () => "idle");
  const lastError = useState<string | null>("auth:last-error", () => null);
  const authIndicator = useCookie<string | null>("auth", {
    sameSite: "lax",
    default: () => null,
  });

  const shouldAttemptRefresh = (path: NitroFetchRequest, options: ApiRequestOptions | undefined, error: unknown) => {
    const requestPath = String(path);
    const problem = getProblemDetails(error);
    const status = problem?.status ?? (error as { response?: { status?: number } } | null)?.response?.status;
    const hasRestoreHint = Boolean(authIndicator.value || sessionHint.hasHint.value);

    if (options?.skipAuthRefresh || status !== 401 || !hasRestoreHint) {
      return false;
    }

    return !requestPath.startsWith("/Authentication/login")
      && !requestPath.startsWith("/Authentication/admin-login")
      && !requestPath.startsWith("/Authentication/register")
      && !requestPath.startsWith("/Authentication/request-password-reset")
      && !requestPath.startsWith("/Authentication/verify-password-reset-otp")
      && !requestPath.startsWith("/Authentication/complete-password-reset")
      && !requestPath.startsWith("/Authentication/refresh-access-token");
  };

  const refreshAccessToken = async () => {
    if (refreshPromise) {
      return refreshPromise;
    }

    if (!authIndicator.value && !sessionHint.hasHint.value) {
      return false;
    }

    refreshPromise = (async () => {
      try {
        await requestFetch("/Authentication/refresh-access-token", {
          baseURL: "/api",
          credentials: "include",
          method: "POST",
          headers: {
            "X-Device-Id": identity.deviceId.value,
          },
        });

        sessionHint.markAuthenticated();
        return true;
      } catch {
        authIndicator.value = null;
        sessionHint.clear();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  const shouldHandleAuthFailureAsExpired = (path: NitroFetchRequest, error: unknown) => {
    const requestPath = String(path);
    const status = getProblemStatus(error);
    const hasRestoreHint = Boolean(authIndicator.value || sessionHint.hasHint.value || session.value?.user?.id);
    if (!hasRestoreHint || requestPath.startsWith("/Authentication/")) {
      return false;
    }

    if (status === 403) {
      return true;
    }

    if (status !== 401) {
      return false;
    }

    const problemCodes = getProblemCodes(error);
    return problemCodes.size === 0
      || problemCodes.has("TOKEN_REVOKED")
      || problemCodes.has("TokenRevoked")
      || problemCodes.has("Unauthorized")
      || problemCodes.has("UNAUTHORIZED");
  };

  const handleAuthFailureAsExpired = async () => {
    authIndicator.value = null;
    session.value = null;
    status.value = "guest";
    lastError.value = "Your access for this workspace has changed. Please sign in again.";
    sessionHint.clear();

    if (import.meta.client) {
      const router = useRouter();
      const currentPath = router.currentRoute.value.fullPath;
      const redirect = currentPath.startsWith("/auth") ? "/" : currentPath;

      await navigateTo({
        path: "/auth/login",
        query: {
          reason: "session-expired",
          redirect,
        },
      });
    }
  };

  const request = async <T>(
    path: NitroFetchRequest,
    options?: ApiRequestOptions,
  ) => {
    const { skipAuthRefresh, ...fetchOptions } = options ?? {};

    logApiDebug("[ApiClient] Request started:", { path, method: fetchOptions.method ?? "GET" });

    try {
      const result = await requestFetch<T>(path, {
        baseURL: "/api",
        credentials: "include",
        ...fetchOptions,
      });
      logApiDebug("[ApiClient] Request succeeded:", path);
      return result;
    } catch (error) {
      logApiError("[ApiClient] Request failed:", { path, error });

      if (shouldAttemptRefresh(path, options, error) && await refreshAccessToken()) {
        logApiDebug("[ApiClient] Retrying after token refresh...");
        return await requestFetch<T>(path, {
          baseURL: "/api",
          credentials: "include",
          ...fetchOptions,
        });
      }

      if (shouldHandleAuthFailureAsExpired(path, error)) {
        await handleAuthFailureAsExpired();
      }

      throw error;
    }
  };

  return {
    request,
  };
};
