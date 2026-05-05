<script setup lang="ts">
import type { SessionResponse } from "~/features/sessions/types";

const props = defineProps<{
  userId: string;
  sessions: SessionResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const sessionsApi = useSessionsAdminApi();
const usersApi = useUsersAdminApi();
const authz = useAdminAuthorization();
const { enumLabel, formatIpAddress } = useAuthPresentation();
const canRevokeSessions = computed(() => authz.can(ADMIN_PERMISSION.refreshTokenRemoveAll));

const actionPending = ref<"" | "revoke-device" | "revoke-all">("");
const actionError = ref("");
const actionSuccess = ref("");

// ── Confirm dialog ────────────────────────────────────────────────────────
type ConfirmAction = "revoke-device" | "revoke-all" | null;
const confirmAction = ref<ConfirmAction>(null);
const confirmMeta = ref<{ id?: string; label?: string }>({});

const confirmConfig = computed(() => {
  if (confirmAction.value === "revoke-device") {
    return { title: "Revoke device session?", detail: "The selected device will be signed out immediately.", confirmLabel: "Revoke", tone: "danger" as const };
  }
  if (confirmAction.value === "revoke-all") {
    return { title: "Force logout user?", detail: "This will sign the user out of every active device.", confirmLabel: "Force logout", tone: "danger" as const };
  }
  return { title: "", detail: "", confirmLabel: "Confirm", tone: "default" as const };
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
  actionSuccess.value = "";

  if (action === "revoke-device") {
    actionPending.value = "revoke-device";
    try {
      await sessionsApi.revokeUserDevice({ userId: props.userId, deviceId: id });
      actionSuccess.value = "Device session revoked.";
      emit("refresh");
    } catch (err) {
      actionError.value = getProblemMessage(err, "Unable to revoke the device session.");
    } finally {
      actionPending.value = "";
    }
  }

  if (action === "revoke-all") {
    actionPending.value = "revoke-all";
    try {
      await usersApi.forceLogoutUser(props.userId);
      actionSuccess.value = "User was signed out of every active device.";
      emit("refresh");
    } catch (err) {
      actionError.value = getProblemMessage(err, "Unable to force logout this user.");
    } finally {
      actionPending.value = "";
    }
  }
};
</script>

<template>
  <AppPanel
    title="Sessions"
    description="Review active device sessions and revoke one device or all sessions for this user."
  >
    <AppConfirm
      :open="confirmAction !== null"
      :title="confirmConfig.title"
      :detail="confirmConfig.detail"
      :confirm-label="confirmConfig.confirmLabel"
      :tone="confirmConfig.tone"
      :loading="actionPending !== ''"
      @confirm="executeConfirm"
      @cancel="closeConfirm"
    />

    <div v-if="canRevokeSessions" class="mb-4 flex flex-wrap justify-end gap-3">
      <AppButton :loading="actionPending === 'revoke-all'" variant="secondary" @click="openConfirm('revoke-all')">
        Force logout
      </AppButton>
    </div>

    <div v-if="sessions.length" class="stack-list">
      <article
        v-for="entry in sessions"
        :key="entry.id"
        class="stack-card grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
      >
        <div class="min-w-0">
          <div>
            <div class="flex items-center gap-3">
              <p class="table-title">{{ entry.deviceName || "Unknown device" }}</p>
              <AppBadge :tone="entry.tokenStatus === 'Active' ? 'success' : 'danger'">
                {{ enumLabel(entry.tokenStatus) }}
              </AppBadge>
            </div>
            <p class="stack-card-copy break-all font-mono text-xs mt-1">{{ entry.deviceId }}</p>
          </div>

          <div class="mt-4 grid gap-2 text-sm text-smoke">
            <p>{{ formatIpAddress(entry.ipAddress) }}</p>
            <p>Expires {{ entry.expiresAt ? new Date(entry.expiresAt).toLocaleString("en-GB") : "Not available" }}</p>
          </div>
        </div>

        <div class="flex items-start md:justify-end">
          <AppButton
            v-if="canRevokeSessions"
            :loading="actionPending === 'revoke-device'"
            class="table-action md:min-w-[112px]"
            variant="danger"
            @click="openConfirm('revoke-device', { id: entry.deviceId })"
          >
            Revoke
          </AppButton>
        </div>
      </article>
    </div>

    <AppEmptyState
      v-else
      title="No active sessions"
      detail="There are no active refresh-token sessions for this user."
    />

    <AppNotice v-if="actionSuccess" tone="success" title="Session action completed" class="mt-4">
      {{ actionSuccess }}
    </AppNotice>

    <AppNotice v-if="actionError" tone="danger" title="Session action failed" class="mt-4">
      {{ actionError }}
    </AppNotice>
  </AppPanel>
</template>
