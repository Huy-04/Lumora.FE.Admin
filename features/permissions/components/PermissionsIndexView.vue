<script setup lang="ts">
import type { PermissionIndexPageState } from "~/features/permissions/composables/usePermissionsIndexPage";

const props = defineProps<{
  page: PermissionIndexPageState;
}>();

const {
  actionError,
  actionPending,
  applyFilters,
  canCreatePermission,
  canRemovePermission,
  cancelRemove,
  clearFilters,
  confirmDetail,
  confirmPermission,
  confirmTitle,
  enumLabel,
  error,
  filteredPermissions,
  firstItemNumber,
  lastItemNumber,
  localFilters,
  moduleOptions,
  operationOptions,
  page,
  pageSize,
  pageSizeOptions,
  pagedPermissions,
  pending,
  removePermission,
  requestRemove,
  scopeOptions,
  summaryStats,
  totalPages,
  goToNextPage,
  goToPreviousPage,
} = props.page;
</script>

<template>
  <AppIndexPage
    v-model="localFilters.search.value"
    eyebrow="Permissions API"
    search-label="Search permissions"
    search-placeholder="Search by name or description"
    create-route="/permissions/create"
    create-label="Create permission"
    :can-create="canCreatePermission"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="permissions"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? getProblemMessage(error, 'The permission list is unavailable.') : ''"
    :action-error="actionError"
    action-error-title="Permission action failed"
    :items-length="filteredPermissions.length"
    empty-title="No permissions found"
    empty-detail="Adjust the filters or add a new permission."
    :first-item-number="firstItemNumber"
    :last-item-number="lastItemNumber"
    v-model:page-size="pageSize"
    :page-size-options="pageSizeOptions"
    :page="page"
    :total-pages="totalPages"
    @search="applyFilters"
    @refresh="clearFilters"
    @previous-page="goToPreviousPage"
    @next-page="goToNextPage"
  >
    <template #modals>
      <AppConfirm
        :open="confirmPermission !== null"
        :title="confirmTitle"
        :detail="confirmDetail"
        confirm-label="Remove"
        tone="danger"
        :loading="actionPending === 'remove'"
        @confirm="removePermission"
        @cancel="cancelRemove"
      />
    </template>

    <template #filters>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.module.value"
          label="Module"
          :options="moduleOptions"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.operation.value"
          label="Operation"
          :options="operationOptions"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.scope.value"
          label="Scope"
          :options="scopeOptions"
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
            <th v-if="canRemovePermission" class="w-[12%] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="permission in pagedPermissions" :key="permission.id">
            <td class="align-middle">
              <div class="grid gap-1">
                <p class="table-title">{{ permission.permissionName }}</p>
                <p class="table-copy">{{ permission.description || "No description available." }}</p>
              </div>
            </td>
            <td class="align-middle">
              <AppBadge>{{ enumLabel(permission.module) }}</AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge>{{ enumLabel(permission.subModule) }}</AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge>{{ enumLabel(permission.operation) }}</AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge>{{ enumLabel(permission.scope) }}</AppBadge>
            </td>
            <td class="align-middle">
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/permissions/${permission.id}`">
                  Open
                </NuxtLink>
              </div>
            </td>
            <td v-if="canRemovePermission" class="align-middle">
              <div class="flex justify-center">
                <AppButton class="table-action" variant="danger" @click="requestRemove(permission.id)">
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
