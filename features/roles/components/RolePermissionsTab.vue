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
    if (!group.options.some((o) => o.value === value)) {
      group.options.push({
        label: permission.subModule,
        value,
      });
    }
    moduleMap.set(permission.module, group);
  }

  return [...moduleMap.values()].sort((a, b) => a.label.localeCompare(b.label));
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

const filteredPermissions = computed(() => {
  if (!permissionFilter.value) {
    return catalog.value;
  }

  return catalog.value.filter((permission) => `${permission.module}.${permission.subModule}` === permissionFilter.value);
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
    :has-items="visiblePermissions.length > 0"
    empty-title="No permissions in catalog"
    empty-detail="Create permissions first, then return here to assign them."
    toolbar-columns="lg:grid-cols-[minmax(16rem,20rem)]"
  >
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
      <AppSelect v-if="catalog.length > 0" v-model="permissionFilter" label="Filter by module" :groups="permissionFilterGroups" />
    </template>

    <template #notices>
      <AppNotice v-if="catalog.length === 0 && permissions.length > 0" tone="info" title="Permission catalog unavailable">
        The full permission catalog could not be loaded. Only currently assigned permissions are shown.
      </AppNotice>
    </template>

    <template #actions>
      <AppButton v-if="canSyncPermissions && catalog.length > 0" :loading="actionPending" @click="syncPermissions">
        Save permissions
      </AppButton>
    </template>

    <AppAssignmentGroup
      v-model:open="visiblePermissionsOpen"
      :title="catalog.length > 0 ? 'Visible permissions' : 'Assigned permissions'"
      :count-label="`${visiblePermissions.filter((permission) => checked.has(permission.id)).length}/${visiblePermissions.length}`"
      :checked="groupAllChecked(visiblePermissions)"
      :indeterminate="groupPartialChecked(visiblePermissions)"
      content-id="visible-permissions-list"
      @toggle-all="toggleGroup(visiblePermissions)"
    >
      <div class="max-h-[520px] divide-y divide-line/50 overflow-y-auto">
        <label
          v-for="permission in visiblePermissions"
          :key="permission.id"
          class="grid cursor-pointer gap-3 px-5 py-4 transition-colors hover:bg-line/20 md:grid-cols-[minmax(0,1fr)_auto] md:items-center dark:hover:bg-white/6"
        >
          <div class="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              class="mt-1 h-4 w-4 cursor-pointer rounded accent-ink"
              :checked="checked.has(permission.id)"
              :disabled="catalog.length === 0"
              @change="togglePermission(permission.id)"
            />
            <div class="min-w-0">
              <p class="text-sm font-semibold text-ink">{{ permission.permissionName }}</p>
              <p class="mt-1 text-sm text-smoke">{{ permission.module }} / {{ permission.subModule }}</p>
              <p v-if="permission.description" class="mt-1 max-w-3xl truncate text-sm text-smoke">{{ permission.description }}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2 justify-self-start md:justify-self-end">
            <AppBadge>{{ permission.operation }}</AppBadge>
            <AppBadge>{{ permission.scope }}</AppBadge>
            <AppBadge :tone="checked.has(permission.id) ? 'success' : 'default'">
              {{ checked.has(permission.id) ? "Assigned" : "Available" }}
            </AppBadge>
          </div>
        </label>
      </div>
    </AppAssignmentGroup>
  </AppAssignmentPanel>
</template>