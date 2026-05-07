<script setup lang="ts">
import type { ProfilePage } from "~/features/profile/composables/useProfilePage";

const props = defineProps<{
  page: ProfilePage;
}>();

const { data, pending, error, profileTabs, activeTab, selectTab, handleUpdated } = props.page;

const selectProfileTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};
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

      <ProfileSecurityTab
        v-if="activeTab === 'security'"
        :user="data"
        @updated="handleUpdated"
      />
    </template>
  </AppDetailPage>
</template>
