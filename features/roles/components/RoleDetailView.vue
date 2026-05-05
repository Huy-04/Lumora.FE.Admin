<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { RoleDetailPage } from "~/features/roles/composables/useRoleDetailPage";

const props = defineProps<{
  page: RoleDetailPage;
}>();

const { roleId, canViewRolePermissions, roleTabs, activeTab, data, pending, error, refresh } = props.page;
</script>

<template>
  <div class="detail-shell">
    <AppNotice v-if="error" tone="danger" title="Unable to load role">
      {{ getProblemMessage(error, "The role detail could not be loaded.") }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && data?.role" class="detail-header">
        <div class="detail-crumbs">
          <NuxtLink class="detail-crumb-link" to="/">Auth</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" to="/roles">Roles</NuxtLink>
        </div>
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="min-w-0">
            <h1 class="detail-title">{{ data.role.roleName }}</h1>
            <p class="detail-copy">
              {{ data.role.description || "Manage the role and the permissions attached to it." }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <AppButton aria-label="Reload role" icon-only variant="ghost" @click="refresh">
              <PhArrowClockwise color="#171c1a" :size="32" weight="bold" />
            </AppButton>
            <AppBadge v-if="canViewRolePermissions">{{ data.permissions.length }} permissions</AppBadge>
          </div>
        </div>
        <div class="detail-tabs">
          <button
            v-for="tab in roleTabs"
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
        <RoleOverviewTab v-if="activeTab === 'overview'" :role="data!.role" :permissions="data!.permissions" />
        <RoleEditTab v-else-if="activeTab === 'edit'" :role="data!.role" @refresh="refresh" />
        <RolePermissionsTab v-else :role-id="roleId" :permissions="data!.permissions" :catalog="data!.catalog" @refresh="refresh" />
      </section>
    </template>
  </div>
</template>
