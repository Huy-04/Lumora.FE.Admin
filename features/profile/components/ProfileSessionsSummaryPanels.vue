<script setup lang="ts">
import { PhShieldCheck, PhSignOut } from "@phosphor-icons/vue";
import type { SessionResponse } from "~/features/sessions/types/sessions";

const props = defineProps<{
  pending: boolean;
  error: unknown;
  currentSession: SessionResponse | null;
  otherSessionsCount: number;
  canRevokeOwnSessions: boolean;
  actionPending: "" | "current" | "device" | "others" | "all";
}>();

const emit = defineEmits<{
  confirm: [mode: "current" | "others" | "all"];
}>();

const identity = useDeviceIdentity();
const { formatDateTime, formatIpAddress } = useAuthPresentation();
</script>

<template>
  <div>
    <AppPanel eyebrow="Session controls">
      <div v-if="pending" class="soft-card h-56 animate-pulse" />

      <AppNotice v-else-if="error" tone="danger" title="Unable to load sessions">
        {{ getProblemMessage(error, "The current session inventory is unavailable.") }}
      </AppNotice>

      <div v-else-if="currentSession" class="rounded-xl border border-line bg-surface">
        <div class="grid gap-4 border-b border-line/70 px-5 py-4">
          <div class="flex min-w-0 items-center gap-3">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-pearl text-ink dark:bg-white/8">
              <PhShieldCheck :size="20" />
            </div>
            <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
              <p class="text-xs uppercase tracking-[0.16em] text-smoke">Tracked device</p>
              <p class="text-base font-semibold tracking-tight text-ink">
                {{ currentSession.deviceName || identity.deviceName }}
              </p>
              <AppBadge tone="success">Current</AppBadge>
            </div>
          </div>

          <div class="grid gap-3">
            <dl class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-line bg-surface-quiet px-4 py-3">
                <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-smoke">IP address</dt>
                <dd class="mt-1 font-mono text-sm leading-6 text-ink">{{ formatIpAddress(currentSession.ipAddress) }}</dd>
              </div>
              <div class="rounded-xl border border-line bg-surface-quiet px-4 py-3">
                <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-smoke">Issued</dt>
                <dd class="mt-1 text-sm font-semibold leading-6 text-ink">{{ formatDateTime(currentSession.issuedAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="grid gap-3 px-5 py-4 xl:grid-cols-2">
          <div class="grid gap-4 rounded-xl border border-line bg-surface-quiet px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div class="flex items-center gap-3">
              <div class="grid h-10 w-10 place-items-center rounded-xl border border-line bg-pearl text-ink dark:bg-white/8">
                <PhShieldCheck :size="20" />
              </div>
              <p class="text-sm font-semibold text-ink">Sign out other devices</p>
            </div>
            <AppButton
              v-if="canRevokeOwnSessions"
              :loading="actionPending === 'others'"
              :disabled="otherSessionsCount === 0"
              variant="secondary"
              class="justify-self-start"
              @click="emit('confirm', 'others')"
            >
              Revoke other devices
            </AppButton>
          </div>

          <div class="grid gap-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div class="flex items-center gap-3">
              <div class="grid h-10 w-10 place-items-center rounded-xl border border-danger/20 bg-danger/10 text-danger dark:border-danger/30 dark:bg-danger/12">
                <PhSignOut :size="20" />
              </div>
              <p class="text-sm font-semibold text-ink">Sign out everywhere</p>
            </div>
            <AppButton
              v-if="canRevokeOwnSessions"
              :loading="actionPending === 'all'"
              variant="danger"
              class="justify-self-start"
              @click="emit('confirm', 'all')"
            >
              Revoke all devices
            </AppButton>
          </div>
        </div>
      </div>

      <div v-else>
        <AppEmptyState
          title="Current device not identified"
          detail="Lumora could not match this browser to a tracked refresh session yet."
        />
      </div>
    </AppPanel>
  </div>
</template>
