<script setup lang="ts">
import type { UserDetailPage } from "~/features/users/composables/useUserDetailPage";

const props = defineProps<{
  page: UserDetailPage;
}>();

const { userId, userTabs, activeTab, data, pending, error, refresh, selectTab } = props.page;

const selectUserTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};
</script>

<template>
  <AppDetailPage
    :title="data?.user?.fullName ?? ''"
    :tabs="userTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? getProblemMessage(error, 'The user detail flow is currently unavailable.') : null"
    error-title="Unable to load user"
    @select-tab="selectUserTab"
  >
    <template v-if="data?.user">
      <UserOverviewTab v-if="activeTab === 'overview'" :user="data.user" :roles="data.roles" />
      <UserProfileTab v-else-if="activeTab === 'edit'" :user="data.user" @refresh="refresh" />
      <UserRolesTab v-else-if="activeTab === 'roles'" :user="data.user" :roles="data.roles" :roles-catalog="data.rolesCatalog" @refresh="refresh" />
      <UserPasswordTab v-else-if="activeTab === 'password'" :user="data.user" />
      <UserAddressesTab v-else-if="activeTab === 'addresses'" :user-id="userId" :addresses="data.addresses" @refresh="refresh" />
      <UserSessionsTab v-else :user-id="userId" :sessions="data.sessions" @refresh="refresh" />
    </template>
  </AppDetailPage>
</template>
