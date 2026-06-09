import type { RoleResponse } from "~/features/roles/types";

export const useRoleEditTab = (
  role: MaybeRefOrGetter<RoleResponse>,
  onRefresh: () => void,
) => {
  const rolesApi = useRolesAdminApi();
  const currentRole = computed(() => toValue(role));

  const form = reactive({
    roleName: "",
    description: "",
  });

  const actionPending = ref(false);
  const actionError = ref("");
  const actionSuccess = ref("");

  watchEffect(() => {
    const value = currentRole.value;
    if (!value) {
      return;
    }

    form.roleName = value.roleName;
    form.description = value.description || "";
  });

  const saveRole = async () => {
    actionPending.value = true;
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await rolesApi.updateRole(currentRole.value.id, {
        roleName: form.roleName,
        description: form.description || null,
      });
      actionSuccess.value = "Role updated.";
      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update the role.");
    } finally {
      actionPending.value = false;
    }
  };

  return {
    actionError,
    actionPending,
    actionSuccess,
    form,
    saveRole,
  };
};
