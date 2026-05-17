export const useUserCreatePage = async () => {
  // 1. Dependency injection
  const usersApi = useUsersAdminApi();
  const { phoneRegionOptions, genderOptions } = useAuthOptions();

  // 2. Form state
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

  // 3. Reactive state
  const pending = ref(false);
  const passwordRef = computed(() => form.password);
  const { rules: passwordRules } = usePasswordRules(passwordRef);
  const errorMessage = ref("");

  // 4. Actions/mutations
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

  // 5. Return statement
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
