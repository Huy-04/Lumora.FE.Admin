export const useProfileAvatarPage = async () => {
  const authApi = useAuthApi();
  const session = useAuthSession();

  const AVATAR_BASE = "https://gidllmdnupjypafinkvz.supabase.co/storage/v1/object/public/assets/avatar";

  const presetAvatars = [
    {
      label: "Atlas",
      note: "A clean default portrait for a straightforward workspace profile.",
      url: `${AVATAR_BASE}/avatar-base-boy.png`,
    },
    {
      label: "Nova",
      note: "A softer preset that still reads clearly in compact header spaces.",
      url: `${AVATAR_BASE}/avatar-base-girl.png`,
    },
  ];

  const { data, pending, error, refresh } = await useAsyncData("profile-avatar", async () => authApi.getCurrentUser());

  const draftAvatar = ref("");
  const customUrlInput = ref("");
  const savePending = ref(false);
  const saveSuccess = ref("");
  const saveError = ref("");

  watch(
    () => data.value,
    (user) => {
      if (!user) {
        return;
      }

      draftAvatar.value = user.img || "";
      customUrlInput.value = user.img || "";
    },
    { immediate: true },
  );

  const displayName = computed(() => data.value?.fullName || data.value?.userName || "Profile");
  const avatarInitial = computed(() => displayName.value.trim().charAt(0).toUpperCase() || "?");
  const previewUrl = computed(() => draftAvatar.value.trim());
  const hasAvatar = computed(() => Boolean(previewUrl.value));
  const isPresetSelected = (url: string) => previewUrl.value === url;

  const selectPreset = (url: string) => {
    draftAvatar.value = url;
    customUrlInput.value = url;
    saveSuccess.value = "";
    saveError.value = "";
  };

  const applyCustomUrl = () => {
    draftAvatar.value = customUrlInput.value.trim();
    saveSuccess.value = "";
    saveError.value = "";
  };

  const removeAvatar = () => {
    draftAvatar.value = "";
    customUrlInput.value = "";
    saveSuccess.value = "";
    saveError.value = "";
  };

  const resetDraft = () => {
    draftAvatar.value = data.value?.img || "";
    customUrlInput.value = data.value?.img || "";
    saveSuccess.value = "";
    saveError.value = "";
  };

  const submitAvatar = async () => {
    if (!data.value) {
      return;
    }

    savePending.value = true;
    saveSuccess.value = "";
    saveError.value = "";

    try {
      await authApi.updateProfile({
        fullName: data.value.fullName,
        userName: data.value.userName,
        gender: data.value.gender || "Unknown",
        img: previewUrl.value,
      });
      saveSuccess.value = "Avatar updated.";
      await Promise.all([refresh(), session.refresh()]);
    } catch (requestError) {
      saveError.value = getProblemMessage(requestError, "Unable to save the avatar.");
    } finally {
      savePending.value = false;
    }
  };

  return {
    pending,
    error,
    presetAvatars,
    hasAvatar,
    previewUrl,
    displayName,
    avatarInitial,
    isPresetSelected,
    selectPreset,
    customUrlInput,
    applyCustomUrl,
    removeAvatar,
    resetDraft,
    saveSuccess,
    saveError,
    savePending,
    submitAvatar,
  };
};

export type ProfileAvatarPage = Awaited<ReturnType<typeof useProfileAvatarPage>>;
