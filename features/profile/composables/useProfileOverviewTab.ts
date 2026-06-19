import type { UserResponse } from "~/features/users/types/users";

export const useProfileOverviewTab = (
  props: {
    user: UserResponse;
  },
  onUpdated: () => void,
) => {
  const authApi = useProfileApi();
  const { enumLabel } = useAuthPresentation();
  const { genderOptions } = useAuthOptions();

  const form = reactive({
    fullName: "",
    userName: "",
    gender: "Unknown",
    img: "",
  });

  const savePending = ref(false);
  const saveSuccess = ref("");
  const saveError = ref("");

  const emailVerificationOpen = ref(false);
  const emailChangeOpen = ref(false);
  const phoneVerificationOpen = ref(false);
  const phoneChangeOpen = ref(false);

  watch(
    () => props.user,
    (user) => {
      form.fullName = user.fullName;
      form.userName = user.userName;
      form.gender = user.gender || "Unknown";
      form.img = user.img || "";

      if (user.emailStatus === "Verified") {
        emailVerificationOpen.value = false;
      }

      if (user.phoneStatus === "Verified") {
        phoneVerificationOpen.value = false;
      }
    },
    { immediate: true },
  );

  const submitProfile = async () => {
    savePending.value = true;
    saveSuccess.value = "";
    saveError.value = "";

    try {
      await authApi.updateProfile({
        fullName: form.fullName,
        userName: form.userName,
        gender: form.gender,
        img: form.img,
      });
      saveSuccess.value = "Profile updated.";
      onUpdated();
    } catch (requestError) {
      saveError.value = getProblemMessage(requestError, "Unable to save the profile.");
    } finally {
      savePending.value = false;
    }
  };

  const statusTone = (value?: string | null) => {
    if (value === "Active" || value === "Verified") {
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-400/10 dark:border-emerald-400/20";
    }

    if (value === "Pending" || value === "Unverified") {
      return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20";
    }

    return "text-red-700 bg-red-50 border-red-200 dark:text-red-200 dark:bg-red-400/10 dark:border-red-400/20";
  };

  return {
    emailChangeOpen,
    emailVerificationOpen,
    enumLabel,
    form,
    genderOptions,
    phoneChangeOpen,
    phoneVerificationOpen,
    saveError,
    savePending,
    saveSuccess,
    statusTone,
    submitProfile,
  };
};
