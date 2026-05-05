export const useEmailVerificationPage = async () => {
  const authApi = useAuthApi();
  const route = useRoute();
  const nuxtApp = useNuxtApp();
  const session = useAuthSession();
  const createEmptyOtp = () => Array.from({ length: 6 }, () => "");
  const otpCooldown = useOtpResendCooldown();

  const form = reactive({
    otp: createEmptyOtp(),
  });

  const pending = ref(false);
  const resendPending = ref(false);
  const successMessage = ref("");
  const errorMessage = ref("");

  const otpValue = computed(() => form.otp.join("").trim());
  const redirectTarget = computed(() => typeof route.query.redirect === "string" ? route.query.redirect : "");
  const currentUserId = computed(() => session.user.value?.id ?? "");
  const resendRemainingSeconds = computed(() => otpCooldown.getRemainingSeconds(currentUserId.value));
  const resendLabel = computed(() => resendRemainingSeconds.value > 0 ? `Resend OTP (${resendRemainingSeconds.value}s)` : "Resend OTP");
  const resendHelper = computed(() =>
    resendRemainingSeconds.value > 0
      ? `You can request another code in ${resendRemainingSeconds.value} seconds.`
      : `You can request a new code every ${otpCooldown.defaultCooldownSeconds} seconds.`,
  );

  const authenticated = await session.restore(false);
  if (!authenticated) {
    await nuxtApp.runWithContext(() => navigateTo("/auth/login"));
  }

  const submit = async () => {
    pending.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
      await authApi.verifyEmailOtp({ otp: otpValue.value });
      await session.refresh();
      await navigateTo(redirectTarget.value || "/profile");
    } catch (error) {
      errorMessage.value = getProblemMessage(error, "Unable to verify the OTP.");
    } finally {
      pending.value = false;
    }
  };

  const resend = async () => {
    if (resendRemainingSeconds.value > 0) {
      return;
    }

    resendPending.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
      await authApi.resendEmailOtp();
      otpCooldown.startCooldown(currentUserId.value);
      successMessage.value = "A new code has been sent.";
    } catch (error) {
      otpCooldown.syncFromError(currentUserId.value, error);
      errorMessage.value = getProblemMessage(error, "Unable to resend the OTP.");
    } finally {
      resendPending.value = false;
    }
  };

  return {
    form,
    pending,
    resendPending,
    successMessage,
    errorMessage,
    resendHelper,
    resendRemainingSeconds,
    currentUserId,
    resendLabel,
    submit,
    resend,
  };
};

export type EmailVerificationPage = Awaited<ReturnType<typeof useEmailVerificationPage>>;
