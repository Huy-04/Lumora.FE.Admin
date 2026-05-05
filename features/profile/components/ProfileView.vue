<script setup lang="ts">
import type { ProfilePage } from "~/features/profile/composables/useProfilePage";

const props = defineProps<{
  page: ProfilePage;
}>();

const { data, pending, error, profileTabs, activeTab, selectTab, handleUpdated } = props.page;
</script>

<template>
  <div class="detail-shell">
    <AppNotice v-if="error" tone="danger" title="Unable to load profile">
      {{ getProblemMessage(error, "The current profile could not be loaded.") }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && data" class="detail-header">
        <h1 class="detail-title">{{ data.fullName }}</h1>
        <p class="detail-copy">
          {{ data.email }}<span v-if="data.userName"> / {{ data.userName }}</span>
        </p>
        <div class="detail-tabs">
          <button
            v-for="tab in profileTabs"
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
        <ProfileOverviewTab
          v-if="activeTab === 'profile' && data"
          :user="data"
          @updated="handleUpdated"
        />

        <ProfileSecurityTab
          v-if="activeTab === 'security' && data"
          :user="data"
          @updated="handleUpdated"
        />
      </section>
    </template>
  </div>
</template>
