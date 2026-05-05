import type { SessionResponse } from "~/features/sessions/types";

export const useProfileSessionsPage = async () => {
  const sessionsApi = useSessionsAdminApi();
  const authSession = useAuthSession();
  const authz = useAdminAuthorization();
  const identity = useDeviceIdentity();

  const canRevokeOwnSessions = computed(() =>
    authz.can([ADMIN_PERMISSION.refreshTokenRemoveAll, ADMIN_PERMISSION.refreshTokenRemoveSelf]),
  );

  const resolveUserId = async () => {
    if (authSession.user.value?.id) {
      return authSession.user.value.id;
    }

    const restored = await authSession.restore();

    if (!restored || !authSession.user.value?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Session unavailable",
      });
    }

    return authSession.user.value.id;
  };

  const { data, pending, error, refresh } = await useAsyncData("profile-sessions", async () => {
    const userId = await resolveUserId();
    return sessionsApi.getSessionsByUserId(userId);
  });

  type ConfirmMode = "current" | "device" | "others" | "all" | null;

  const confirmMode = ref<ConfirmMode>(null);
  const confirmSession = ref<SessionResponse | null>(null);
  const actionPending = ref<"" | "current" | "device" | "others" | "all">("");
  const actionSuccess = ref("");
  const actionError = ref("");

  const sessions = computed(() => data.value ?? []);
  const currentDeviceId = computed(() => identity.deviceId.value);
  const currentUser = computed(() => authSession.user.value);
  const isCurrentSession = (entry: SessionResponse) => entry.deviceId === currentDeviceId.value;
  const currentSession = computed(() => sessions.value.find(isCurrentSession) ?? null);
  const otherSessions = computed(() => sessions.value.filter((entry) => !isCurrentSession(entry)));


  const confirmTitle = computed(() => {
    if (confirmMode.value === "current") {
      return "Sign out this device?";
    }

    if (confirmMode.value === "device" && confirmSession.value) {
      return `Revoke ${confirmSession.value.deviceName || "this device"}?`;
    }

    if (confirmMode.value === "others") {
      return "Revoke all other devices?";
    }

    if (confirmMode.value === "all") {
      return "Sign out every device?";
    }

    return "";
  });

  const confirmDetail = computed(() => {
    if (confirmMode.value === "current") {
      return "This browser will be signed out immediately and you will need to log in again.";
    }

    if (confirmMode.value === "device") {
      return "The selected device will lose refresh access immediately.";
    }

    if (confirmMode.value === "others") {
      return "Every other active device will be removed, while this current browser stays available.";
    }

    if (confirmMode.value === "all") {
      return "All active devices, including this one, will be signed out.";
    }

    return "";
  });

  const openConfirm = (mode: Exclude<ConfirmMode, null>, session?: SessionResponse) => {
    confirmMode.value = mode;
    confirmSession.value = session ?? null;
  };

  const closeConfirm = () => {
    confirmMode.value = null;
    confirmSession.value = null;
  };

  const clearActionState = () => {
    actionSuccess.value = "";
    actionError.value = "";
  };

  const signOutCurrentDevice = async () => {
    actionPending.value = "current";
    try {
      await authSession.logout();
      await navigateTo("/auth/login");
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to sign out this device.");
    } finally {
      actionPending.value = "";
    }
  };

  const revokeSingleDevice = async (sessionEntry: SessionResponse) => {
    if (!currentUser.value?.id) {
      return;
    }

    actionPending.value = "device";
    try {
      await sessionsApi.revokeUserDevice({ userId: currentUser.value.id, deviceId: sessionEntry.deviceId });
      actionSuccess.value = "The selected device session was revoked.";
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to revoke the selected device session.");
    } finally {
      actionPending.value = "";
    }
  };

  const revokeOtherDevices = async () => {
    if (!currentUser.value?.id || !otherSessions.value.length) {
      return;
    }

    actionPending.value = "others";
    try {
      await Promise.all(
        otherSessions.value.map((entry) =>
          sessionsApi.revokeUserDevice({ userId: currentUser.value!.id, deviceId: entry.deviceId })),
      );
      actionSuccess.value = "All other devices were revoked.";
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to revoke one or more other device sessions.");
    } finally {
      actionPending.value = "";
    }
  };

  const signOutEveryDevice = async () => {
    if (!currentUser.value?.id) {
      return;
    }

    actionPending.value = "all";
    try {
      await sessionsApi.revokeAllUserTokens(currentUser.value.id);
      await authSession.logout();
      await navigateTo("/auth/login");
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to revoke every device session.");
    } finally {
      actionPending.value = "";
    }
  };

  const executeConfirm = async () => {
    const mode = confirmMode.value;
    const sessionEntry = confirmSession.value;

    closeConfirm();
    clearActionState();

    if (mode === "current") {
      await signOutCurrentDevice();
      return;
    }

    if (mode === "device" && sessionEntry) {
      await revokeSingleDevice(sessionEntry);
      return;
    }

    if (mode === "others") {
      await revokeOtherDevices();
      return;
    }

    if (mode === "all") {
      await signOutEveryDevice();
    }
  };

  return {
    confirmMode,
    confirmTitle,
    confirmDetail,
    actionPending,
    executeConfirm,
    closeConfirm,
    pending,
    error,
    currentSession,
    otherSessions,
    canRevokeOwnSessions,
    openConfirm,
    actionSuccess,
    actionError,
  };
};

export type ProfileSessionsPage = Awaited<ReturnType<typeof useProfileSessionsPage>>;
