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
  const router = useRouter();
  const authIndicator = useCookie<string | null>("auth", {
    sameSite: "lax",
    default: () => null,
  });
  const lastRefreshAt = useState<number>("auth:heartbeat-last-refresh-at", () => 0);

  const hasStoredAuthHint = () => Boolean(authIndicator.value || sessionHint.hasHint.value);
  const hasRefreshContext = () => Boolean(hasStoredAuthHint() || session.isAuthenticated.value);

  const syncRefreshClock = () => {
    if (!hasRefreshContext()) {
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

    await router.push({
      path: "/auth/login",
      query: {
        reason: "session-expired",
      },
    });
  };

  const refreshIfDue = async () => {
    syncRefreshClock();

    if (!hasRefreshContext()) {
      return;
    }

    if (
      lastRefreshAt.value
      && Date.now() - lastRefreshAt.value < ACCESS_TOKEN_IDLE_WINDOW_MS
    ) {
      return;
    }

    const refreshed = await authRefresh.refresh({
      force: session.isAuthenticated.value,
    });
    if (refreshed) {
      lastRefreshAt.value = Date.now();
      return;
    }

    if (!hasStoredAuthHint()) {
      await expireSession();
    }
  };

  const onForeground = () => {
    if (document.visibilityState === "visible") {
      void refreshIfDue();
    }
  };

  watch(() => hasRefreshContext(), syncRefreshClock, { immediate: true });

  window.setInterval(() => {
    void refreshIfDue();
  }, HEARTBEAT_POLL_MS);

  window.addEventListener("focus", onForeground);
  document.addEventListener("visibilitychange", onForeground);
});
