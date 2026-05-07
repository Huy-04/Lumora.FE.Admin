const ACCESS_TOKEN_IDLE_WINDOW_MS = 55 * 60 * 1000;
const HEARTBEAT_POLL_MS = 60 * 1000;

export default defineNuxtPlugin(() => {
  const installed = useState<boolean>("auth:heartbeat-installed", () => false);
  if (installed.value) {
    return;
  }

  installed.value = true;

  const session = useAuthSession();
  const authRefresh = useAuthRefresh();
  const sessionHint = useSessionHint();
  const authIndicator = useCookie<string | null>("auth", {
    sameSite: "lax",
    default: () => null,
  });
  const lastRefreshAt = useState<number>("auth:heartbeat-last-refresh-at", () => 0);

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

    const refreshed = await authRefresh.refresh();
    if (refreshed) {
      lastRefreshAt.value = Date.now();
      return;
    }

    if (!hasRestoreHint()) {
      await expireSession();
    }
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
