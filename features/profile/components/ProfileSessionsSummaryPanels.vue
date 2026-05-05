<script setup lang="ts">
import { PhShieldCheck, PhSignOut } from "@phosphor-icons/vue";
import type { SessionResponse } from "~/features/sessions/types";

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
  <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
    <AppPanel
      eyebrow="Current device"
      title="This browser"
      description="Use this when you need to immediately end the session for the device you are using right now."
    >
      <div v-if="pending" class="soft-card h-56 animate-pulse" />

      <AppNotice v-else-if="error" tone="danger" title="Unable to load sessions">
        {{ getProblemMessage(error, "The current session inventory is unavailable.") }}
      </AppNotice>

      <div v-else-if="currentSession" class="grid gap-4">
        <div class="soft-card grid gap-4 p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-smoke">Tracked device</p>
              <p class="mt-2 text-lg font-semibold tracking-tight text-ink">
                {{ currentSession.deviceName || identity.deviceName }}
              </p>
            </div>
            <AppBadge tone="success">Current</AppBadge>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="info-tile">
              <p class="meta-label">IP address</p>
              <p class="meta-value">{{ formatIpAddress(currentSession.ipAddress) }}</p>
            </div>
            <div class="info-tile">
              <p class="meta-label">Issued</p>
              <p class="meta-value">{{ formatDateTime(currentSession.issuedAt) }}</p>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <p class="text-sm leading-relaxed text-smoke">
              Signing out this device clears the local cookies here and blacklists the current access token immediately.
            </p>
            <AppButton
              v-if="canRevokeOwnSessions"
              :loading="actionPending === 'current'"
              variant="danger"
              class="md:min-w-[190px]"
              @click="emit('confirm', 'current')"
            >
              Sign out this device
            </AppButton>
          </div>
        </div>
      </div>

      <AppEmptyState
        v-else
        title="Current device not identified"
        detail="Lumora could not match this browser to a tracked refresh session yet."
      />
    </AppPanel>

    <AppPanel
      eyebrow="Safety controls"
      title="Quick lockdown actions"
      description="Use broader revocation actions when you suspect an old browser or a lost device still has access."
    >
      <div class="grid gap-4">
        <div class="soft-card grid gap-3 p-5">
          <div class="flex items-center gap-3">
            <div class="grid h-11 w-11 place-items-center rounded-2xl border border-line bg-pearl text-ink dark:bg-white/8">
              <PhShieldCheck :size="22" />
            </div>
            <div>
              <p class="text-sm font-semibold text-ink">Sign out other devices</p>
              <p class="mt-1 text-xs leading-relaxed text-smoke">
                Keep this browser active while revoking every other tracked device.
              </p>
            </div>
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

        <div class="soft-card grid gap-3 p-5">
          <div class="flex items-center gap-3">
            <div class="grid h-11 w-11 place-items-center rounded-2xl border border-danger/20 bg-danger/10 text-danger dark:border-danger/30 dark:bg-danger/12">
              <PhSignOut :size="22" />
            </div>
            <div>
              <p class="text-sm font-semibold text-ink">Sign out everywhere</p>
              <p class="mt-1 text-xs leading-relaxed text-smoke">
                Ends every active session for this account, including the current browser.
              </p>
            </div>
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
    </AppPanel>
  </div>
</template>
