<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { ProductIndexPageState } from "~/features/products/composables/useProductIndexPage";

const props = defineProps<{
  page: ProductIndexPageState;
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  actionTargetId,
  applyFilters,
  canCreateProduct,
  canDeleteProduct,
  canDragProducts,
  canFeatureProduct,
  canPublishProduct,
  canReorderProduct,
  canRestoreProduct,
  categoryFilter,
  categoryFilterOptions,
  categoryNameFor,
  clearFilters,
  confirmProduct,
  confirmProductId,
  confirmProductReorder,
  confirmPublishBlockedOpen,
  deletedFilter,
  deletedFilterOptions,
  dragSourceId,
  dragTargetId,
  error,
  featureFilter,
  featureFilterOptions,
  firstItemNumber,
  genderTargetFilter,
  genderTargetOptions,
  goToNextPage,
  goToPreviousPage,
  handleProductDragOver,
  handleProductDragStart,
  handleProductDrop,
  items,
  keyword,
  lastItemNumber,
  loadErrorMessage,
  localCategoryFilter,
  localDeletedFilter,
  localFeatureFilter,
  localGenderTargetFilter,
  localKeyword,
  localStatusFilter,
  page,
  pageSize,
  pageSizeOptions,
  pending,
  pendingReorder,
  productStatusOptions,
  publishBlockedMessage,
  publishProduct,
  refresh,
  removeProduct,
  requestRemove,
  resetDragState,
  restoreProduct,
  statusFilter,
  summaryStats,
  toggleFeatured,
  totalPages,
  totalProducts,
  unpublishProduct,
} = props.page;
</script>

