import type { PermissionResponse } from "~/features/permissions/types/permissions";

export const usePermissionEditTab = (
  permission: MaybeRefOrGetter<PermissionResponse>,
  onRefresh: () => void,
) => {
  const permissionsApi = usePermissionsAdminApi();
  const {
    permissionModuleOptions,
    getSubModuleOptions,
    getOperationOptions,
    permissionScopeOptions,
  } = useAuthOptions();

  const currentPermission = computed(() => toValue(permission));

  const form = reactive({
    module: "Auth",
    subModule: "User",
    operation: "Read",
    scope: "All",
    description: "",
  });

  const subModuleOptions = computed(() => getSubModuleOptions(form.module));
  const operationOptions = computed(() => getOperationOptions(form.subModule));

  watch(() => form.module, (newModule) => {
    const options = getSubModuleOptions(newModule);
    if (options.length && !options.some((option) => option.value === form.subModule)) {
      form.subModule = options[0].value;
    }

    if (!getOperationOptions(form.subModule).some((option) => option.value === form.operation)) {
      form.operation = getOperationOptions(form.subModule)[0]?.value ?? "Read";
    }
  });

  watch(() => form.subModule, (newSubModule) => {
    if (!getOperationOptions(newSubModule).some((option) => option.value === form.operation)) {
      form.operation = getOperationOptions(newSubModule)[0]?.value ?? "Read";
    }
  });

  const actionPending = ref(false);
  const actionError = ref("");
  const actionSuccess = ref("");

  watchEffect(() => {
    const value = currentPermission.value;
    if (!value) {
      return;
    }

    form.module = value.module;
    form.subModule = value.subModule;
    form.operation = value.operation;
    form.scope = value.scope;
    form.description = value.description || "";
  });

  const savePermission = async () => {
    actionPending.value = true;
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await permissionsApi.updatePermission(currentPermission.value.id, {
        module: form.module,
        subModule: form.subModule,
        operation: form.operation,
        scope: form.scope,
        description: form.description || null,
      });
      actionSuccess.value = "Permission updated.";
      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update the permission.");
    } finally {
      actionPending.value = false;
    }
  };

  return {
    actionError,
    actionPending,
    actionSuccess,
    form,
    operationOptions,
    permissionModuleOptions,
    permissionScopeOptions,
    savePermission,
    subModuleOptions,
  };
};
