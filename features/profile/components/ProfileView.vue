<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { ProfilePageState } from "~/features/profile/composables/useProfilePage";
import ProfileAddressesTab from "~/features/profile/components/ProfileAddressesTab.vue";
import ProfileOverviewTab from "~/features/profile/components/ProfileOverviewTab.vue";
import ProfileSecurityTab from "~/features/profile/components/ProfileSecurityTab.vue";

const props = defineProps<{
  page: ProfilePageState;
}>();

const { data, pending, error, addresses, profileTabs, activeTab, selectTab, handleUpdated } = props.page;

const selectProfileTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  profileTabs.find((tab) => tab.value === activeTab.value)?.label ?? "Profile",
);

useScopedPageBreadcrumbs(() =>
  data.value
    ? [
        { label: "Profile", to: "/profile" },
        { label: activeTabLabel.value },
      ]
    : [],
);
</script>

<template>
  <AppDetailPage
    :title="data?.fullName ?? ''"
    :tabs="profileTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? getProblemMessage(error, 'The current profile could not be loaded.') : null"
    error-title="Unable to load profile"
    @select-tab="selectProfileTab"
  >
    <template v-if="data">
      <ProfileOverviewTab
        v-if="activeTab === 'profile'"
        :user="data"
        @updated="handleUpdated"
      />

      <ProfileAddressesTab
        v-if="activeTab === 'addresses'"
        :addresses="addresses"
        @updated="handleUpdated"
      />

      <ProfileSecurityTab
        v-if="activeTab === 'security'"
        :user="data"
        @updated="handleUpdated"
      />
    </template>
  </AppDetailPage>
</template>
