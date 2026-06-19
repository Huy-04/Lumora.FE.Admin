<script setup lang="ts">
import type { UserResponse } from "~/features/users/types/users";

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
  remainingSeconds,
  resendVerification,
  startVerification,
  submitVerification,
  verificationError,
  verificationHelper,
  verificationOtp,
  verificationPending,
  verificationStep,
  verificationSubmitPending,
  verificationSuccess,
} = useProfileEmailVerificationFlow(
  props,
  () => emit("close"),
  () => emit("updated"),
);
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
              <p class="text-lg font-semibold tracking-tight text-ink">Verify email</p>
              <p class="text-sm text-smoke">
                Confirm your inbox with the latest OTP code.
              </p>
            </div>

            <div class="soft-card p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-smoke">Current email</p>
              <p class="mt-2 text-sm font-medium text-ink">{{ user.email }}</p>
            </div>

            <div class="grid gap-4">
              <template v-if="verificationStep === 'idle'">
                <AppButton
                  :loading="verificationPending"
                  class="w-full justify-center"
                  @click="startVerification"
                >
                  Send recovery code
                </AppButton>
              </template>

              <template v-else-if="verificationStep === 'verify'">
                <AppOtpInput
                  v-model="verificationOtp"
                  label="Verification code"
                  :helper="verificationHelper"
                  required
                />
                <div class="panel-action-row">
                  <AppButton :loading="verificationSubmitPending" @click="submitVerification">
                    Verify now
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    :loading="verificationPending"
                    :disabled="remainingSeconds > 0"
                    @click="resendVerification"
                  >
                    {{ remainingSeconds > 0 ? `Resend code (${remainingSeconds}s)` : "Resend code" }}
                  </AppButton>
                </div>
              </template>

              <template v-else>
                <AppNotice tone="success" title="Email verified">
                  {{ verificationSuccess || "Your email has been verified successfully." }}
                </AppNotice>
                <AppButton class="justify-self-start" @click="closeDialog">
                  Done
                </AppButton>
              </template>
            </div>

            <AppNotice v-if="verificationError" tone="danger" title="Email verification failed">
              {{ verificationError }}
            </AppNotice>

            <div class="flex justify-end">
              <AppButton variant="ghost" @click="closeDialog">
                {{ verificationStep === 'done' ? 'Close' : 'Cancel' }}
              </AppButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
