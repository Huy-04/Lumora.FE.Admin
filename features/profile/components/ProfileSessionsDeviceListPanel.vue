<script setup lang="ts">
import type { SessionResponse } from "~/features/sessions/types";

const props = defineProps<{
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

const pageSize = 5;
const currentPage = ref(1);
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
</script>

<template>
  <AppPanel
    eyebrow="Other devices"
  >
    <div v-if="pending" class="soft-card h-64 animate-pulse" />

    <AppNotice v-else-if="error" tone="danger" title="Unable to load sessions">
      {{ getProblemMessage(error, "The additional session list is unavailable.") }}
    </AppNotice>

    <div v-else-if="sessions.length" class="grid gap-3">
      <div class="grid gap-3">
        <article
          v-for="entry in pagedSessions"
          :key="entry.id"
          class="rounded-xl border border-line bg-surface px-5 py-4"
        >
          <div class="grid gap-4 xl:grid-cols-[minmax(240px,1fr)_minmax(360px,1.1fr)_auto] xl:items-center">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-base font-semibold tracking-tight text-ink">{{ entry.deviceName || "Unknown device" }}</p>
                <AppBadge :tone="entry.tokenStatus === 'Active' ? 'success' : 'danger'">
                  {{ enumLabel(entry.tokenStatus) }}
                </AppBadge>
              </div>
              <p class="mt-1 font-mono text-sm leading-6 text-smoke">{{ formatIpAddress(entry.ipAddress) }}</p>
            </div>

            <dl class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-line bg-surface-quiet px-4 py-3">
                <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-smoke">Issued</dt>
                <dd class="mt-1 text-sm font-semibold leading-6 text-ink">{{ formatDateTime(entry.issuedAt) }}</dd>
              </div>
              <div class="rounded-xl border border-line bg-surface-quiet px-4 py-3">
                <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-smoke">Expires</dt>
                <dd class="mt-1 text-sm font-semibold leading-6 text-ink">{{ formatDateTime(entry.expiresAt) }}</dd>
              </div>
            </dl>

            <AppButton
              v-if="canRevokeOwnSessions"
              :loading="actionPending === 'device'"
              variant="danger"
              class="justify-self-start xl:min-w-[136px] xl:justify-self-end"
              @click="emit('confirmDevice', entry)"
            >
              Revoke
            </AppButton>
          </div>
        </article>
      </div>

      <div v-if="totalPages > 1" class="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-smoke">
          Showing {{ pagedSessions.length }} of {{ sessions.length }} devices
        </p>
        <div class="flex items-center gap-2">
          <AppButton variant="secondary" :disabled="currentPage <= 1" @click="currentPage -= 1">
            Previous
          </AppButton>
          <span class="text-sm text-smoke">Page {{ currentPage }} / {{ totalPages }}</span>
          <AppButton variant="secondary" :disabled="currentPage >= totalPages" @click="currentPage += 1">
            Next
          </AppButton>
        </div>
      </div>
    </div>

    <AppEmptyState
      v-else
      title="No other active devices"
      detail="Only the current browser session remains active for this account."
    />
  </AppPanel>
</template>
