export default defineNuxtRouteMiddleware(async (to) => {
  const isAuthRoute = to.path.startsWith("/auth");
  const session = useAuthSession();
  const authz = useAdminAuthorization();
  const sessionHint = useSessionHint();
  const authIndicator = useCookie<string | null>("auth", {
    sameSite: "lax",
    default: () => null,
  });
  const hasRestoreHint = () => Boolean(authIndicator.value || sessionHint.hasHint.value || session.isAuthenticated.value);
  const resolveRedirectTarget = (redirect: unknown) => {
    if (typeof redirect !== "string") {
      return "/";
    }

    if (!redirect.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/auth")) {
      return "/";
    }

    return redirect;
  };
  const loginRedirect = () => navigateTo({
    path: "/auth/login",
    query: {
      redirect: to.fullPath,
    },
  });

  if (isAuthRoute) {
    if (to.path === "/auth/login" || to.path === "/auth") {
      if (!hasRestoreHint()) {
        if (to.query.reason !== "session-expired") {
          session.clear();
        }
        return;
      }

      const authenticated = await session.restore(false);
      if (authenticated) {
        return navigateTo(resolveRedirectTarget(to.query.redirect));
      }

      session.clear();
    }

    return;
  }

  if (!hasRestoreHint()) {
    session.clear();
    return loginRedirect();
  }

  const authenticated = await session.restore();
  if (!authenticated) {
    return loginRedirect();
  }

  if (!authz.can(ADMIN_PERMISSION.adminAccessAll)) {
    return navigateTo("/auth/access-denied");
  }

  if (!authz.canAccessPath(to.path)) {
    return navigateTo(authz.firstAccessiblePath());
  }
});
