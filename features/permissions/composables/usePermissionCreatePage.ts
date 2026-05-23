export const usePermissionCreatePage = async () => {
  // 1. Dependency injection
  const permissionsApi = usePermissionsAdminApi();
  const { permissionModuleOptions, getSubModuleOptions, getOperationOptions, permissionScopeOptions } = useAuthOptions();

  // 2. Form state
  const form = reactive({
    module: "Auth",
    subModule: "User",
    operation: "Read",
    scope: "All",
    description: "",
  });

  // 3. Computed derivations
  const subModuleOptions = computed(() => getSubModuleOptions(form.module));
  const operationOptions = computed(() => getOperationOptions(form.subModule));

  // 4. Watchers
  // When module changes, reset subModule to first valid option
  watch(() => form.module, (newModule) => {
    const opts = getSubModuleOptions(newModule);
    if (opts.length && !opts.some((o) => o.value === form.subModule)) {
      form.subModule = opts[0].value;
    }
    if (!getOperationOptions(form.subModule).some((o) => o.value === form.operation)) {
      form.operation = getOperationOptions(form.subModule)[0]?.value ?? "Read";
    }
  });

  // When subModule changes, reset operation to first valid option
  watch(() => form.subModule, (newSubModule) => {
    if (!getOperationOptions(newSubModule).some((o) => o.value === form.operation)) {
      form.operation = getOperationOptions(newSubModule)[0]?.value ?? "Read";
    }
  });

  // 5. UI state
  const pending = ref(false);
  const errorMessage = ref("");

  // 6. Actions/mutations
  const submit = async () => {
    pending.value = true;
    errorMessage.value = "";

    try {
      const created = await permissionsApi.createPermission({
        module: form.module,
        subModule: form.subModule,
        operation: form.operation,
        scope: form.scope,
        description: form.description || null,
      });

      await navigateTo(`/permissions/${created.id}`);
    } catch (error) {
      errorMessage.value = getProblemMessage(error, "Unable to create the permission.");
    } finally {
      pending.value = false;
    }
  };

  // 7. Return statement
  return {
    form,
    subModuleOptions,
    operationOptions,
    permissionModuleOptions,
    permissionScopeOptions,
    pending,
    errorMessage,
    submit,
  };
};

export type PermissionCreatePage = Awaited<ReturnType<typeof usePermissionCreatePage>>;