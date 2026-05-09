<script setup lang="ts">
import type {
  UserResponse,
  UserRoleResponse,
} from "~/features/users/types";
import type { RoleResponse } from "~/features/roles/types";

const props = defineProps<{
  user: UserResponse;
  roles: UserRoleResponse[];
  rolesCatalog: RoleResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const usersApi = useUsersAdminApi();
const authz = useAdminAuthorization();
const canSyncRoles = computed(() => authz.can([ADMIN_PERMISSION.userRoleUpdateAll, ADMIN_PERMISSION.userUpdateAll]));

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
  if (!roleFilter.value) return catalog;
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

    emit("refresh");
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
