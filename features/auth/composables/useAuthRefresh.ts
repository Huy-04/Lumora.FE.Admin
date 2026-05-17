import { getProblemDetails } from "~/Shared/api/apiErrors";
import type { LoginResponse } from "~/features/auth/types";

const getProblemStatus = (error: unknown): number | null => {
  const problem = getProblemDetails(error);
  const candidate = error as {
    status?: number;
    statusCode?: number;
    response?: {
      status?: number;
      statusCode?: number;
    };
  } | null;

  return problem?.status
    ?? candidate?.status
    ?? candidate?.statusCode
    ?? candidate?.response?.status
    ?? candidate?.response?.statusCode
    ?? null;
};

export const useAuthRefresh = () => {
  const refreshPromise = useState<Promise<boolean> | null>("auth:refresh-promise", () => null);
  const identity = useDeviceIdentity();
  const sessionHint = useSessionHint();
  const authIndicator = useCookie<string | null>("auth", {
    sameSite: "lax",
    default: () => null,
  });

  const hasRestoreHint = computed(() => Boolean(authIndicator.value || sessionHint.hasHint.value));

  const clearHints = () => {
    authIndicator.value = null;
    sessionHint.clear();
  };

  const refresh = async (options?: { force?: boolean }) => {
    if (import.meta.server || (!options?.force && !hasRestoreHint.value)) {
      return false;
    }

    if (refreshPromise.value) {
      return refreshPromise.value;
    }

    refreshPromise.value = (async () => {
      try {
        const api = useApiClient();
        await api.request<LoginResponse>("/Authentication/refresh-access-token", {
          method: "POST",
          skipAuthRefresh: true,
          headers: {
            "X-Device-Id": identity.deviceId.value,
          },
        });
        sessionHint.markAuthenticated();
        return true;
      } catch (error) {
        const status = getProblemStatus(error);
        if (status === 401 || status === 403) {
          clearHints();
        }

        return false;
      } finally {
        refreshPromise.value = null;
      }
    })();

    return refreshPromise.value;
  };

  return {
    hasRestoreHint,
    refresh,
    clearHints,
  };
};
