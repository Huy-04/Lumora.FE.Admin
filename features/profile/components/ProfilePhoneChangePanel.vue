<script setup lang="ts">
import type { UserResponse } from "~/features/users/types";

type PhoneStep = "idle" | "verify-current" | "enter-new" | "confirm-new" | "done";

const props = defineProps<{
  open: boolean;
  user: UserResponse;
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const authApi = useAuthApi();
const authSession = useAuthSession();
const otpCooldown = useOtpResendCooldown();
const { phoneRegionOptions } = useAuthOptions();

const createOtpCode = () => Array.from({ length: 6 }, () => "");
const currentPhoneCooldownKey = computed(() => `${props.user.id}:change-phone:current`);
const newPhoneCooldownKey = computed(() => `${props.user.id}:change-phone:new`);

const inferPhoneRegion = (phone: string, fallback: string) => {
  const normalized = phone.trim();
  if (!normalized.startsWith("+")) return fallback;

  const regionMap: Array<{ prefix: string; region: string }> = [
    { prefix: "+84", region: "VN" }, { prefix: "+65", region: "SG" },
    { prefix: "+60", region: "MY" }, { prefix: "+66", region: "TH" },
    { prefix: "+81", region: "JP" }, { prefix: "+82", region: "KR" },
    { prefix: "+86", region: "CN" }, { prefix: "+852", region: "HK" },
    { prefix: "+886", region: "TW" }, { prefix: "+91", region: "IN" },
    { prefix: "+49", region: "DE" }, { prefix: "+33", region: "FR" },
    { prefix: "+44", region: "GB" }, { prefix: "+61", region: "AU" },
    { prefix: "+64", region: "NZ" }, { prefix: "+63", region: "PH" },
    { prefix: "+62", region: "ID" }, { prefix: "+1", region: "US" },
    { prefix: "+39", region: "IT" }, { prefix: "+34", region: "ES" },
    { prefix: "+31", region: "NL" }, { prefix: "+46", region: "SE" },
    { prefix: "+41", region: "CH" }, { prefix: "+48", region: "PL" },
    { prefix: "+351", region: "PT" }, { prefix: "+55", region: "BR" },
    { prefix: "+52", region: "MX" }, { prefix: "+7", region: "RU" },
    { prefix: "+971", region: "AE" }, { prefix: "+966", region: "SA" },
    { prefix: "+90", region: "TR" }, { prefix: "+27", region: "ZA" },
    { prefix: "+855", region: "KH" },
  ];

  return regionMap.find((entry) => normalized.startsWith(entry.prefix))?.region ?? fallback;
};

const phoneStep = ref<PhoneStep>("idle");
const phonePending = ref(false);
const phoneError = ref("");
const currentOtp = ref<string[]>(createOtpCode());
const newOtp = ref<string[]>(createOtpCode());
const form = reactive({
  newPhone: "",
  phoneRegion: "VN",
});

const currentOtpValue = computed(() => currentOtp.value.join("").trim());
const newOtpValue = computed(() => newOtp.value.join("").trim());
const currentRemainingSeconds = computed(() => otpCooldown.getRemainingSeconds(currentPhoneCooldownKey.value));
const newRemainingSeconds = computed(() => otpCooldown.getRemainingSeconds(newPhoneCooldownKey.value));

const phoneFlowDescription = computed(() => {
  switch (phoneStep.value) {
    case "verify-current":
      return "Enter the code sent to your current phone.";
    case "enter-new":
      return "Enter the phone number you want to use.";
    case "confirm-new":
      return `Enter the code sent to ${form.newPhone || "the new phone"}.`;
    case "done":
      return "Phone updated successfully.";
    default:
      return "Confirm both phone numbers before switching.";
  }
});

const currentVerificationHelper = computed(() =>
  currentRemainingSeconds.value > 0
    ? `You can request another code in ${currentRemainingSeconds.value} seconds.`
    : "Enter the latest code from your current phone, or request a new one below.",
);

const newVerificationHelper = computed(() =>
  newRemainingSeconds.value > 0
    ? `You can request another code in ${newRemainingSeconds.value} seconds.`
    : "Enter the latest code from your new phone, or request a new one below.",
);

const resetPhoneFlow = () => {
  phoneStep.value = "idle";
  phoneError.value = "";
  currentOtp.value = createOtpCode();
  newOtp.value = createOtpCode();
  form.newPhone = "";
  form.phoneRegion = inferPhoneRegion(props.user.phone || "", "VN");
};

const closeDialog = () => {
  resetPhoneFlow();
  emit("close");
};

const requestCurrentVerification = async () => {
  if (currentRemainingSeconds.value > 0) {
    phoneStep.value = "verify-current";
    return;
  }

  phonePending.value = true;
  phoneError.value = "";

  try {
    currentOtp.value = createOtpCode();
    newOtp.value = createOtpCode();
    form.newPhone = "";
    await authApi.requestCurrentPhoneVerification();
    otpCooldown.startCooldown(currentPhoneCooldownKey.value);
    phoneStep.value = "verify-current";
  } catch (requestError) {
    otpCooldown.syncFromError(currentPhoneCooldownKey.value, requestError);
    phoneError.value = getProblemMessage(requestError, "Unable to send verification to current phone.");
  } finally {
    phonePending.value = false;
  }
};

const resendCurrentVerification = async () => {
  if (currentRemainingSeconds.value > 0) {
    return;
  }

  phonePending.value = true;
  phoneError.value = "";

  try {
    currentOtp.value = createOtpCode();
    await authApi.resendCurrentPhoneVerification();
    otpCooldown.startCooldown(currentPhoneCooldownKey.value);
  } catch (requestError) {
    otpCooldown.syncFromError(currentPhoneCooldownKey.value, requestError);
    phoneError.value = getProblemMessage(requestError, "Unable to send another code to the current phone.");
  } finally {
    phonePending.value = false;
  }
};

const confirmCurrentVerification = async () => {
  phonePending.value = true;
  phoneError.value = "";

  try {
    await authApi.confirmCurrentPhoneVerification({
      token: currentOtpValue.value,
    });
    currentOtp.value = createOtpCode();
    phoneStep.value = "enter-new";
  } catch (requestError) {
    phoneError.value = getProblemMessage(requestError, "Current phone verification failed.");
  } finally {
    phonePending.value = false;
  }
};

const requestNewPhoneVerification = async () => {
  if (newRemainingSeconds.value > 0) {
    phoneStep.value = "confirm-new";
    return;
  }

  phonePending.value = true;
  phoneError.value = "";

  try {
    form.newPhone = form.newPhone.trim();
    await authApi.requestNewPhoneVerification({
      newPhone: form.newPhone,
      phoneRegion: form.phoneRegion,
    });
    otpCooldown.startCooldown(newPhoneCooldownKey.value);
    newOtp.value = createOtpCode();
    phoneStep.value = "confirm-new";
  } catch (requestError) {
    otpCooldown.syncFromError(newPhoneCooldownKey.value, requestError);
    phoneError.value = getProblemMessage(requestError, "Unable to send verification to new phone.");
  } finally {
    phonePending.value = false;
  }
};

const resendNewPhoneVerification = async () => {
  if (newRemainingSeconds.value > 0) {
    return;
  }

  phonePending.value = true;
  phoneError.value = "";

  try {
    await authApi.resendNewPhoneVerification();
    otpCooldown.startCooldown(newPhoneCooldownKey.value);
    newOtp.value = createOtpCode();
    phoneStep.value = "confirm-new";
  } catch (requestError) {
    otpCooldown.syncFromError(newPhoneCooldownKey.value, requestError);
    phoneError.value = getProblemMessage(requestError, "Unable to send another code to the new phone.");
  } finally {
    phonePending.value = false;
  }
};

const completePhoneChange = async () => {
  phonePending.value = true;
  phoneError.value = "";

  try {
    await authApi.completePhoneChange({
      token: newOtpValue.value,
    });
    newOtp.value = createOtpCode();
    phoneStep.value = "done";
    setTimeout(() => {
      authSession.expire("Your phone was changed. Please sign in again.");
      navigateTo({
        path: "/auth/login",
        query: { reason: "security-updated" },
      });
    }, 3000);
  } catch (requestError) {
    phoneError.value = getProblemMessage(requestError, "New phone verification failed.");
  } finally {
    phonePending.value = false;
  }
};

watch(
  () => props.open,
  (open) => {
    if (open) {
      resetPhoneFlow();
    }
  },
  { immediate: true },
);

watch(
  () => props.user.phone,
  () => {
    if (phoneStep.value === "done") {
      resetPhoneFlow();
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
