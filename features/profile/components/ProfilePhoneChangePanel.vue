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
  completePhoneChange,
  confirmCurrentVerification,
  currentOtp,
  currentRemainingSeconds,
  currentVerificationHelper,
  form,
  newOtp,
  newRemainingSeconds,
  newVerificationHelper,
  phoneError,
  phoneFlowDescription,
  phonePending,
  phoneRegionOptions,
  phoneStep,
  requestCurrentVerification,
  requestNewPhoneVerification,
  resendCurrentVerification,
  resendNewPhoneVerification,
} = useProfilePhoneChangeFlow(props, () => emit("close"));
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
              <p class="text-lg font-semibold tracking-tight text-ink">Change phone</p>
              <p class="text-sm text-smoke">{{ phoneFlowDescription }}</p>
            </div>

            <div class="soft-card p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-smoke">Current phone</p>
              <p class="mt-2 text-sm font-medium text-ink">{{ user.phone || "Not provided" }}</p>
            </div>

            <div class="grid gap-4">
              <template v-if="phoneStep === 'idle'">
                <AppButton
                  :loading="phonePending"
                  class="w-full justify-center"
                  @click="requestCurrentVerification"
                >
                  Send recovery code
                </AppButton>
              </template>

              <template v-else-if="phoneStep === 'verify-current'">
                <AppOtpInput
                  v-model="currentOtp"
                  label="Current phone code"
                  :helper="currentVerificationHelper"
                  required
                />
                <div class="panel-action-row">
                  <AppButton :loading="phonePending" @click="confirmCurrentVerification">
                    Confirm current phone
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    :loading="phonePending"
                    :disabled="currentRemainingSeconds > 0"
                    @click="resendCurrentVerification"
                  >
                    {{ currentRemainingSeconds > 0 ? `Resend code (${currentRemainingSeconds}s)` : "Resend code" }}
                  </AppButton>
                </div>
              </template>

              <template v-else-if="phoneStep === 'enter-new'">
                <div class="grid gap-4 md:grid-cols-[minmax(9rem,0.55fr)_minmax(0,1fr)]">
                  <AppSelect
                    v-model="form.phoneRegion"
                    label="Phone region"
                    :options="phoneRegionOptions"
                  />
                  <AppInput
                    v-model="form.newPhone"
                    label="New phone number"
                    type="tel"
                    required
                  />
                </div>
                <div class="panel-action-row">
                  <AppButton :loading="phonePending" @click="requestNewPhoneVerification">
                    Send recovery code
                  </AppButton>
                </div>
              </template>

              <template v-else-if="phoneStep === 'confirm-new'">
                <div class="info-tile">
                  <p class="meta-label">New phone</p>
                  <p class="meta-value">{{ form.newPhone }}</p>
                </div>
                <AppOtpInput
                  v-model="newOtp"
                  label="New phone code"
                  :helper="newVerificationHelper"
                  required
                />
                <div class="panel-action-row">
                  <AppButton :loading="phonePending" @click="completePhoneChange">
                    Confirm new phone
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    :loading="phonePending"
                    :disabled="newRemainingSeconds > 0"
                    @click="resendNewPhoneVerification"
                  >
                    {{ newRemainingSeconds > 0 ? `Resend code (${newRemainingSeconds}s)` : "Resend code" }}
                  </AppButton>
                </div>
              </template>

              <template v-else>
                <AppNotice tone="success" title="Phone updated">
                  Change confirmed. Re-login required.
                </AppNotice>
              </template>
            </div>

            <AppNotice v-if="phoneError" tone="danger" title="Phone change failed">
              {{ phoneError }}
            </AppNotice>

            <div class="flex justify-end">
              <AppButton variant="ghost" @click="closeDialog">
                {{ phoneStep === 'done' ? 'Close' : 'Cancel' }}
              </AppButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
