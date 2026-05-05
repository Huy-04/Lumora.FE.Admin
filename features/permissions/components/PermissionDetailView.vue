<script setup lang="ts">
import type { PermissionDetailPage } from "~/features/permissions/composables/usePermissionDetailPage";

const props = defineProps<{
  page: PermissionDetailPage;
}>();

const { permissionTabs, activeTab, data, pending, error, refresh } = props.page;
</script>

<template>
  <div class="detail-shell">
    <AppNotice v-if="error" tone="danger" title="Unable to load permission">
      {{ getProblemMessage(error, "The permission detail could not be loaded.") }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && data" class="detail-header">
        <div class="detail-crumbs">
          <NuxtLink class="detail-crumb-link" to="/">Auth</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" to="/permissions">Permissions</NuxtLink>
        </div>
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="min-w-0">
            <h1 class="detail-title">{{ data.permissionName }}</h1>
            <p class="detail-copy">
              {{ data.description || "Review the permission contract and update its module, operation, and scope." }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <AppBadge>{{ data.module }}</AppBadge>
            <AppBadge>{{ data.operation }}</AppBadge>
            <AppBadge>{{ data.scope }}</AppBadge>
          </div>
        </div>
        <div class="detail-tabs">
          <button
            v-for="tab in permissionTabs"
            :key="tab.value"
            type="button"
            class="detail-tab"
            :class="{ 'detail-tab-active': activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </section>

      <section v-if="pending" class="detail-stack">
        <div class="soft-card h-64 animate-pulse" />
        <div class="soft-card h-48 animate-pulse" />
      </section>

      <section v-else class="detail-stack">
        <PermissionOverviewTab v-if="activeTab === 'overview'" :permission="data!" />
        <PermissionEditTab v-else :permission="data!" @refresh="refresh" />
      </section>
    </template>
  </div>
</template>