<template>
  <AppIndexPage
    eyebrow="Product records"
    search-label="Search products"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="products"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :action-success="actionSuccess"
    action-success-title="Product updated"
    :action-error="actionError"
    action-error-title="Product action failed"
    :items-length="items.length"
    empty-title="No products found"
    empty-detail="Adjust the filters or create the first product."
    :first-item-number="firstItemNumber"
    :last-item-number="lastItemNumber"
    v-model:page-size="pageSize"
    :page-size-options="pageSizeOptions"
    :page="page"
    :total-pages="totalPages"
    @previous-page="goToPreviousPage"
    @next-page="goToNextPage"
  >
    <template #modals>
      <AppConfirm
        :open="confirmPublishBlockedOpen"
        title="Cannot publish product"
        :detail="publishBlockedMessage"
        cancel-label="Close"
        :hide-confirm="true"
        tone="warning"
        @cancel="confirmPublishBlockedOpen = false"
      />
      <AppConfirm
        :open="pendingReorder !== null"
        :title="pendingReorder ? `Move ${pendingReorder.sourceName}?` : ''"
        :detail="pendingReorder ? `Place this product before ${pendingReorder.targetName}. The full product order will be saved after confirmation.` : ''"
        confirm-label="Save order"
        :loading="actionPending === 'reorder'"
        @confirm="confirmProductReorder"
        @cancel="pendingReorder = null"
      />
      <AppConfirm
        :open="confirmProduct !== null"
        :title="confirmProduct ? `Remove ${confirmProduct.name}?` : ''"
        :detail="confirmProduct ? 'This action soft-deletes the product record.' : ''"
        confirm-label="Remove"
        tone="danger"
        :loading="actionPending === 'remove'"
        @confirm="removeProduct"
        @cancel="confirmProductId = ''"
      />
    </template>

    <template #search-input>
      <AppInput v-model="localKeyword" label="" placeholder="Search by name, slug, or description" @keyup.enter="applyFilters" />
    </template>

    <template #actions>
      <AppButton variant="primary" @click="applyFilters">
        Search
      </AppButton>
      <AppButton
        v-if="keyword || statusFilter || genderTargetFilter || featureFilter || deletedFilter || categoryFilter"
        variant="secondary"
        @click="clearFilters"
      >
        Clear
      </AppButton>
      <AppButton aria-label="Reload products" class="toolbar-refresh-button" icon-only variant="secondary" @click="refresh">
        <PhArrowClockwise color="#171c1a" :size="22" weight="bold" />
      </AppButton>
      <NuxtLink v-if="canCreateProduct" class="primary-link" to="/products/create">
        Create product
      </NuxtLink>
    </template>

    <template #filters>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localStatusFilter"
          label="Status"
          :options="[{ label: 'All product states', value: '' }, ...productStatusOptions]"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localCategoryFilter"
          label="Category"
          :options="categoryFilterOptions"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localGenderTargetFilter"
          label="Gender target"
          :options="[{ label: 'All targets', value: '' }, ...genderTargetOptions]"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFeatureFilter"
          label="Featured"
          :options="featureFilterOptions"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localDeletedFilter"
          label="Record state"
          :options="deletedFilterOptions"
        />
      </div>
    </template>

    <template #notices>
      <!-- Ensure the custom notice for drag-n-drop stays inside the notices slot -->
      <AppNotice
        v-if="!canDragProducts && items.length > 1 && !pending && !error && canReorderProduct"
        tone="warning"
        title="Drag reorder is temporarily disabled"
      >
        Select "Active only" in Record state filter to drag and reorder the full product list.
      </AppNotice>
      
      <!-- We also need to manually handle standard notices because we override the slot -->
      <AppNotice v-if="error" tone="danger" title="Unable to load products">
        {{ loadErrorMessage }}
      </AppNotice>

      <AppNotice v-if="actionSuccess" tone="success" title="Product updated">
        {{ actionSuccess }}
      </AppNotice>

      <AppNotice v-if="actionError" tone="danger" title="Product action failed">
        {{ actionError }}
      </AppNotice>
    </template>

    <template #table>
      <table class="data-table min-w-[1430px]">
        <thead>
          <tr>
            <th class="min-w-[220px]">Product</th>
            <th class="min-w-[160px]">Category</th>
            <th class="min-w-[100px]">Status</th>
            <th class="min-w-[110px]">Record</th>
            <th class="min-w-[100px]">Featured</th>
            <th class="min-w-[110px]">Target</th>
            <th class="min-w-[90px]">Sort</th>
            <th class="min-w-[160px] text-center">State</th>
            <th class="min-w-[130px] text-center">Feature</th>
            <th class="w-[96px] text-center">Open</th>
            <th v-if="canDeleteProduct" class="w-[96px] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in items"
            :key="product.id"
            :draggable="canDragProducts"
            :class="{
              'cursor-grab': canDragProducts,
              'opacity-55': dragSourceId === product.id,
              'bg-moss/10': dragTargetId === product.id,
            }"
            @dragstart="handleProductDragStart(product.id)"
            @dragend="resetDragState"
            @dragover.prevent="handleProductDragOver(product.id)"
            @drop.prevent="handleProductDrop(product.id)"
          >
            <td class="align-middle">
              <p class="table-title">{{ product.name }}</p>
              <p class="table-copy">{{ product.slug }}</p>
            </td>
            <td class="align-middle">
              <p class="text-sm text-smoke">{{ categoryNameFor(product) }}</p>
            </td>
            <td class="align-middle">
              <AppBadge :tone="product.status === 'Published' ? 'success' : product.status === 'Discontinued' ? 'warning' : 'default'">
                {{ product.status }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge :tone="product.isDeleted ? 'danger' : 'default'">
                {{ product.isDeleted ? "Deleted" : "Active" }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge :tone="product.isFeatured ? 'success' : 'default'">
                {{ product.isFeatured ? "Featured" : "Standard" }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <p class="text-sm text-smoke">{{ product.genderTarget }}</p>
            </td>
            <td class="align-middle">{{ product.sortOrder }}</td>
            <td class="align-middle">
              <div class="flex flex-wrap justify-center gap-2">
                <AppButton
                  v-if="product.isDeleted && canRestoreProduct"
                  class="table-action"
                  variant="secondary"
                  :loading="actionPending === 'restore' && actionTargetId === product.id"
                  @click="restoreProduct(product.id)"
                >
                  Restore
                </AppButton>
                <AppButton
                  v-else-if="!product.isDeleted && canPublishProduct && product.status !== 'Published'"
                  class="table-action"
                  variant="secondary"
                  :loading="actionPending === 'status' && actionTargetId === product.id"
                  @click="publishProduct(product.id)"
                >
                  Publish
                </AppButton>
                <AppButton
                  v-else-if="!product.isDeleted && canPublishProduct && product.status === 'Published'"
                  class="table-action"
                  variant="secondary"
                  :loading="actionPending === 'status' && actionTargetId === product.id"
                  @click="unpublishProduct(product.id)"
                >
                  Unpublish
                </AppButton>
              </div>
            </td>
            <td class="align-middle">
              <div class="flex justify-center">
                <AppButton
                  v-if="!product.isDeleted && canFeatureProduct"
                  class="table-action"
                  variant="secondary"
                  :loading="actionPending === 'feature' && actionTargetId === product.id"
                  @click="toggleFeatured(product)"
                >
                  {{ product.isFeatured ? "Unfeature" : "Feature" }}
                </AppButton>
              </div>
            </td>
            <td class="align-middle">
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/products/${product.id}`">
                  Open
                </NuxtLink>
              </div>
            </td>
            <td v-if="canDeleteProduct" class="align-middle">
              <div class="flex justify-center">
                <AppButton
                  v-if="!product.isDeleted"
                  class="table-action whitespace-nowrap"
                  variant="danger"
                  :loading="actionPending === 'remove' && actionTargetId === product.id"
                  @click="requestRemove(product.id)"
                >
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
