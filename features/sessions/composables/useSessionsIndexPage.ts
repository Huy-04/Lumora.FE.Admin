import type { SessionResponse } from "~/features/sessions/types";

export const useSessionsIndexPage = async () => {
  const sessionsApi = useSessionsAdminApi();
  const authz = useAdminAuthorization();
  const { enumLabel, formatDateTime, formatIpAddress } = useAuthPresentation();
  const canRevokeSessions = computed(() => authz.can(ADMIN_PERMISSION.refreshTokenRemoveAll));

  const actionPending = ref<"" | "revoke" | "revoke-device" | "revoke-user">("");
  const actionError = ref("");

  const { data, pending, error, refresh } = await useAsyncData("sessions-index", async () => {
    const sessions = await sessionsApi.getSessions();
    return sessions
      .sort((left, right) => new Date(right.issuedAt).getTime() - new Date(left.issuedAt).getTime());
  });

  const confirmSession = ref<SessionResponse | null>(null);
  const confirmMode = ref<"revoke" | "revoke-user" | null>(null);

  const confirmTitle = computed(() => {
    if (!confirmSession.value) return "";
    if (confirmMode.value === "revoke-user") return `Revoke all sessions for ${confirmSession.value.fullName}?`;
    return `Revoke session for ${confirmSession.value.fullName}?`;
  });

  const confirmDetail = computed(() => {
    if (confirmMode.value === "revoke-user") return "This will sign the user out of every active device.";
    return "The selected device session will be terminated immediately.";
  });

  const openRevokeConfirm = (session: SessionResponse, mode: "revoke" | "revoke-user") => {
    confirmSession.value = session;
    confirmMode.value = mode;
  };

  const closeSessionConfirm = () => {
    confirmSession.value = null;
    confirmMode.value = null;
  };

  const revokeSession = async (session: SessionResponse, mode: "revoke" | "revoke-device") => {
    openRevokeConfirm(session, "revoke");
  };

  const revokeUser = async (session: SessionResponse) => {
    openRevokeConfirm(session, "revoke-user");
  };

  const executeSessionConfirm = async () => {
    const session = confirmSession.value;
    const mode = confirmMode.value;
    if (!session || !mode) return;

    closeSessionConfirm();
    actionError.value = "";

    if (mode === "revoke") {
      actionPending.value = "revoke";
      try {
        await sessionsApi.revokeUserDevice({ userId: session.userId, deviceId: session.deviceId });
        await refresh();
      } catch (err) {
        actionError.value = getProblemMessage(err, "Unable to revoke the selected device session.");
      } finally {
        actionPending.value = "";
      }
    }

    if (mode === "revoke-user") {
      actionPending.value = "revoke-user";
      try {
        await sessionsApi.revokeAllUserTokens(session.userId);
        await refresh();
      } catch (err) {
        actionError.value = getProblemMessage(err, "Unable to revoke the selected user sessions.");
      } finally {
        actionPending.value = "";
      }
    }
  };

  const summaryStats = computed(() => {
    const items = data.value ?? [];

    return [
      {
        label: "Total sessions",
        value: `${items.length}`,
        detail: "All device-linked refresh sessions on record.",
      },
      {
        label: "Active",
        value: `${items.filter((s) => s.tokenStatus === "Active").length}`,
        detail: "Sessions currently valid and unexpired.",
      },
      {
        label: "Expired",
        value: `${items.filter((s) => s.tokenStatus !== "Active").length}`,
        detail: "Sessions that have expired or been revoked.",
      },
      {
        label: "Users",
        value: `${new Set(items.map((s) => s.userId)).size}`,
        detail: "Distinct user accounts with at least one session.",
      },
    ];
  });

  return {
    actionError,
    actionPending,
    canRevokeSessions,
    closeSessionConfirm,
    confirmDetail,
    confirmSession,
    confirmTitle,
    data,
    enumLabel,
    error,
    executeSessionConfirm,
    formatDateTime,
    formatIpAddress,
    pending,
    refresh,
    revokeSession,
    revokeUser,
    summaryStats,
  };
};

export type SessionsIndexPage = Awaited<ReturnType<typeof useSessionsIndexPage>>;
