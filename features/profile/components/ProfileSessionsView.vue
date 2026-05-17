<script setup lang="ts">
import type { ProfileSessionsPageState } from "~/features/profile/composables/useProfileSessionsPage";

const props = defineProps<{
  page: ProfileSessionsPageState;
}>();

const { confirmMode, confirmTitle, confirmDetail, actionPending, executeConfirm, closeConfirm, pending, error, currentSession, otherSessions, canRevokeOwnSessions, openConfirm, actionError } = props.page;

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};
</script>

<template>
  <div class="page-shell">
    <AppConfirm
      :open="confirmMode !== null"
      :title="confirmTitle"
      :detail="confirmDetail"
      confirm-label="Continue"
      tone="danger"
      :loading="actionPending !== ''"
      @confirm="executeConfirm"
      @cancel="closeConfirm"
    />
    <AppConfirm
      :open="actionErrorOpen"
      title="Session action failed"
      :detail="actionError"
      cancel-label="Close"
      tone="danger"
      hide-confirm
      @cancel="closeActionError"
    />

    <ProfileSessionsSummaryPanels
      :pending="pending"
      :error="error"
      :current-session="currentSession"
      :other-sessions-count="otherSessions.length"
      :can-revoke-own-sessions="canRevokeOwnSessions"
      :action-pending="actionPending"
      @confirm="openConfirm"
    />

    <ProfileSessionsDeviceListPanel
      :pending="pending"
      :error="error"
      :sessions="otherSessions"
      :can-revoke-own-sessions="canRevokeOwnSessions"
      :action-pending="actionPending"
      @confirm-device="(entry) => openConfirm('device', entry)"
    />

  </div>
</template>
