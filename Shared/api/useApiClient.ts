import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";
import { getProblemCodes, getProblemDetails, getProblemStatus } from "./apiErrors";
import type { CurrentUserResponse } from "~/features/auth/types";

interface ApiRequestOptions extends NitroFetchOptions<NitroFetchRequest> {
  skipAuthRefresh?: boolean;
}

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
  const router = import.meta.client ? useRouter() : null;
  const authRefresh = useAuthRefresh();
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
    const hasRefreshContext = Boolean(authIndicator.value || sessionHint.hasHint.value || session.value?.user?.id);

    if (import.meta.server || options?.skipAuthRefresh || status !== 401 || !hasRefreshContext) {
      return false;
    }

    return !requestPath.startsWith("/Authentication/login")
      && !requestPath.startsWith("/Authentication/admin-login")
      && !requestPath.startsWith("/Authentication/register")
      && !requestPath.startsWith("/Authentication/request-password-reset")
      && !requestPath.startsWith("/Authentication/resend-password-reset-otp")
      && !requestPath.startsWith("/Authentication/verify-password-reset-otp")
      && !requestPath.startsWith("/Authentication/complete-password-reset")
      && !requestPath.startsWith("/Authentication/refresh-access-token");
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

    if (import.meta.client && router) {
      await router.push({
        path: "/auth/login",
        query: {
          reason: "session-expired",
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

      if (shouldAttemptRefresh(path, options, error) && await authRefresh.refresh({ force: true })) {
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
