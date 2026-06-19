import type { UserResponse } from "~/features/users/types/users";

type PhoneStep = "idle" | "verify-current" | "enter-new" | "confirm-new" | "done";

export const useProfilePhoneChangeFlow = (
  props: {
    open: boolean;
    user: UserResponse;
  },
  onClose: () => void,
) => {
  const authApi = useProfileApi();
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
    onClose();
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
      // Backend revokes the current session immediately after the change succeeds.
      authSession.clear();
      setTimeout(() => {
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

  return {
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
  };
};
