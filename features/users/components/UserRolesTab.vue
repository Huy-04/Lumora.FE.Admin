<script setup lang="ts">
import { PhCaretDown } from "@phosphor-icons/vue";

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
const syncSuccess = ref("");
const blockedRoleSyncMessage = ref("");
const roleFilter = ref("");

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
  syncSuccess.value = "";
  blockedRoleSyncMessage.value = "";

  try {
    const addRoleIds = [...checked.value].filter((id) => !assignedIds.value.has(id));
    const removeUserRoleIds = (props.roles ?? [])
      .filter((entry) => !checked.value.has(entry.roleId))
      .map((entry) => entry.id);

    await usersApi.syncUserRoles(props.user.id, { addRoleIds, removeUserRoleIds });

    syncSuccess.value = "Roles updated.";
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
  <div class="grid max-w-6xl content-start gap-6">
    <AppConfirm
      :open="Boolean(blockedRoleSyncMessage)"
      title="Cannot update administrator roles"
      :detail="blockedRoleSyncMessage"
      cancel-label="Close"
      :hide-confirm="true"
      tone="warning"
      @cancel="blockedRoleSyncMessage = ''"
    />
    <AppPanel
      title="Role matrix"
      description="Toggle roles assigned to this user. Changes are applied when you click Save."
    >
      <div v-if="rolesCatalog.length" class="grid gap-4">
        <div class="flex items-center gap-3">
          <AppSelect v-model="roleFilter" label="Filter by role" :options="roleFilterOptions" class="w-48" />
        </div>

        <div class="grid max-h-[460px] gap-3 overflow-y-auto pr-1">
          <details class="accordion-shell accordion-shell-active group" open>
            <summary class="accordion-summary">
              <input
                type="checkbox"
                class="h-4 w-4 cursor-pointer rounded accent-ink"
                :checked="groupAllChecked(filteredRoles)"
                :indeterminate="groupPartialChecked(filteredRoles)"
                @change.stop="toggleGroup(filteredRoles)"
                @click.stop
              />
              <span class="flex-1 text-sm font-semibold text-ink">Roles</span>
              <span class="subtle-pill text-xs">
                {{ filteredRoles.filter((role) => checked.has(role.id)).length }}/{{ filteredRoles.length }}
              </span>
              <PhCaretDown :size="14" class="text-smoke transition-transform group-open:rotate-180" />
            </summary>

            <div class="accordion-body divide-y divide-line/20">
              <label
                v-for="role in filteredRoles"
                :key="role.id"
                class="flex cursor-pointer items-center gap-3 py-2.5 pl-11 pr-4 transition-colors hover:bg-line/20 dark:hover:bg-white/6"
              >
                <input
                  type="checkbox"
                  class="h-3.5 w-3.5 cursor-pointer rounded accent-ink"
                  :checked="checked.has(role.id)"
                  @change="toggleRole(role.id)"
                />
                <span class="flex-1 text-xs font-medium text-ink">{{ role.roleName }}</span>
                <span v-if="role.description" class="max-w-[240px] truncate text-xs text-smoke">{{ role.description }}</span>
              </label>
            </div>
          </details>
        </div>

        <div v-if="canSyncRoles" class="panel-action-row">
          <AppButton :loading="syncPending" @click="syncRoles">
            Save roles
          </AppButton>
        </div>

        <AppNotice v-if="syncSuccess" tone="success" title="Roles updated">
          {{ syncSuccess }}
        </AppNotice>

        <AppNotice v-if="syncError" tone="danger" title="Update failed">
          {{ syncError }}
        </AppNotice>
      </div>

      <AppEmptyState
        v-else
        title="No roles in catalog"
        detail="Create roles first, then return here to assign them."
      />
    </AppPanel>
  </div>
</template>
