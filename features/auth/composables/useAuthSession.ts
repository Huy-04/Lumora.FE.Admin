import type { ComputedRef } from "vue";
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
} from "~/features/auth/types";
import type { UserResponse } from "~/features/users/types";

interface SessionState {
  session: Ref<CurrentUserResponse | null>;
  status: Ref<"idle" | "loading" | "authenticated" | "guest">;
  lastError: Ref<string | null>;
  user: ComputedRef<UserResponse | null>;
  permissions: ComputedRef<string[]>;
  isAuthenticated: ComputedRef<boolean>;
  restore: (force?: boolean, options?: { allowRefresh?: boolean }) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  adminLogin: (payload: LoginRequest, overrides?: { deviceId?: string; deviceName?: string }) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  expire: (message?: string) => void;
  clear: () => void;
}

export const useAuthSession = (): SessionState => {
  const session = useState<CurrentUserResponse | null>("auth:session", () => null);
  const status = useState<"idle" | "loading" | "authenticated" | "guest">("auth:status", () => "idle");
  const lastError = useState<string | null>("auth:last-error", () => null);
  const restorePromise = useState<Promise<boolean> | null>("auth:restore-promise", () => null);

  const authApi = useAuthApi();
  const authRefresh = useAuthRefresh();
  const identity = useDeviceIdentity();
  const sessionHint = useSessionHint();
  const authIndicator = useCookie<string | null>("auth", {
    sameSite: "lax",
    default: () => null,
  });

  const clearState = (message: string | null = null) => {
    session.value = null;
    status.value = "guest";
    lastError.value = message;
    authIndicator.value = null;
    sessionHint.clear();
  };

  const clear = () => {
    clearState(null);
  };

  const expire = (message = "Your session is no longer valid. Please sign in again.") => {
    clearState(message);
  };

  const restore = async (force = false, options?: { allowRefresh?: boolean }) => {
    if (!force && status.value === "authenticated" && session.value) {
      return true;
    }

    if (!force && status.value === "guest") {
      return false;
    }

    if (!force && restorePromise.value) {
      return restorePromise.value;
    }

    status.value = "loading";
    lastError.value = null;

    restorePromise.value = (async () => {
      const allowRefresh = options?.allowRefresh !== false && import.meta.client;

      try {
        session.value = await authApi.getMe({
          skipAuthRefresh: true,
        });
        status.value = "authenticated";
        sessionHint.markAuthenticated();
        return true;
      } catch {
        if (allowRefresh && await authRefresh.refresh({ force: true })) {
          try {
            session.value = await authApi.getMe({
              skipAuthRefresh: true,
            });
            status.value = "authenticated";
            sessionHint.markAuthenticated();
            return true;
          } catch {
            clear();
            return false;
          }
        }

        clear();
        return false;
      } finally {
        restorePromise.value = null;
      }
    })();

    return restorePromise.value;
  };

  const refresh = () => restore(true);

  const adminLogin = async (
    payload: LoginRequest,
    overrides?: { deviceId?: string; deviceName?: string },
  ) => {
    clear();
    identity.apply(overrides?.deviceId, overrides?.deviceName);

    const response = await authApi.adminLogin(payload, {
      "X-Device-Id": identity.deviceId.value,
      "X-Device-Name": identity.deviceName.value,
    });

    sessionHint.markAuthenticated();
    await refresh();
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout(identity.deviceId.value);
    } finally {
      clear();
    }
  };

  return {
    session,
    status,
    lastError,
    user: computed(() => session.value?.user ?? null),
    permissions: computed(() => session.value?.permissions ?? []),
    isAuthenticated: computed(() => Boolean(session.value?.user?.id)),
    restore,
    refresh,
    adminLogin,
    logout,
    expire,
    clear,
  };
};
