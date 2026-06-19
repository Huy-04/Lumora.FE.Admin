<script setup lang="ts">
import type {
  UserResponse,
  UserRoleResponse,
} from "~/features/users/types/users";
import type { RoleResponse } from "~/features/roles/types/roles";

const props = defineProps<{
  user: UserResponse;
  roles: UserRoleResponse[];
  rolesCatalog: RoleResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const {
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
} = useUserRolesTab(props, () => emit("refresh"));
</script>

<template>
  <AppAssignmentPanel
    eyebrow="Roles"
    :has-items="rolesCatalog.length > 0"
    empty-title="No roles in catalog"
    empty-detail="Create roles first, then return here to assign them."
    toolbar-columns="lg:grid-cols-[minmax(14rem,18rem)]"
  >
    <template #modals>
      <AppConfirm
        :open="Boolean(blockedRoleSyncMessage)"
        title="Cannot update administrator roles"
        :detail="blockedRoleSyncMessage"
        cancel-label="Close"
        :hide-confirm="true"
        tone="warning"
        @cancel="blockedRoleSyncMessage = ''"
      />
    </template>

    <template #controls>
      <AppSelect v-model="roleFilter" label="Filter by role" :options="roleFilterOptions" />
    </template>

    <template #actions>
      <AppButton v-if="canSyncRoles" :loading="syncPending" @click="syncRoles">
        Save roles
      </AppButton>
    </template>

    <AppAssignmentGroup
      v-model:open="visibleRolesOpen"
      title="Visible roles"
      :count-label="`${filteredRoles.filter((role) => checked.has(role.id)).length}/${filteredRoles.length}`"
      :checked="groupAllChecked(filteredRoles)"
      :indeterminate="groupPartialChecked(filteredRoles)"
      content-id="visible-roles-list"
      @toggle-all="toggleGroup(filteredRoles)"
    >
      <div class="max-h-[460px] divide-y divide-line/50 overflow-y-auto">
        <label
          v-for="role in filteredRoles"
          :key="role.id"
          class="grid cursor-pointer gap-3 px-5 py-4 transition-colors hover:bg-line/20 md:grid-cols-[minmax(0,1fr)_auto] md:items-center dark:hover:bg-white/6"
        >
          <div class="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              class="mt-1 h-4 w-4 cursor-pointer rounded accent-ink"
              :checked="checked.has(role.id)"
              @change="toggleRole(role.id)"
            />
            <div class="min-w-0">
              <p class="text-sm font-semibold text-ink">{{ role.roleName }}</p>
              <p v-if="role.description" class="mt-1 max-w-3xl truncate text-sm text-smoke">{{ role.description }}</p>
            </div>
          </div>
          <AppBadge :tone="checked.has(role.id) ? 'success' : 'default'" class="justify-self-start md:justify-self-end">
            {{ checked.has(role.id) ? "Assigned" : "Available" }}
          </AppBadge>
        </label>
      </div>
    </AppAssignmentGroup>

    <template #notices>
      <AppNotice v-if="syncError" tone="danger" title="Update failed">
        {{ syncError }}
      </AppNotice>
    </template>
  </AppAssignmentPanel>
</template>
