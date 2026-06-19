import type { RolePermissionResponse } from "~/features/roles/types/roles";
import type { PermissionResponse } from "~/features/permissions/types/permissions";

export const useRolePermissionsTab = (
  props: {
    roleId: string;
    permissions: RolePermissionResponse[];
    catalog: PermissionResponse[];
  },
  onRefresh: () => void,
) => {
  const rolesApi = useRolesAdminApi();
  const authz = useAdminAuthorization();

  const canSyncPermissions = computed(() => authz.can([ADMIN_PERMISSION.rolePermissionCreateAll, ADMIN_PERMISSION.rolePermissionRemoveAll]));
  const actionPending = ref(false);
  const actionError = ref("");
  const permissionFilter = ref("");
  const visiblePermissionsOpen = ref(true);

  const actionErrorOpen = computed(() => actionError.value.length > 0);

  const closeActionError = () => {
    actionError.value = "";
  };

  const assignedIds = computed(() =>
    new Set((props.permissions ?? []).map((permission) => permission.permissionId)),
  );

  const checked = ref<Set<string>>(new Set());

  watchEffect(() => {
    checked.value = new Set(assignedIds.value);
  });

  const catalog = computed(() => props.catalog ?? []);

  const permissionFilterGroups = computed(() => {
    const moduleMap = new Map<string, { label: string; options: Array<{ label: string; value: string }> }>();

    for (const permission of catalog.value) {
      const group = moduleMap.get(permission.module) ?? { label: permission.module, options: [] };
      const value = `${permission.module}.${permission.subModule}`;
      if (!group.options.some((option) => option.value === value)) {
        group.options.push({
          label: permission.subModule,
          value,
        });
      }
      moduleMap.set(permission.module, group);
    }

    return [...moduleMap.values()].sort((left, right) => left.label.localeCompare(right.label));
  });

  const filteredPermissions = computed(() => {
    if (!permissionFilter.value) {
      return catalog.value;
    }

    return catalog.value.filter((permission) => `${permission.module}.${permission.subModule}` === permissionFilter.value);
  });

  const visiblePermissions = computed(() =>
    catalog.value.length > 0
      ? filteredPermissions.value
      : (props.permissions ?? []).map((permission) => ({
          id: permission.permissionId,
          permissionName: permission.permissionName,
          module: permission.module,
          subModule: permission.subModule,
          operation: permission.operation,
          scope: "Assigned",
          description: permission.description,
        })),
  );

  const togglePermission = (permissionId: string) => {
    const next = new Set(checked.value);
    if (next.has(permissionId)) {
      next.delete(permissionId);
    } else {
      next.add(permissionId);
    }
    checked.value = next;
  };

  const toggleGroup = (permissions: Array<{ id: string }>) => {
    const allChecked = permissions.every((permission) => checked.value.has(permission.id));
    const next = new Set(checked.value);

    for (const permission of permissions) {
      if (allChecked) {
        next.delete(permission.id);
      } else {
        next.add(permission.id);
      }
    }

    checked.value = next;
  };

  const groupAllChecked = (permissions: Array<{ id: string }>) =>
    permissions.length > 0 && permissions.every((permission) => checked.value.has(permission.id));

  const groupPartialChecked = (permissions: Array<{ id: string }>) =>
    !groupAllChecked(permissions) && permissions.some((permission) => checked.value.has(permission.id));

  const syncPermissions = async () => {
    actionPending.value = true;
    actionError.value = "";

    try {
      const addPermissionIds = [...checked.value].filter((id) => !assignedIds.value.has(id));
      const removeRolePermissionIds = (props.permissions ?? [])
        .filter((permission) => !checked.value.has(permission.permissionId))
        .map((permission) => permission.id);

      await rolesApi.syncRolePermissions(props.roleId, { addPermissionIds, removeRolePermissionIds });
      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to sync permissions.");
    } finally {
      actionPending.value = false;
    }
  };

  return {
    actionError,
    actionErrorOpen,
    actionPending,
    canSyncPermissions,
    catalog,
    checked,
    closeActionError,
    groupAllChecked,
    groupPartialChecked,
    permissionFilter,
    permissionFilterGroups,
    syncPermissions,
    toggleGroup,
    togglePermission,
    visiblePermissions,
    visiblePermissionsOpen,
  };
};
