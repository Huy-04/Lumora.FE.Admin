import { getProblemDetails } from "~/Shared/api/apiErrors";

const ACCESS_TOKEN_IDLE_WINDOW_MS = 55 * 60 * 1000;
const HEARTBEAT_POLL_MS = 60 * 1000;

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

export default defineNuxtPlugin(() => {
  const installed = useState<boolean>("auth:heartbeat-installed", () => false);
  if (installed.value) {
    return;
  }

  installed.value = true;

  const session = useAuthSession();
  const authApi = useAuthApi();
  const identity = useDeviceIdentity();
  const sessionHint = useSessionHint();
  const authIndicator = useCookie<string | null>("auth", {
    sameSite: "lax",
    default: () => null,
  });
  const lastRefreshAt = useState<number>("auth:heartbeat-last-refresh-at", () => 0);

  let refreshPromise: Promise<void> | null = null;

  const hasRestoreHint = () => Boolean(authIndicator.value || sessionHint.hasHint.value);

  const syncRefreshClock = () => {
    if (!hasRestoreHint()) {
      lastRefreshAt.value = 0;
      return;
    }

    if (!lastRefreshAt.value) {
      lastRefreshAt.value = Date.now();
    }
  };

  const expireSession = async () => {
    authIndicator.value = null;
    session.expire("Your session expired after a period of inactivity. Please sign in again.");
    lastRefreshAt.value = 0;

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
  };

  const refreshIfDue = async () => {
    syncRefreshClock();

    if (!hasRestoreHint()) {
      return;
    }

    if (
      lastRefreshAt.value
      && Date.now() - lastRefreshAt.value < ACCESS_TOKEN_IDLE_WINDOW_MS
    ) {
      return;
    }

    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        await authApi.refreshAccessToken(identity.deviceId.value);
        sessionHint.markAuthenticated();
        lastRefreshAt.value = Date.now();
      } catch (error) {
        const status = getProblemStatus(error);
        if (status === 401 || status === 403) {
          await expireSession();
        }
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  const onForeground = () => {
    if (document.visibilityState === "visible") {
      void refreshIfDue();
    }
  };

  watch(() => hasRestoreHint(), syncRefreshClock, { immediate: true });

  window.setInterval(() => {
    void refreshIfDue();
  }, HEARTBEAT_POLL_MS);

  window.addEventListener("focus", onForeground);
  document.addEventListener("visibilitychange", onForeground);
});
