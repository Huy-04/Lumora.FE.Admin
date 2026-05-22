<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { RoleDetailPage } from "~/features/roles/composables/useRoleDetailPage";

const props = defineProps<{
  page: RoleDetailPage;
}>();

const { roleId, roleTabs, activeTab, data, pending, error, refresh, selectTab } = props.page;

const selectRoleTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  roleTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

useScopedPageBreadcrumbs(() =>
  data.value?.role
    ? [
        { label: "Roles", to: "/roles" },
        { label: data.value.role.roleName, to: `/roles/${roleId.value}` },
        { label: activeTabLabel.value },
      ]
    : [],
);
</script>

<template>
  <AppDetailPage
    :title="data?.role?.roleName ?? ''"
    :tabs="roleTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? getProblemMessage(error, 'The role detail could not be loaded.') : null"
    error-title="Unable to load role"
    @select-tab="selectRoleTab"
  >
    <template v-if="data?.role">
      <RoleOverviewTab v-if="activeTab === 'overview'" :role="data.role" :permissions="data.permissions" />
      <RoleEditTab v-else-if="activeTab === 'edit'" :role="data.role" @refresh="refresh" />
      <RolePermissionsTab v-else :role-id="roleId" :permissions="data.permissions" :catalog="data.catalog" @refresh="refresh" />
    </template>
  </AppDetailPage>
</template>
