<script setup lang="ts">
import type { RoleIndexPageState } from "~/features/roles/composables/useRolesIndexPage";

const props = defineProps<{
  page: RoleIndexPageState;
}>();

const {
  actionError,
  actionPending,
  applyFilters,
  cancelRemove,
  canCreateRole,
  canRemoveRole,
  clearFilters,
  confirmDetail,
  confirmRole,
  confirmTitle,
  error,
  filteredRoles,
  firstItemNumber,
  lastItemNumber,
  loadErrorMessage,
  localFilters,
  page,
  pagedRoles,
  pageSize,
  pageSizeOptions,
  pending,
  goToNextPage,
  goToPreviousPage,
  removeRole,
  requestRemove,
  summaryStats,
  totalPages,
} = props.page;
</script>

<template>
  <AppIndexPage
    v-model="localFilters.keyword.value"
    eyebrow="Roles API"
    search-label="Search roles"
    search-placeholder="Search by role name or description"
    create-route="/roles/create"
    create-label="Create role"
    :can-create="canCreateRole"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="roles"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :action-error="actionError"
    action-error-title="Role action failed"
    :items-length="filteredRoles.length"
    empty-title="No roles found"
    empty-detail="Try another search or create a new role."
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
        :open="confirmRole !== null"
        :title="confirmTitle"
        :detail="confirmDetail"
        confirm-label="Remove"
        tone="danger"
        :loading="actionPending === 'remove'"
        @confirm="removeRole"
        @cancel="cancelRemove"
      />
    </template>

    <template #table>
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-[24%]">Role</th>
            <th class="w-[56%]">Description</th>
            <th class="w-[10%] text-center">Open</th>
            <th v-if="canRemoveRole" class="w-[10%] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in pagedRoles" :key="role.id">
            <td class="align-middle">
              <p class="table-title">{{ role.roleName }}</p>
            </td>
            <td class="align-middle">
              <p class="table-copy !mt-0 text-sm">{{ role.description || "No description yet." }}</p>
            </td>
            <td class="align-middle">
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/roles/${role.id}`">
                  Open
                </NuxtLink>
              </div>
            </td>
            <td v-if="canRemoveRole" class="align-middle">
              <div class="flex justify-center">
                <AppButton class="table-action" variant="danger" @click="requestRemove(role.id)">
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
