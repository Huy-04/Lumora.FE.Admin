<script setup lang="ts">
import type { RolePermissionResponse } from "~/features/roles/types/roles";
import type { PermissionResponse } from "~/features/permissions/types/permissions";

const props = defineProps<{
  roleId: string;
  permissions: RolePermissionResponse[];
  catalog: PermissionResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const {
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
} = useRolePermissionsTab(props, () => emit("refresh"));
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
