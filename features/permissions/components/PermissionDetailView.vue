<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { PermissionDetailPage } from "~/features/permissions/composables/usePermissionDetailPage";

const props = defineProps<{
  page: PermissionDetailPage;
}>();

const { permissionTabs, activeTab, data, pending, error, refresh } = props.page;

const selectPermissionTab = (tab: string) => {
  activeTab.value = tab as typeof activeTab.value;
};

const activeTabLabel = computed(() =>
  permissionTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

useScopedPageBreadcrumbs(() =>
  data.value
    ? [
        { label: "Permissions", to: "/permissions" },
        { label: data.value.permissionName, to: `/permissions/${data.value.id}` },
        { label: activeTabLabel.value },
      ]
    : [],
);
</script>

<template>
  <AppDetailPage
    :title="data?.permissionName ?? ''"
    :tabs="permissionTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? getProblemMessage(error, 'The permission detail could not be loaded.') : null"
    error-title="Unable to load permission"
    @select-tab="selectPermissionTab"
  >
    <template v-if="data">
      <PermissionOverviewTab v-if="activeTab === 'overview'" :permission="data" />
      <PermissionEditTab v-else :permission="data" @refresh="refresh" />
    </template>
  </AppDetailPage>
</template>
