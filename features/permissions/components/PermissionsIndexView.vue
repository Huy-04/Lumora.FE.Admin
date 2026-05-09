<script setup lang="ts">
import type { PermissionsIndexPage } from "~/features/permissions/composables/usePermissionsIndexPage";

defineProps<{
  page: PermissionsIndexPage;
}>();
</script>

<template>
  <AppIndexPage
    eyebrow="Permissions API"
    search-label="Search permissions"
    :total-items="page.summaryStats.value[0]?.value ?? 0"
    item-label="permissions"
    :pending="page.pending.value"
    :error="page.error.value ? 'Error loading data' : null"
    :error-detail="page.error.value ? getProblemMessage(page.error.value, 'The permission list is unavailable.') : ''"
    :action-error="page.actionError.value"
    action-error-title="Permission action failed"
    :items-length="page.filteredPermissions.value.length"
    empty-title="No permissions found"
    empty-detail="Adjust the filters or add a new permission."
    :first-item-number="page.firstItemNumber.value"
    :last-item-number="page.lastItemNumber.value"
    v-model:page-size="page.pageSize.value"
    :page-size-options="page.pageSizeOptions"
    :page="page.page.value"
    :total-pages="page.totalPages.value"
    @previous-page="page.goToPreviousPage"
    @next-page="page.goToNextPage"
  >
    <template #modals>
      <AppConfirm
        :open="page.confirmPermission.value !== null"
        :title="page.confirmTitle.value"
        :detail="page.confirmDetail"
        confirm-label="Remove"
        tone="danger"
        :loading="page.actionPending.value === 'remove'"
        @confirm="page.removePermission"
        @cancel="page.cancelRemove"
      />
    </template>

    <template #search-input>
      <AppInput v-model="page.localSearch.value" label="" placeholder="Search by name or description" @keyup.enter="page.applyFilters" />
    </template>

    <template #actions>
      <AppButton variant="primary" @click="page.applyFilters">
        Search
      </AppButton>
      <AppButton variant="primary" @click="page.clearFilters">
        Refresh
      </AppButton>
      <NuxtLink v-if="page.canCreatePermission.value" class="primary-link" to="/permissions/create">
        Create permission
      </NuxtLink>
    </template>

    <template #filters>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="page.localModuleFilter.value"
          label="Module"
          :options="page.moduleOptions"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="page.localOperationFilter.value"
          label="Operation"
          :options="page.operationOptions"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="page.localScopeFilter.value"
          label="Scope"
          :options="page.scopeOptions"
        />
      </div>
    </template>

    <template #table>
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-[28%]">Permission</th>
            <th class="w-[10%]">Module</th>
            <th class="w-[12%]">SubModule</th>
            <th class="w-[12%]">Operation</th>
            <th class="w-[10%]">Scope</th>
            <th class="w-[12%] text-center">Open</th>
            <th v-if="page.canRemovePermission.value" class="w-[12%] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="permission in page.pagedPermissions.value" :key="permission.id">
            <td class="align-middle">
              <div class="grid gap-1">
                <p class="table-title">{{ permission.permissionName }}</p>
                <p class="table-copy">{{ permission.description || "No description available." }}</p>
              </div>
            </td>
            <td class="align-middle">
              <AppBadge>{{ page.enumLabel(permission.module) }}</AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge>{{ page.enumLabel(permission.subModule) }}</AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge>{{ page.enumLabel(permission.operation) }}</AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge>{{ page.enumLabel(permission.scope) }}</AppBadge>
            </td>
            <td class="align-middle">
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/permissions/${permission.id}`">
                  Open
                </NuxtLink>
              </div>
            </td>
            <td v-if="page.canRemovePermission.value" class="align-middle">
              <div class="flex justify-center">
                <AppButton class="table-action" variant="danger" @click="page.requestRemove(permission.id)">
                  Remove
                </AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </AppIndexPage>
</template>
