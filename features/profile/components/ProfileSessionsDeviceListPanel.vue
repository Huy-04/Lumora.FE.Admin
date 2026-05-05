<script setup lang="ts">
import type { SessionResponse } from "~/features/sessions/types";

defineProps<{
  pending: boolean;
  error: unknown;
  sessions: SessionResponse[];
  canRevokeOwnSessions: boolean;
  actionPending: "" | "current" | "device" | "others" | "all";
}>();

const emit = defineEmits<{
  confirmDevice: [session: SessionResponse];
}>();

const { enumLabel, formatDateTime, formatIpAddress } = useAuthPresentation();
</script>

<template>
  <AppPanel
    eyebrow="Other devices"
    title="Tracked device sessions"
    description="Every non-current device still capable of refreshing access for this account appears here."
  >
    <div v-if="pending" class="soft-card h-64 animate-pulse" />

    <AppNotice v-else-if="error" tone="danger" title="Unable to load sessions">
      {{ getProblemMessage(error, "The additional session list is unavailable.") }}
    </AppNotice>

    <div v-else-if="sessions.length" class="stack-list">
      <article
        v-for="entry in sessions"
        :key="entry.id"
        class="stack-card grid gap-5"
      >
        <div class="min-w-0 grid gap-4">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="table-title max-w-none">{{ entry.deviceName || "Unknown device" }}</p>
                <AppBadge :tone="entry.tokenStatus === 'Active' ? 'success' : 'danger'">
                  {{ enumLabel(entry.tokenStatus) }}
                </AppBadge>
              </div>
              <p class="table-copy max-w-none">{{ formatIpAddress(entry.ipAddress) }}</p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="info-tile">
              <p class="meta-label">Issued</p>
              <p class="meta-value">{{ formatDateTime(entry.issuedAt) }}</p>
            </div>
            <div class="info-tile">
              <p class="meta-label">Expires</p>
              <p class="meta-value">{{ formatDateTime(entry.expiresAt) }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-3 border-t border-line/70 pt-4 md:flex-row md:items-center md:justify-between">
            <p class="text-sm leading-relaxed text-smoke">
              Revoke this device if you no longer trust it to refresh access for the account.
            </p>
            <div class="flex justify-start md:justify-end">
              <AppButton
                v-if="canRevokeOwnSessions"
                :loading="actionPending === 'device'"
                variant="danger"
                class="table-action md:min-w-[136px]"
                @click="emit('confirmDevice', entry)"
              >
                Revoke
              </AppButton>
            </div>
          </div>
        </div>
      </article>
    </div>

    <AppEmptyState
      v-else
      title="No other active devices"
      detail="Only the current browser session remains active for this account."
    />
  </AppPanel>
</template>
