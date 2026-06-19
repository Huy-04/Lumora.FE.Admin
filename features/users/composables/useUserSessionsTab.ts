import type { SessionResponse } from "~/features/sessions/types/sessions";

type ConfirmAction = "revoke-device" | "revoke-all" | null;

export const useUserSessionsTab = (
  props: {
    userId: string;
    sessions: SessionResponse[];
  },
  onRefresh: () => void,
) => {
  const sessionsApi = useSessionsAdminApi();
  const usersApi = useUsersAdminApi();
  const authz = useAdminAuthorization();
  const { enumLabel, formatDateTime, formatIpAddress } = useAuthPresentation();

  const canRevokeSessions = computed(() => authz.can(ADMIN_PERMISSION.refreshTokenRemoveAll));
  const actionPending = ref<"" | "revoke-device" | "revoke-all">("");
  const actionError = ref("");
  const confirmAction = ref<ConfirmAction>(null);
  const confirmMeta = ref<{ id?: string }>({});
  const pageSize = 5;
  const currentPage = ref(1);

  const actionErrorOpen = computed(() => actionError.value.length > 0);

  const closeActionError = () => {
    actionError.value = "";
  };

  const totalPages = computed(() => Math.max(1, Math.ceil(props.sessions.length / pageSize)));
  const pagedSessions = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return props.sessions.slice(start, start + pageSize);
  });

  watch(
    () => props.sessions.length,
    () => {
      currentPage.value = Math.min(currentPage.value, totalPages.value);
    },
  );

  const confirmConfig = computed(() => {
    if (confirmAction.value === "revoke-device") {
      return {
        title: "Revoke device session?",
        detail: "The selected device will be signed out immediately.",
        confirmLabel: "Revoke",
        tone: "danger" as const,
      };
    }

    if (confirmAction.value === "revoke-all") {
      return {
        title: "Revoke all devices?",
        detail: "This will sign the user out of every active device.",
        confirmLabel: "Revoke all devices",
        tone: "danger" as const,
      };
    }

    return {
      title: "",
      detail: "",
      confirmLabel: "Confirm",
      tone: "default" as const,
    };
  });

  const openConfirm = (action: ConfirmAction, meta: { id?: string } = {}) => {
    confirmAction.value = action;
    confirmMeta.value = meta;
  };

  const closeConfirm = () => {
    confirmAction.value = null;
    confirmMeta.value = {};
  };

  const executeConfirm = async () => {
    const action = confirmAction.value;
    const id = confirmMeta.value.id ?? "";

    closeConfirm();
    actionError.value = "";

    if (action === "revoke-device") {
      actionPending.value = "revoke-device";
      try {
        await sessionsApi.revokeUserDevice({ userId: props.userId, deviceId: id });
        onRefresh();
      } catch (requestError) {
        actionError.value = getProblemMessage(requestError, "Unable to revoke the device session.");
      } finally {
        actionPending.value = "";
      }
    }

    if (action === "revoke-all") {
      actionPending.value = "revoke-all";
      try {
        await usersApi.forceLogoutUser(props.userId);
        onRefresh();
      } catch (requestError) {
        actionError.value = getProblemMessage(requestError, "Unable to force logout this user.");
      } finally {
        actionPending.value = "";
      }
    }
  };

  return {
    actionError,
    actionErrorOpen,
    actionPending,
    canRevokeSessions,
    closeActionError,
    closeConfirm,
    confirmAction,
    confirmConfig,
    currentPage,
    enumLabel,
    executeConfirm,
    formatDateTime,
    formatIpAddress,
    openConfirm,
    pagedSessions,
    totalPages,
  };
};
