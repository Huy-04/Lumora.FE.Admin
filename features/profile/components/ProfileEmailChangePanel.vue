<script setup lang="ts">
import type { UserResponse } from "~/features/users/types";

const props = defineProps<{
  open: boolean;
  user: UserResponse;
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const {
  closeDialog,
  completeEmailChange,
  confirmCurrentVerification,
  currentOtp,
  currentVerificationHelper,
  currentVerificationRemainingSeconds,
  emailError,
  emailFlowDescription,
  emailPending,
  emailStep,
  newEmail,
  newOtp,
  newVerificationHelper,
  newVerificationRemainingSeconds,
  requestCurrentVerification,
  requestNewEmailVerification,
  resendCurrentVerification,
  resendNewEmailVerification,
} = useProfileEmailChangeFlow(props, () => emit("close"));
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60"
          @click="closeDialog"
        />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="open"
            class="relative z-10 grid w-full max-w-2xl gap-5 soft-card px-7 py-7"
          >
            <div class="grid gap-1">
              <p class="text-lg font-semibold tracking-tight text-ink">Change email</p>
              <p class="text-sm text-smoke">{{ emailFlowDescription }}</p>
            </div>

            <div class="soft-card p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-smoke">Current email</p>
              <p class="mt-2 text-sm font-medium text-ink">{{ user.email }}</p>
            </div>

            <div class="grid gap-4">
              <template v-if="emailStep === 'idle'">
                <AppButton
                  :loading="emailPending"
                  class="w-full justify-center"
                  @click="requestCurrentVerification"
                >
                  Send recovery code
                </AppButton>
              </template>

              <template v-else-if="emailStep === 'verify-current'">
                <AppOtpInput
                  v-model="currentOtp"
                  label="Current email code"
                  :helper="currentVerificationHelper"
                  required
                />
                <div class="panel-action-row">
                  <AppButton :loading="emailPending" @click="confirmCurrentVerification">
                    Confirm current email
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    :loading="emailPending"
                    :disabled="currentVerificationRemainingSeconds > 0"
                    @click="resendCurrentVerification"
                  >
                    {{ currentVerificationRemainingSeconds > 0 ? `Resend code (${currentVerificationRemainingSeconds}s)` : "Resend code" }}
                  </AppButton>
                </div>
              </template>

              <template v-else-if="emailStep === 'enter-new'">
                <AppInput v-model="newEmail" label="New email" type="email" placeholder="new@example.com" required />
                <div class="panel-action-row">
                  <AppButton :loading="emailPending" @click="requestNewEmailVerification">
                    Send recovery code
                  </AppButton>
                </div>
              </template>

              <template v-else-if="emailStep === 'confirm-new'">
                <div class="info-tile">
                  <p class="meta-label">New inbox</p>
                  <p class="meta-value">{{ newEmail }}</p>
                </div>
                <AppOtpInput v-model="newOtp" label="New email code" required />
                <div class="panel-action-row">
                  <AppButton :loading="emailPending" @click="completeEmailChange">
                    Confirm new email
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    :loading="emailPending"
                    :disabled="newVerificationRemainingSeconds > 0"
                    @click="resendNewEmailVerification"
                  >
                    {{ newVerificationRemainingSeconds > 0 ? `Resend code (${newVerificationRemainingSeconds}s)` : "Resend code" }}
                  </AppButton>
                </div>
              </template>

              <template v-else>
                <AppNotice tone="success" title="Email updated">
                  Change confirmed. Re-login required.
                </AppNotice>
              </template>
            </div>

            <AppNotice v-if="emailError" tone="danger" title="Email change failed">
              {{ emailError }}
            </AppNotice>

            <div class="flex justify-end">
              <AppButton variant="ghost" @click="closeDialog">
                {{ emailStep === 'done' ? 'Close' : 'Cancel' }}
              </AppButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
