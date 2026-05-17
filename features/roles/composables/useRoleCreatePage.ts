export const useRoleCreatePage = async () => {
  // 1. Dependency injection
  const rolesApi = useRolesAdminApi();

  // 2. Form state
  const form = reactive({
    roleName: "",
    description: "",
  });

  // 3. UI state
  const pending = ref(false);
  const errorMessage = ref("");

  // 4. Actions/mutations
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

  // 5. Return statement
  return {
    form,
    pending,
    errorMessage,
    submit,
  };
};

export type RoleCreatePage = Awaited<ReturnType<typeof useRoleCreatePage>>;
