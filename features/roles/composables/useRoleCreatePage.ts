export const useRoleCreatePage = async () => {
  const rolesApi = useRolesAdminApi();

  const form = reactive({
    roleName: "",
    description: "",
  });

  const pending = ref(false);
  const errorMessage = ref("");

  const submit = async () => {
    pending.value = true;
    errorMessage.value = "";

    try {
      const created = await rolesApi.createRole({
        roleName: form.roleName,
        description: form.description || null,
      });

      await navigateTo(`/roles/${created.id}`);
    } catch (error) {
      errorMessage.value = getProblemMessage(error, "Unable to create the role.");
    } finally {
      pending.value = false;
    }
  };

  return {
    form,
    pending,
    errorMessage,
    submit,
  };
};

export type RoleCreatePage = Awaited<ReturnType<typeof useRoleCreatePage>>;
