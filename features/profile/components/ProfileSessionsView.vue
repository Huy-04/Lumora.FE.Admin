<script setup lang="ts">
import type { ProfileSessionsPage } from "~/features/profile/composables/useProfileSessionsPage";

const props = defineProps<{
  page: ProfileSessionsPage;
}>();

const { confirmMode, confirmTitle, confirmDetail, actionPending, executeConfirm, closeConfirm, pending, error, currentSession, otherSessions, canRevokeOwnSessions, openConfirm, actionSuccess, actionError } = props.page;
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

    <AppNotice v-if="actionSuccess" tone="success" title="Session action completed">
      {{ actionSuccess }}
    </AppNotice>

    <AppNotice v-if="actionError" tone="danger" title="Session action failed">
      {{ actionError }}
    </AppNotice>
  </div>
</template>
