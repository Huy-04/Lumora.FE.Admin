<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { UserDetailPage } from "~/features/users/composables/useUserDetailPage";

const props = defineProps<{
  page: UserDetailPage;
}>();

const { userId, userTabs, activeTab, data, pending, error, refresh, selectTab, enumLabel } = props.page;
</script>

<template>
  <div class="detail-shell">
    <AppNotice v-if="error" tone="danger" title="Unable to load user">
      {{ getProblemMessage(error, "The user detail flow is currently unavailable.") }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && data?.user" class="detail-header">
        <div class="detail-crumbs">
          <NuxtLink class="detail-crumb-link" to="/">Auth</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" to="/users">Users</NuxtLink>
        </div>
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="min-w-0">
            <h1 class="detail-title">{{ data.user.fullName }}</h1>
            <p class="detail-copy">
              {{ data.user.email }}<span v-if="data.user.userName"> / {{ data.user.userName }}</span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <AppButton aria-label="Reload user" icon-only variant="ghost" @click="refresh">
              <PhArrowClockwise color="#171c1a" :size="32" weight="bold" />
            </AppButton>
            <AppBadge :tone="data.user.userStatus === 'Active' ? 'success' : data.user.userStatus === 'Suspended' ? 'danger' : 'warning'">
              {{ enumLabel(data.user.userStatus) }}
            </AppBadge>
            <AppBadge :tone="data.user.emailStatus === 'Verified' ? 'success' : 'warning'">
              Email {{ enumLabel(data.user.emailStatus) }}
            </AppBadge>
            <AppBadge :tone="data.user.phoneStatus === 'Verified' ? 'success' : 'warning'">
              Phone {{ enumLabel(data.user.phoneStatus) }}
            </AppBadge>
          </div>
        </div>
        <div class="detail-tabs">
          <button
            v-for="tab in userTabs"
            :key="tab.value"
            type="button"
            class="detail-tab"
            :class="{ 'detail-tab-active': activeTab === tab.value }"
            @click="selectTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </section>

      <section v-if="pending" class="detail-stack">
        <div class="soft-card h-72 animate-pulse" />
        <div class="soft-card h-48 animate-pulse" />
      </section>

      <section v-else class="detail-stack">
        <UserOverviewTab v-if="activeTab === 'overview'" :user="data!.user" :roles="data!.roles" />
        <UserProfileTab v-else-if="activeTab === 'edit'" :user="data!.user" @refresh="refresh" />
        <UserRolesTab v-else-if="activeTab === 'roles'" :user="data!.user" :roles="data!.roles" :roles-catalog="data!.rolesCatalog" @refresh="refresh" />
        <UserPasswordTab v-else-if="activeTab === 'password'" :user="data!.user" />
        <UserAddressesTab v-else-if="activeTab === 'addresses'" :user-id="userId" :addresses="data!.addresses" @refresh="refresh" />
        <UserSessionsTab v-else :user-id="userId" :sessions="data!.sessions" @refresh="refresh" />
      </section>
    </template>
  </div>
</template>
