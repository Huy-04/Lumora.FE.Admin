<script setup lang="ts">
import type { SessionIndexPageState } from "~/features/sessions/composables/useSessionsIndexPage";

defineProps<{
  page: SessionIndexPageState;
}>();
</script>

<template>
  <AppIndexPage
    eyebrow="RefreshToken API"
    search-label="Active sessions"
    :total-items="page.summaryStats.value[0]?.value ?? 0"
    item-label="sessions"
    :pending="page.pending.value"
    :error="page.error.value ? 'Error loading data' : null"
    :error-detail="page.error.value ? getProblemMessage(page.error.value, 'The active session list is unavailable.') : ''"
    :action-error="page.actionError.value"
    action-error-title="Session action failed"
    :items-length="page.data.value?.length ?? 0"
    empty-title="No sessions found"
    empty-detail="There are no active sessions at this time."
  >
    <template #modals>
      <AppConfirm
        :open="page.confirmSession.value !== null"
        :title="page.confirmTitle.value"
        :detail="page.confirmDetail.value"
        :confirm-label="page.confirmLabel.value"
        tone="danger"
        :loading="page.actionPending.value !== ''"
        @confirm="page.executeSessionConfirm"
        @cancel="page.closeSessionConfirm"
      />
    </template>

    <template #actions>
      <AppButton variant="primary" @click="page.refresh">
        Refresh
      </AppButton>
    </template>

    <template #table>
      <table class="data-table min-w-[1460px]">
        <thead>
          <tr>
            <th class="min-w-[220px]">User</th>
            <th class="min-w-[250px]">Device</th>
            <th class="min-w-[150px]">IP</th>
            <th class="min-w-[200px]">Issued</th>
            <th class="min-w-[110px]">State</th>
            <th class="min-w-[420px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in page.data.value ?? []" :key="session.id">
            <td>
              <p class="font-semibold text-ink">{{ session.fullName || "Unknown user" }}</p>
              <p class="mt-1 break-all text-xs text-smoke">{{ session.email || session.userName || session.userId }}</p>
            </td>
            <td>
              <p class="font-semibold text-ink">{{ session.deviceName || "Unknown device" }}</p>
              <p class="mt-1 break-all text-xs font-mono text-smoke">{{ session.deviceId }}</p>
            </td>
            <td class="text-smoke">{{ page.formatIpAddress(session.ipAddress) }}</td>
            <td class="text-smoke">
              <p>{{ page.formatDateTime(session.issuedAt) }}</p>
              <p class="mt-1 text-xs">Expires {{ page.formatDateTime(session.expiresAt) }}</p>
            </td>
            <td>
              <AppBadge :tone="session.tokenStatus === 'Active' ? 'success' : 'danger'">
                {{ page.enumLabel(session.tokenStatus) }}
              </AppBadge>
            </td>
            <td>
              <div class="flex flex-nowrap gap-2 whitespace-nowrap">
                <NuxtLink
                  class="secondary-link"
                  :to="{ path: `/users/${session.userId}`, query: { tab: 'sessions' } }"
                >
                  Open
                </NuxtLink>
                <template v-if="page.canRevokeSessions.value && session.tokenStatus === 'Active'">
                  <AppButton
                    :loading="page.actionPending.value === 'revoke'"
                    class="table-action !min-w-[0] !px-3"
                    variant="secondary"
                    @click="page.revokeSession(session, 'revoke')"
                  >
                    Revoke
                  </AppButton>
                  <AppButton
                    :loading="page.actionPending.value === 'revoke-user'"
                    class="table-action !min-w-[0] !px-3"
                    variant="danger"
                    @click="page.revokeUser(session)"
                  >
                    Revoke All
                  </AppButton>
                  <AppButton
                    :loading="page.actionPending.value === 'force-logout'"
                    class="table-action !min-w-[0] !px-3"
                    variant="danger"
                    @click="page.forceLogout(session)"
                  >
                    Force Logout
                  </AppButton>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </AppIndexPage>
</template>
