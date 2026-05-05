<script setup lang="ts">
import type { UserResponse } from "~/features/users/types";

type EmailStep = "idle" | "verify-current" | "enter-new" | "confirm-new" | "done";

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
const currentEmailCooldownKey = computed(() => `${props.user.id}:change-email:current`);
const newEmailCooldownKey = computed(() => `${props.user.id}:change-email:new`);

const emailStep = ref<EmailStep>("idle");
const emailPending = ref(false);
const emailError = ref("");
const currentOtp = ref<string[]>(createOtpCode());
const newEmail = ref("");
const newOtp = ref<string[]>(createOtpCode());

const currentOtpValue = computed(() => currentOtp.value.join("").trim());
const newOtpValue = computed(() => newOtp.value.join("").trim());
const currentVerificationRemainingSeconds = computed(() => otpCooldown.getRemainingSeconds(currentEmailCooldownKey.value));
const newVerificationRemainingSeconds = computed(() => otpCooldown.getRemainingSeconds(newEmailCooldownKey.value));

const emailFlowDescription = computed(() => {
  switch (emailStep.value) {
    case "verify-current":
      return "Enter the code from your current email.";
    case "enter-new":
      return "Enter the email you want to use.";
    case "confirm-new":
      return `Enter the code sent to ${newEmail.value || "the new email"}.`;
    case "done":
      return "Email updated successfully.";
    default:
      return "Confirm both inboxes before switching.";
  }
});
const currentVerificationHelper = computed(() =>
  currentVerificationRemainingSeconds.value > 0
    ? `You can request another code in ${currentVerificationRemainingSeconds.value} seconds.`
    : "Enter the latest code from your current inbox, or request a new one below.",
);
const newVerificationHelper = computed(() =>
  newVerificationRemainingSeconds.value > 0
    ? `You can request another code in ${newVerificationRemainingSeconds.value} seconds.`
    : "Enter the latest code from your new inbox, or request a new one below.",
);

const requestCurrentVerification = async () => {
  if (currentVerificationRemainingSeconds.value > 0) {
    emailStep.value = "verify-current";
    return;
  }

  emailPending.value = true;
  emailError.value = "";

  try {
    currentOtp.value = createOtpCode();
    newEmail.value = "";
    newOtp.value = createOtpCode();
    await authApi.requestCurrentEmailVerification();
    otpCooldown.startCooldown(currentEmailCooldownKey.value);
    emailStep.value = "verify-current";
  } catch (requestError) {
    otpCooldown.syncFromError(currentEmailCooldownKey.value, requestError);
    emailError.value = getProblemMessage(requestError, "Unable to send verification to current email.");
  } finally {
    emailPending.value = false;
  }
};

const resendCurrentVerification = async () => {
  if (currentVerificationRemainingSeconds.value > 0) {
    return;
  }

  emailPending.value = true;
  emailError.value = "";

  try {
    currentOtp.value = createOtpCode();
    await authApi.requestCurrentEmailVerification();
    otpCooldown.startCooldown(currentEmailCooldownKey.value);
  } catch (requestError) {
    otpCooldown.syncFromError(currentEmailCooldownKey.value, requestError);
    emailError.value = getProblemMessage(requestError, "Unable to send another code to the current email.");
  } finally {
    emailPending.value = false;
  }
};

const confirmCurrentVerification = async () => {
  emailPending.value = true;
  emailError.value = "";

  try {
    await authApi.confirmCurrentEmailVerification({ token: currentOtpValue.value });
    currentOtp.value = createOtpCode();
    emailStep.value = "enter-new";
  } catch (requestError) {
    emailError.value = getProblemMessage(requestError, "Current email verification failed.");
  } finally {
    emailPending.value = false;
  }
};

const requestNewEmailVerification = async () => {
  if (newVerificationRemainingSeconds.value > 0) {
    emailStep.value = "confirm-new";
    return;
  }

  emailPending.value = true;
  emailError.value = "";

  try {
    newEmail.value = newEmail.value.trim();
    await authApi.requestNewEmailVerification({ newEmail: newEmail.value });
    otpCooldown.startCooldown(newEmailCooldownKey.value);
    newOtp.value = createOtpCode();
    emailStep.value = "confirm-new";
  } catch (requestError) {
    otpCooldown.syncFromError(newEmailCooldownKey.value, requestError);
    emailError.value = getProblemMessage(requestError, "Unable to send verification to new email.");
  } finally {
    emailPending.value = false;
  }
};

const resendNewEmailVerification = async () => {
  if (newVerificationRemainingSeconds.value > 0) {
    return;
  }

  emailPending.value = true;
  emailError.value = "";

  try {
    newEmail.value = newEmail.value.trim();
    await authApi.requestNewEmailVerification({ newEmail: newEmail.value });
    otpCooldown.startCooldown(newEmailCooldownKey.value);
    newOtp.value = createOtpCode();
    emailStep.value = "confirm-new";
  } catch (requestError) {
    otpCooldown.syncFromError(newEmailCooldownKey.value, requestError);
    emailError.value = getProblemMessage(requestError, "Unable to send another code to the new email.");
  } finally {
    emailPending.value = false;
  }
};

const completeEmailChange = async () => {
  emailPending.value = true;
  emailError.value = "";

  try {
    await authApi.completeEmailChange({ token: newOtpValue.value });
    newOtp.value = createOtpCode();
    emailStep.value = "done";
    emit("updated");
  } catch (requestError) {
    emailError.value = getProblemMessage(requestError, "New email verification failed.");
  } finally {
    emailPending.value = false;
  }
};

const resetEmailFlow = () => {
  emailStep.value = "idle";
  emailError.value = "";
  currentOtp.value = createOtpCode();
  newEmail.value = "";
  newOtp.value = createOtpCode();
};

const closeDialog = () => {
  resetEmailFlow();
  emit("close");
};

watch(
  () => props.user.email,
  () => {
    if (emailStep.value === "done") {
      resetEmailFlow();
    }
  },
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
                  Your email has been changed successfully.
                </AppNotice>
                <AppButton class="justify-self-start" @click="closeDialog">
                  Done
                </AppButton>
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
