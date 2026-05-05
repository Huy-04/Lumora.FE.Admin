<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { CategoryIndexPage } from "~/features/categories/composables/useCategoryIndexPage";

defineProps<{
  page: CategoryIndexPage;
}>();
</script>

<template>
  <AppIndexPage
    eyebrow="Category roots"
    search-label="Search categories"
    :total-items="page.summaryStats.value[0]?.value ?? 0"
    item-label="categories"
    :pending="page.pending.value"
    :error="page.error.value ? 'Error loading data' : null"
    :error-detail="page.error.value ? page.getProblemMessage(page.error.value, 'The category module is unavailable.') : ''"
    :action-error="page.actionError.value"
    action-error-title="Category action failed"
    :items-length="page.filteredRoots.value.length"
    empty-title="No root categories found"
    empty-detail="Adjust the filters or create a new root category."
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
        :open="page.confirmCategory.value !== null"
        :title="page.confirmCategory.value
          ? page.confirmCategoryHasChildren.value
            ? `Cannot remove ${page.confirmCategory.value.name}`
            : `Remove ${page.confirmCategory.value.name}?`
          : ''"
        :detail="page.confirmCategory.value
          ? page.confirmCategoryHasChildren.value
            ? page.categoryHasChildrenMessage(page.confirmCategory.value.name)
            : 'This action soft-deletes the root category.'
          : ''"
        :cancel-label="page.confirmCategoryHasChildren.value ? 'Close' : 'Cancel'"
        :hide-confirm="page.confirmCategoryHasChildren.value"
        :confirm-label="page.confirmCategoryHasChildren.value ? '' : 'Remove'"
        :tone="page.confirmCategoryHasChildren.value ? 'warning' : 'danger'"
        :loading="page.actionPending.value === 'remove'"
        @confirm="page.confirmRemoveAction"
        @cancel="page.cancelRemove"
      />
      <AppConfirm
        :open="page.pendingReorder.value !== null"
        :title="page.pendingReorder.value ? `Move ${page.pendingReorder.value.sourceName}?` : ''"
        :detail="page.pendingReorder.value ? `Place this root category before ${page.pendingReorder.value.targetName}. The full root order will be saved after confirmation.` : ''"
        confirm-label="Save order"
        :loading="page.actionPending.value === 'reorder'"
        @confirm="page.confirmRootReorder"
        @cancel="page.pendingReorder.value = null"
      />
    </template>

    <template #search-input>
      <AppInput
        v-model="page.localKeyword.value"
        label=""
        placeholder="Filter root name or slug"
        @keyup.enter="page.applyFilters"
      />
    </template>

    <template #filters>
      <div class="w-full sm:w-1/3 md:w-1/4">
        <AppSelect
          v-model="page.localActiveFilter.value"
          label="Status"
          :options="[
            { label: 'All root states', value: '' },
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' },
          ]"
        />
      </div>
    </template>

    <template #actions>
      <AppButton variant="primary" @click="page.applyFilters">
        Search
      </AppButton>
      <AppButton
        v-if="page.keyword.value || page.activeFilter.value"
        variant="secondary"
        @click="page.clearFilters"
      >
        Clear
      </AppButton>
      <AppButton
        aria-label="Reload categories"
        class="toolbar-refresh-button"
        icon-only
        variant="secondary"
        @click="page.refresh"
      >
        <PhArrowClockwise color="#171c1a" :size="22" weight="bold" />
      </AppButton>
      <NuxtLink v-if="page.canCreateCategory.value" class="primary-link" to="/categories/create">
        Create root
      </NuxtLink>
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
            <th v-if="page.canActivateCategory.value || page.canDeactivateCategory.value || page.canRestoreCategory.value" class="w-[120px] text-center">State</th>
            <th v-if="page.canDeleteCategory.value" class="w-[96px] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="root in page.pagedRoots.value"
            :key="root.id"
            :draggable="page.canDragRoots.value"
            :class="{
              'cursor-grab': page.canDragRoots.value,
              'opacity-55': page.dragSourceId.value === root.id,
              'bg-moss/10': page.dragTargetId.value === root.id,
            }"
            @dragstart="page.handleRootDragStart(root.id)"
            @dragend="page.resetDragState"
            @dragover.prevent="page.handleRootDragOver(root.id)"
            @drop.prevent="page.handleRootDrop(root.id)"
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
                {{ page.activeChildCount(root) }} active child categories
              </p>
            </td>
            <td class="align-middle">{{ root.sortOrder }}</td>
            <td class="align-middle">
              <AppBadge :tone="page.statusTone(root)">
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
            <td v-if="page.canActivateCategory.value || page.canDeactivateCategory.value || page.canRestoreCategory.value" class="align-middle">
              <div class="flex justify-center">
                <AppButton
                  v-if="root.isDeleted && page.canRestoreCategory.value"
                  class="table-action"
                  variant="secondary"
                  :loading="page.actionPending.value === 'remove' && page.actionTargetId.value === root.id"
                  @click="page.restoreCategory(root)"
                >
                  Restore
                </AppButton>
                <AppButton
                  v-if="!root.isDeleted && (root.isActive ? page.canDeactivateCategory.value : page.canActivateCategory.value)"
                  class="table-action"
                  variant="secondary"
                  :loading="page.actionPending.value === 'toggle' && page.actionTargetId.value === root.id"
                  @click="page.toggleCategory(root)"
                >
                  {{ root.isActive ? "Deactivate" : "Activate" }}
                </AppButton>
              </div>
            </td>
            <td v-if="page.canDeleteCategory.value" class="align-middle">
              <div class="flex justify-center">
                <AppButton v-if="!root.isDeleted" class="table-action whitespace-nowrap" variant="danger" @click="page.requestRemove(root.id)">
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
