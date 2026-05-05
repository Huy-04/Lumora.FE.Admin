<script setup lang="ts">
import type { UserResponse } from "~/features/users/types";

type VerificationStep = "idle" | "verify" | "done";

const props = defineProps<{
  open: boolean;
  user: UserResponse;
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const authApi = useAuthApi();
const otpCooldown = useOtpResendCooldown();

const createOtpCode = () => Array.from({ length: 6 }, () => "");

const verificationCooldownKey = computed(() => `phone-verification:${props.user.id}`);
const verificationStep = ref<VerificationStep>("idle");
const verificationPending = ref(false);
const verificationSubmitPending = ref(false);
const verificationError = ref("");
const verificationSuccess = ref("");
const verificationOtp = ref<string[]>(createOtpCode());

const verificationOtpValue = computed(() => verificationOtp.value.join("").trim());
const remainingSeconds = computed(() => otpCooldown.getRemainingSeconds(verificationCooldownKey.value));
const verificationHelper = computed(() =>
  remainingSeconds.value > 0
    ? `You can request another code in ${remainingSeconds.value} seconds.`
    : "Enter the latest SMS code, or request a new one below.",
);

const resetVerification = () => {
  verificationStep.value = props.user.phoneStatus === "Verified" ? "done" : "idle";
  verificationError.value = "";
  verificationSuccess.value = "";
  verificationOtp.value = createOtpCode();
};

const closeDialog = () => {
  resetVerification();
  emit("close");
};

const startVerification = async () => {
  verificationError.value = "";
  verificationSuccess.value = "";

  if (remainingSeconds.value > 0) {
    verificationStep.value = "verify";
    return;
  }

  verificationPending.value = true;

  try {
    await authApi.resendPhoneOtp();
    otpCooldown.startCooldown(verificationCooldownKey.value);
    verificationStep.value = "verify";
    verificationSuccess.value = "A verification code has been sent to your phone.";
  } catch (requestError) {
    otpCooldown.syncFromError(verificationCooldownKey.value, requestError);
    verificationError.value = getProblemMessage(requestError, "Unable to send the phone verification code.");
  } finally {
    verificationPending.value = false;
  }
};

const resendVerification = async () => {
  verificationPending.value = true;
  verificationError.value = "";
  verificationSuccess.value = "";

  try {
    await authApi.resendPhoneOtp();
    otpCooldown.startCooldown(verificationCooldownKey.value);
    verificationOtp.value = createOtpCode();
    verificationSuccess.value = "A new verification code has been sent to your phone.";
  } catch (requestError) {
    otpCooldown.syncFromError(verificationCooldownKey.value, requestError);
    verificationError.value = getProblemMessage(requestError, "Unable to send another phone verification code.");
  } finally {
    verificationPending.value = false;
  }
};

const submitVerification = async () => {
  verificationSubmitPending.value = true;
  verificationError.value = "";
  verificationSuccess.value = "";

  try {
    await authApi.verifyPhoneOtp({ otp: verificationOtpValue.value });
    verificationOtp.value = createOtpCode();
    verificationStep.value = "done";
    verificationSuccess.value = "Phone verified successfully.";
    emit("updated");
  } catch (requestError) {
    verificationError.value = getProblemMessage(requestError, "Unable to verify the phone code.");
  } finally {
    verificationSubmitPending.value = false;
  }
};

watch(
  () => props.user.phoneStatus,
  (phoneStatus) => {
    if (phoneStatus === "Verified") {
      verificationStep.value = "done";
    }
  },
);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      resetVerification();
      return;
    }

    verificationStep.value = props.user.phoneStatus === "Verified" ? "done" : "idle";
  },
  { immediate: true },
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
              <p class="text-lg font-semibold tracking-tight text-ink">Verify phone</p>
              <p class="text-sm text-smoke">
                Confirm your phone number with the latest SMS OTP code.
              </p>
            </div>

            <div class="soft-card p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-smoke">Current phone</p>
              <p class="mt-2 text-sm font-medium text-ink">{{ user.phone || "Not provided" }}</p>
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
                <AppNotice tone="success" title="Phone verified">
                  {{ verificationSuccess || "Your phone number has been verified successfully." }}
                </AppNotice>
                <AppButton class="justify-self-start" @click="closeDialog">
                  Done
                </AppButton>
              </template>
            </div>

            <AppNotice v-if="verificationError" tone="danger" title="Phone verification failed">
              {{ verificationError }}
            </AppNotice>

            <div class="flex justify-end">
              <AppButton variant="ghost" @click="closeDialog">
                {{ verificationStep === "done" ? "Close" : "Cancel" }}
              </AppButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
