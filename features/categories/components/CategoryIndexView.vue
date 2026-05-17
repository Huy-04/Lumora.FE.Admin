<script setup lang="ts">
import type { CategoryIndexPageState } from "~/features/categories/composables/useCategoryIndexPage";

const props = defineProps<{
  page: CategoryIndexPageState;
}>();

const {
  actionError,
  actionPending,
  actionTargetId,
  activeChildCount,
  applyFilters,
  canActivateCategory,
  canCreateCategory,
  canDeactivateCategory,
  canDeleteCategory,
  canDragRoots,
  canRestoreCategory,
  cancelRemove,
  categoryHasChildrenMessage,
  clearFilters,
  confirmCategory,
  confirmCategoryHasChildren,
  confirmRemoveAction,
  confirmRootReorder,
  dragSourceId,
  dragTargetId,
  error,
  filteredRoots,
  firstItemNumber,
  handleRootDragOver,
  handleRootDragStart,
  handleRootDrop,
  lastItemNumber,
  loadErrorMessage,
  localFilters,
  page,
  pagedRoots,
  pageSize,
  pageSizeOptions,
  pending,
  pendingReorder,
  goToNextPage,
  goToPreviousPage,
  requestRemove,
  resetDragState,
  restoreCategory,
  statusTone,
  summaryStats,
  toggleCategory,
  totalPages,
} = props.page;
</script>

<template>
  <AppIndexPage
    v-model="localFilters.keyword.value"
    eyebrow="Category roots"
    search-label="Search categories"
    search-placeholder="Filter root name or slug"
    create-route="/categories/create"
    create-label="Create root"
    :can-create="canCreateCategory"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="categories"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :action-error="actionError"
    action-error-title="Category action failed"
    :items-length="filteredRoots.length"
    empty-title="No root categories found"
    empty-detail="Adjust the filters or create a new root category."
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
        :open="confirmCategory !== null"
        :title="confirmCategory
          ? confirmCategoryHasChildren
            ? `Cannot remove ${confirmCategory.name}`
            : `Remove ${confirmCategory.name}?`
          : ''"
        :detail="confirmCategory
          ? confirmCategoryHasChildren
            ? categoryHasChildrenMessage(confirmCategory.name)
            : 'This action soft-deletes the root category.'
          : ''"
        :cancel-label="confirmCategoryHasChildren ? 'Close' : 'Cancel'"
        :hide-confirm="confirmCategoryHasChildren"
        :confirm-label="confirmCategoryHasChildren ? '' : 'Remove'"
        :tone="confirmCategoryHasChildren ? 'warning' : 'danger'"
        :loading="actionPending === 'remove'"
        @confirm="confirmRemoveAction"
        @cancel="cancelRemove"
      />
      <AppConfirm
        :open="pendingReorder !== null"
        :title="pendingReorder ? `Move ${pendingReorder.sourceName}?` : ''"
        :detail="pendingReorder ? `Place this root category before ${pendingReorder.targetName}. The full root order will be saved after confirmation.` : ''"
        confirm-label="Save order"
        :loading="actionPending === 'reorder'"
        @confirm="confirmRootReorder"
        @cancel="pendingReorder = null"
      />
    </template>

    <template #filters>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.activeFilter.value"
          label="Status"
          :options="[
            { label: 'All root states', value: '' },
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' },
          ]"
        />
      </div>
    </template>

    <template #table>
      <table class="data-table">
        <thead>
          <tr>
            <th class="min-w-[260px]">Root category</th>
            <th class="min-w-[130px]">Children</th>
            <th class="min-w-[90px]">Sort</th>
            <th class="min-w-[110px]">Status</th>
            <th class="w-[110px] text-center">Open</th>
            <th v-if="canActivateCategory || canDeactivateCategory || canRestoreCategory" class="w-[120px] text-center">State</th>
            <th v-if="canDeleteCategory" class="w-[96px] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="root in pagedRoots"
            :key="root.id"
            :draggable="canDragRoots"
            :class="{
              'cursor-grab': canDragRoots,
              'opacity-55': dragSourceId === root.id,
              'bg-moss/10': dragTargetId === root.id,
            }"
            @dragstart="handleRootDragStart(root.id)"
            @dragend="resetDragState"
            @dragover.prevent="handleRootDragOver(root.id)"
            @drop.prevent="handleRootDrop(root.id)"
          >
            <td class="align-middle">
              <p class="table-title">{{ root.name }}</p>
              <p class="table-copy">{{ root.slug }}</p>
            </td>
            <td class="align-middle">
              <p class="text-sm font-medium text-ink">
                {{ root.children.length }} total
              </p>
              <p class="table-copy">
                {{ activeChildCount(root) }} active child categories
              </p>
            </td>
            <td class="align-middle">{{ root.sortOrder }}</td>
            <td class="align-middle">
              <AppBadge :tone="statusTone(root)">
                {{ root.isDeleted ? "Deleted" : root.isActive ? "Active" : "Inactive" }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <div class="flex justify-center">
                <NuxtLink
                  class="secondary-link table-action"
                  :to="`/categories/${root.id}`"
                >
                  Open
                </NuxtLink>
              </div>
            </td>
            <td v-if="canActivateCategory || canDeactivateCategory || canRestoreCategory" class="align-middle">
              <div class="flex justify-center">
                <AppButton
                  v-if="root.isDeleted && canRestoreCategory"
                  class="table-action"
                  variant="secondary"
                  :loading="actionPending === 'remove' && actionTargetId === root.id"
                  @click="restoreCategory(root)"
                >
                  Restore
                </AppButton>
                <AppButton
                  v-if="!root.isDeleted && (root.isActive ? canDeactivateCategory : canActivateCategory)"
                  class="table-action"
                  variant="secondary"
                  :loading="actionPending === 'toggle' && actionTargetId === root.id"
                  @click="toggleCategory(root)"
                >
                  {{ root.isActive ? "Deactivate" : "Activate" }}
                </AppButton>
              </div>
            </td>
            <td v-if="canDeleteCategory" class="align-middle">
              <div class="flex justify-center">
                <AppButton v-if="!root.isDeleted" class="table-action whitespace-nowrap" variant="danger" @click="requestRemove(root.id)">
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
