<script setup lang="ts">
import type { RolePermissionResponse } from "~/features/roles/types";
import type { PermissionResponse } from "~/features/permissions/types";

const props = defineProps<{
  roleId: string;
  permissions: RolePermissionResponse[];
  catalog: PermissionResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const rolesApi = useRolesAdminApi();
const authz = useAdminAuthorization();
const canSyncPermissions = computed(() => authz.can([ADMIN_PERMISSION.rolePermissionCreateAll, ADMIN_PERMISSION.rolePermissionRemoveAll]));

const actionPending = ref(false);
const actionError = ref("");
const moduleFilter = ref("");

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

const moduleGroups = computed(() => {
  const catalog = props.catalog ?? [];
  const modules: Record<string, Record<string, typeof catalog>> = {};

  for (const permission of catalog) {
    if (!modules[permission.module]) modules[permission.module] = {};
    if (!modules[permission.module][permission.subModule]) modules[permission.module][permission.subModule] = [];
    modules[permission.module][permission.subModule].push(permission);
  }

  return Object.entries(modules)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([module, subGroups]) => ({
      module,
      subGroups: Object.entries(subGroups)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([subModule, permissions]) => ({ subModule, perms: permissions })),
    }));
});

const filteredGroups = computed(() => {
  if (!moduleFilter.value) return moduleGroups.value;
  return moduleGroups.value.filter((group) => group.module === moduleFilter.value);
});

const flatPerms = (subGroups: Array<{ perms: typeof props.catalog }>) =>
  subGroups.flatMap((group) => group.perms);

const countChecked = (permissions: Array<{ id: string }>) =>
  permissions.filter((permission) => checked.value.has(permission.id)).length;

const moduleTabOptions = computed(() => {
  const allPermissions = moduleGroups.value.flatMap((group) => flatPerms(group.subGroups));

  return [
    {
      label: "All",
      value: "",
      checkedCount: countChecked(allPermissions),
      totalCount: allPermissions.length,
    },
    ...moduleGroups.value.map((group) => {
      const permissions = flatPerms(group.subGroups);

      return {
        label: group.module,
        value: group.module,
        checkedCount: countChecked(permissions),
        totalCount: permissions.length,
      };
    }),
  ];
});

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

    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to sync permissions.");
  } finally {
    actionPending.value = false;
  }
};
</script>

<template>
  <AppAssignmentPanel
    eyebrow="Permissions"
    :has-items="moduleGroups.length > 0"
    empty-title="No permissions in catalog"
    empty-detail="Create permissions first, then return here to assign them."
  >
    <div style="background: red; color: white; padding: 10px; margin-bottom: 20px;">
      DEBUG CATALOG LENGTH: {{ catalog?.length }}<br>
      DEBUG IS ARRAY: {{ Array.isArray(catalog) }}<br>
      DEBUG JSON: {{ JSON.stringify(catalog).substring(0, 200) }}
    </div>
    <AppConfirm
      :open="actionErrorOpen"
      title="Update failed"
      :detail="actionError"
      cancel-label="Close"
      tone="danger"
      hide-confirm
      @cancel="closeActionError"
    />

    <template #controls>
      <AppAssignmentTabs v-model="moduleFilter" label="Module" :tabs="moduleTabOptions" />
    </template>

    <template #actions>
      <AppButton v-if="canSyncPermissions" :loading="actionPending" @click="syncPermissions">
        Save permissions
      </AppButton>
    </template>

    <div class="grid max-h-[560px] gap-4 overflow-y-auto pr-1">
      <AppAssignmentGroup
        v-for="group in filteredGroups"
        :key="group.module"
        :title="group.module"
        :count-label="`${countChecked(flatPerms(group.subGroups))}/${flatPerms(group.subGroups).length}`"
        :checked="groupAllChecked(flatPerms(group.subGroups))"
        :indeterminate="groupPartialChecked(flatPerms(group.subGroups))"
        :collapsible="false"
        @toggle-all="toggleGroup(flatPerms(group.subGroups))"
      >
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th class="w-[64px] text-center">Use</th>
                <th class="min-w-[220px]">Permission</th>
                <th class="min-w-[160px]">Sub module</th>
                <th class="min-w-[120px]">Operation</th>
                <th class="min-w-[120px]">Scope</th>
                <th class="w-[132px] text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="permission in flatPerms(group.subGroups)"
                :key="permission.id"
                class="cursor-pointer"
                @click="togglePermission(permission.id)"
              >
                <td class="align-middle text-center">
                  <input
                    type="checkbox"
                    class="h-4 w-4 cursor-pointer rounded accent-ink"
                    :checked="checked.has(permission.id)"
                    @click.stop
                    @change="togglePermission(permission.id)"
                  />
                </td>
                <td class="align-middle">
                  <p class="table-title">{{ permission.permissionName }}</p>
                  <p v-if="permission.description" class="table-copy">{{ permission.description }}</p>
                </td>
                <td class="align-middle">
                  <p class="text-sm font-medium text-ink">{{ permission.subModule }}</p>
                </td>
                <td class="align-middle">
                  <AppBadge>{{ permission.operation }}</AppBadge>
                </td>
                <td class="align-middle">
                  <p class="text-sm text-smoke">{{ permission.scope }}</p>
                </td>
                <td class="align-middle text-center">
                  <AppBadge :tone="checked.has(permission.id) ? 'success' : 'default'">
                    {{ checked.has(permission.id) ? "Assigned" : "Available" }}
                  </AppBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppAssignmentGroup>
    </div>

  </AppAssignmentPanel>
</template>
