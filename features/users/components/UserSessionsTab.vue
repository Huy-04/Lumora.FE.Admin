<script setup lang="ts">
import { PhShieldCheck, PhSignOut } from "@phosphor-icons/vue";
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
const { enumLabel, formatDateTime, formatIpAddress } = useAuthPresentation();
const canRevokeSessions = computed(() => authz.can(ADMIN_PERMISSION.refreshTokenRemoveAll));

const actionPending = ref<"" | "revoke-device" | "revoke-all">("");
const actionError = ref("");

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};

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

// ── Confirm dialog ────────────────────────────────────────────────────────
type ConfirmAction = "revoke-device" | "revoke-all" | null;
const confirmAction = ref<ConfirmAction>(null);
const confirmMeta = ref<{ id?: string; label?: string }>({});

const confirmConfig = computed(() => {
  if (confirmAction.value === "revoke-device") {
    return { title: "Revoke device session?", detail: "The selected device will be signed out immediately.", confirmLabel: "Revoke", tone: "danger" as const };
  }
  if (confirmAction.value === "revoke-all") {
    return { title: "Revoke all devices?", detail: "This will sign the user out of every active device.", confirmLabel: "Revoke all devices", tone: "danger" as const };
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

  if (action === "revoke-device") {
    actionPending.value = "revoke-device";
    try {
      await sessionsApi.revokeUserDevice({ userId: props.userId, deviceId: id });
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
  <AppPanel eyebrow="Sessions">
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
    <AppConfirm
      :open="actionErrorOpen"
      title="Session action failed"
      :detail="actionError"
      cancel-label="Close"
      tone="danger"
      hide-confirm
      @cancel="closeActionError"
    />

    <div v-if="sessions.length" class="grid gap-3">
      <div class="grid gap-3">
        <article
          v-for="entry in pagedSessions"
          :key="entry.id"
          class="rounded-xl border border-line bg-surface"
        >
          <div class="grid gap-4 border-b border-line/70 px-5 py-4 xl:grid-cols-[minmax(240px,0.7fr)_minmax(520px,1.4fr)_auto] xl:items-center">
            <div class="flex min-w-0 items-center gap-3">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-pearl text-ink dark:bg-white/8">
                <PhShieldCheck :size="20" />
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-base font-semibold tracking-tight text-ink">{{ entry.deviceName || "Unknown device" }}</p>
                  <AppBadge :tone="entry.tokenStatus === 'Active' ? 'success' : 'danger'">
                    {{ enumLabel(entry.tokenStatus) }}
                  </AppBadge>
                </div>
                <p class="mt-1 break-all font-mono text-xs leading-5 text-smoke">{{ entry.deviceId }}</p>
              </div>
            </div>

            <dl class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-xl border border-line bg-surface-quiet px-4 py-3">
                <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-smoke">IP address</dt>
                <dd class="mt-1 font-mono text-sm font-semibold leading-6 text-ink">{{ formatIpAddress(entry.ipAddress) }}</dd>
              </div>
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
              v-if="canRevokeSessions && entry.tokenStatus === 'Active'"
              :loading="actionPending === 'revoke-device'"
              class="justify-self-start xl:min-w-[112px] xl:justify-self-end"
              variant="danger"
              @click="openConfirm('revoke-device', { id: entry.deviceId })"
            >
              Revoke
            </AppButton>
          </div>
        </article>
      </div>

      <div class="grid gap-3 rounded-xl border border-danger/20 bg-danger/5 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div class="flex items-center gap-3">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-danger/20 bg-danger/10 text-danger dark:border-danger/30 dark:bg-danger/12">
            <PhSignOut :size="20" />
          </div>
          <p class="text-sm font-semibold text-ink">Sign out everywhere</p>
        </div>
        <AppButton
          v-if="canRevokeSessions"
          :loading="actionPending === 'revoke-all'"
          variant="danger"
          class="justify-self-start lg:justify-self-end"
          @click="openConfirm('revoke-all')"
        >
          Revoke all devices
        </AppButton>
      </div>

      <div class="flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-3">
          <p class="text-sm text-smoke">
            Showing {{ pagedSessions.length }} of {{ sessions.length }} sessions
          </p>
          <div v-if="totalPages > 1" class="flex items-center gap-2">
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
    </div>

    <AppEmptyState
      v-else
      title="No active sessions"
      detail="There are no active refresh-token sessions for this user."
    />

  </AppPanel>
</template>
