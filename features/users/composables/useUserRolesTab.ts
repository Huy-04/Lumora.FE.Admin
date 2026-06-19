import type {
  UserResponse,
  UserRoleResponse,
} from "~/features/users/types/users";
import type { RoleResponse } from "~/features/roles/types/roles";

export const useUserRolesTab = (
  props: {
    user: UserResponse;
    roles: UserRoleResponse[];
    rolesCatalog: RoleResponse[];
  },
  onRefresh: () => void,
) => {
  const usersApi = useUsersAdminApi();
  const session = useAuthSession();
  const authz = useAdminAuthorization();

  const canSyncRoles = computed(() => authz.can([ADMIN_PERMISSION.userRoleCreateAll, ADMIN_PERMISSION.userRoleRemoveAll]));
  const syncPending = ref(false);
  const syncError = ref("");
  const blockedRoleSyncMessage = ref("");
  const roleFilter = ref("");
  const visibleRolesOpen = ref(true);

  const assignedIds = computed(() =>
    new Set((props.roles ?? []).map((entry) => entry.roleId)),
  );

  const checked = ref<Set<string>>(new Set());

  watchEffect(() => {
    checked.value = new Set(assignedIds.value);
  });

  const roleFilterOptions = computed(() => {
    const catalog = props.rolesCatalog ?? [];
    return [
      { label: "All roles", value: "" },
      ...catalog.map((role) => ({ label: role.roleName, value: role.id })),
    ];
  });

  const filteredRoles = computed(() => {
    const catalog = props.rolesCatalog ?? [];
    if (!roleFilter.value) {
      return catalog;
    }

    return catalog.filter((role) => role.id === roleFilter.value);
  });

  const toggleRole = (roleId: string) => {
    const next = new Set(checked.value);
    if (next.has(roleId)) {
      next.delete(roleId);
    } else {
      next.add(roleId);
    }
    checked.value = next;
  };

  const groupAllChecked = (roles: Array<{ id: string }>) =>
    roles.length > 0 && roles.every((role) => checked.value.has(role.id));

  const groupPartialChecked = (roles: Array<{ id: string }>) =>
    !groupAllChecked(roles) && roles.some((role) => checked.value.has(role.id));

  const toggleGroup = (roles: Array<{ id: string }>) => {
    const allSelected = groupAllChecked(roles);
    const next = new Set(checked.value);

    for (const role of roles) {
      if (allSelected) {
        next.delete(role.id);
      } else {
        next.add(role.id);
      }
    }

    checked.value = next;
  };

  const getBlockedRoleSyncMessage = (requestError: unknown) => {
    const problem = getProblemDetails(requestError);
    const normalizedErrors = Array.isArray(problem?.errors) ? problem.errors : [];

    if (problem?.status !== 409) {
      return null;
    }

    if (normalizedErrors.some((entry) => entry.field === "UserRoles" && entry.errorCode === "AccessDenied")) {
      return "You cannot remove the Administrator role from your own account.";
    }

    if (normalizedErrors.some((entry) => entry.field === "UserRoles" && entry.errorCode === "InvalidStatus")) {
      return "At least one user must keep the Administrator role.";
    }

    return null;
  };

  const syncRoles = async () => {
    syncPending.value = true;
    syncError.value = "";
    blockedRoleSyncMessage.value = "";

    try {
      const addRoleIds = [...checked.value].filter((id) => !assignedIds.value.has(id));
      const removeUserRoleIds = (props.roles ?? [])
        .filter((entry) => !checked.value.has(entry.roleId))
        .map((entry) => entry.id);

      await usersApi.syncUserRoles(props.user.id, { addRoleIds, removeUserRoleIds });

      if (props.user.id === session.user.value?.id) {
        await session.refresh();
      }

      onRefresh();
    } catch (requestError) {
      const blockedMessage = getBlockedRoleSyncMessage(requestError);
      if (blockedMessage) {
        blockedRoleSyncMessage.value = blockedMessage;
      } else {
        syncError.value = getProblemMessage(requestError, "Unable to sync roles.");
      }
    } finally {
      syncPending.value = false;
    }
  };

  return {
    blockedRoleSyncMessage,
    canSyncRoles,
    checked,
    filteredRoles,
    groupAllChecked,
    groupPartialChecked,
    roleFilter,
    roleFilterOptions,
    syncError,
    syncPending,
    syncRoles,
    toggleGroup,
    toggleRole,
    visibleRolesOpen,
  };
};
