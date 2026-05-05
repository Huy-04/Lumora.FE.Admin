<script setup lang="ts">
import { PhCaretDown } from "@phosphor-icons/vue";

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
const { permissionModuleOptions } = useAuthOptions();
const canSyncPermissions = computed(() => authz.can([ADMIN_PERMISSION.rolePermissionUpdateAll, ADMIN_PERMISSION.permissionUpdateAll]));

const actionPending = ref(false);
const actionError = ref("");
const actionSuccess = ref("");
const moduleFilter = ref("");

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
  actionSuccess.value = "";

  try {
    const addPermissionIds = [...checked.value].filter((id) => !assignedIds.value.has(id));
    const removeRolePermissionIds = (props.permissions ?? [])
      .filter((permission) => !checked.value.has(permission.permissionId))
      .map((permission) => permission.id);

    await rolesApi.syncRolePermissions(props.roleId, { addPermissionIds, removeRolePermissionIds });

    actionSuccess.value = "Permissions updated.";
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to sync permissions.");
  } finally {
    actionPending.value = false;
  }
};
</script>

<template>
  <div class="grid max-w-4xl content-start gap-6">
    <AppPanel
      title="Permission matrix"
      description="Toggle permissions by module. Changes are applied when you click Save."
    >
      <div v-if="moduleGroups.length" class="grid gap-4">
        <div class="flex items-center gap-3">
          <AppSelect
            v-model="moduleFilter"
            label="Filter by module"
            :options="[{ label: 'All modules', value: '' }, ...permissionModuleOptions]"
            class="w-48"
          />
        </div>

        <div class="grid max-h-[460px] gap-3 overflow-y-auto pr-1">
          <details
            v-for="group in filteredGroups"
            :key="group.module"
            class="accordion-shell accordion-shell-active group"
            open
          >
            <summary class="accordion-summary">
              <input
                type="checkbox"
                class="h-4 w-4 cursor-pointer rounded accent-ink"
                :checked="groupAllChecked(flatPerms(group.subGroups))"
                :indeterminate="groupPartialChecked(flatPerms(group.subGroups))"
                @change.stop="toggleGroup(flatPerms(group.subGroups))"
                @click.stop
              />
              <span class="flex-1 text-sm font-semibold text-ink">{{ group.module }}</span>
              <span class="subtle-pill text-xs">
                {{ flatPerms(group.subGroups).filter((permission) => checked.has(permission.id)).length }}/{{ flatPerms(group.subGroups).length }}
              </span>
              <PhCaretDown :size="14" class="text-smoke transition-transform group-open:rotate-180" />
            </summary>

            <div class="border-t border-line/60">
              <details
                v-for="subGroup in group.subGroups"
                :key="subGroup.subModule"
                class="group/sub border-b border-line/30 last:border-b-0"
                open
              >
                <summary class="accordion-summary py-2.5 pl-8 pr-4">
                  <input
                    type="checkbox"
                    class="h-3.5 w-3.5 cursor-pointer rounded accent-ink"
                    :checked="groupAllChecked(subGroup.perms)"
                    :indeterminate="groupPartialChecked(subGroup.perms)"
                    @change.stop="toggleGroup(subGroup.perms)"
                    @click.stop
                  />
                  <span class="flex-1 text-sm font-semibold text-ink">{{ subGroup.subModule }}</span>
                  <span class="subtle-pill text-xs">
                    {{ subGroup.perms.filter((permission) => checked.has(permission.id)).length }}/{{ subGroup.perms.length }}
                  </span>
                  <PhCaretDown :size="14" class="text-smoke transition-transform group-open/sub:rotate-180" />
                </summary>

                <div class="accordion-body border-t border-line/30 divide-y divide-line/20">
                  <label
                    v-for="permission in subGroup.perms"
                    :key="permission.id"
                    class="flex cursor-pointer items-center gap-3 py-2.5 pl-11 pr-4 transition-colors hover:bg-line/20 dark:hover:bg-white/6"
                  >
                    <input
                      type="checkbox"
                      class="h-3.5 w-3.5 cursor-pointer rounded accent-ink"
                      :checked="checked.has(permission.id)"
                      @change="togglePermission(permission.id)"
                    />
                    <span class="flex-1 text-xs font-medium text-ink">{{ permission.permissionName }}</span>
                    <AppBadge>{{ permission.operation }}</AppBadge>
                  </label>
                </div>
              </details>
            </div>
          </details>
        </div>

        <div v-if="canSyncPermissions" class="panel-action-row">
          <AppButton :loading="actionPending" @click="syncPermissions">
            Save permissions
          </AppButton>
        </div>

        <AppNotice v-if="actionSuccess" tone="success" title="Permissions updated">
          {{ actionSuccess }}
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Update failed">
          {{ actionError }}
        </AppNotice>
      </div>

      <AppEmptyState
        v-else
        title="No permissions in catalog"
        detail="Create permissions first, then return here to assign them."
      />
    </AppPanel>
  </div>
</template>
