export const useUserCreatePage = async () => {
  const usersApi = useUsersAdminApi();
  const { phoneRegionOptions, genderOptions } = useAuthOptions();

  const form = reactive({
    fullName: "",
    email: "",
    userName: "",
    phone: "",
    phoneRegion: "VN",
    password: "",
    gender: "Unknown",
    img: "",
  });

  const pending = ref(false);
  const passwordRef = computed(() => form.password);
  const { rules: passwordRules } = usePasswordRules(passwordRef);
  const errorMessage = ref("");

  const submit = async () => {
    pending.value = true;
    errorMessage.value = "";

    try {
      const created = await usersApi.createUser({
        email: form.email,
        phone: form.phone,
        phoneRegion: form.phoneRegion,
        fullName: form.fullName,
        userName: form.userName,
        password: form.password,
        gender: form.gender,
        img: form.img || null,
      });

      await navigateTo(`/users/${created.id}`);
    } catch (error) {
      errorMessage.value = getProblemMessage(error, "Unable to create the user.");
    } finally {
      pending.value = false;
    }
  };

  return {
    form,
    pending,
    passwordRules,
    errorMessage,
    phoneRegionOptions,
    genderOptions,
    submit,
  };
};

export type UserCreatePage = Awaited<ReturnType<typeof useUserCreatePage>>;
