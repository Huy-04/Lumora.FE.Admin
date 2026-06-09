<script setup lang="ts">
import type { ProductAssetResponse } from "~/features/products/types";

const props = defineProps<{
  productId: string;
  assets: ProductAssetResponse[];
  canUpdate: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();
const {
  actionError,
  actionErrorOpen,
  actionPending,
  allPageSelected,
  clearUploadSelection,
  closeActionError,
  confirmAssetIds,
  confirmAssets,
  confirmTitle,
  currentPage,
  fileInput,
  handleFileChange,
  isAssetSelected,
  openFilePicker,
  pagedAssets,
  pageSummary,
  queueBatchRemove,
  queueSingleRemove,
  removeAsset,
  selectedCount,
  selectedFiles,
  toggleAssetSelection,
  togglePageSelection,
  totalPages,
  uploadAsset,
  uploadOverflowCount,
  uploadPreviewNames,
  uploadSelectionCount,
  uploadSelectionSummary,
} = useProductAssetsTab(props, () => emit("refresh"));
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppConfirm
      :open="confirmAssets.length > 0"
      :title="confirmTitle"
      detail="This deletes the file from Supabase and removes it from this product asset library. It cannot be removed while the product cover or gallery still uses it."
      :confirm-label="confirmAssets.length > 1 ? 'Remove assets' : 'Remove asset'"
      tone="danger"
      :loading="actionPending === 'remove'"
      @confirm="removeAsset"
      @cancel="confirmAssetIds = []"
    />
    <AppConfirm
      :open="actionErrorOpen"
      title="Asset action failed"
      :detail="actionError"
      cancel-label="Close"
      tone="danger"
      hide-confirm
      @cancel="closeActionError"
    />

    <AppPanel eyebrow="Product assets">
      <div class="form-stack">
        <AppNotice v-if="!canUpdate" tone="warning" title="Read-only access">
          Product update permission is required to upload or remove assets.
        </AppNotice>

        <ClientOnly>
        <div v-if="canUpdate" class="grid gap-4 rounded-[28px] border border-line/70 bg-panel px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:bg-panel/80">
          <div class="space-y-1">
            <p class="app-label">Upload images</p>
            <p class="text-sm text-smoke">
              Choose one or many images, then upload them to the reusable product asset library.
            </p>
          </div>

          <div class="rounded-[24px] border border-line/70 bg-surface px-4 py-3">
            <p class="text-sm font-medium text-ink">{{ uploadSelectionSummary }}</p>
            <div v-if="uploadPreviewNames.length" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="fileName in uploadPreviewNames"
                :key="fileName"
                class="rounded-full border border-line/70 bg-pearl px-3 py-1 text-xs text-smoke"
              >
                {{ fileName }}
              </span>
              <span
                v-if="uploadOverflowCount"
                class="rounded-full border border-line/70 bg-pearl px-3 py-1 text-xs text-smoke"
              >
                +{{ uploadOverflowCount }} more
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
            <button
              v-if="selectedFiles.length"
              type="button"
              class="secondary-link"
              @click="clearUploadSelection"
            >
              Clear selection
            </button>
            <input
              ref="fileInput"
              class="sr-only"
              type="file"
              accept="image/jpeg, image/png, image/webp"
              multiple
              @change="handleFileChange"
            >
            <AppButton type="button" variant="secondary" @click="openFilePicker">
              Choose images
            </AppButton>
            <AppButton
              :loading="actionPending === 'upload'"
              :disabled="!selectedFiles.length"
              @click="uploadAsset"
            >
              Upload {{ uploadSelectionCount > 1 ? `${uploadSelectionCount} assets` : "asset" }}
            </AppButton>
          </div>
        </div>
        </ClientOnly>

        <div v-if="assets.length" class="grid gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-line/70 bg-surface px-4 py-3 text-sm text-smoke">
            <div class="space-y-1">
              <p>{{ pageSummary }}</p>
              <span v-if="selectedCount">{{ selectedCount }} selected</span>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <AppButton
                v-if="canUpdate && selectedCount"
                type="button"
                variant="danger"
                @click="queueBatchRemove"
              >
                Remove selected
              </AppButton>
              <div v-if="totalPages > 1" class="flex items-center gap-3">
                <AppButton
                  type="button"
                  variant="ghost"
                  :disabled="currentPage <= 1"
                  @click="currentPage -= 1"
                >
                  Previous
                </AppButton>
                <span>Page {{ currentPage }} / {{ totalPages }}</span>
                <AppButton
                  type="button"
                  variant="ghost"
                  :disabled="currentPage >= totalPages"
                  @click="currentPage += 1"
                >
                  Next
                </AppButton>
              </div>
            </div>
          </div>

          <div class="table-shell overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th v-if="canUpdate" class="w-[84px] text-center">
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-line"
                    :checked="allPageSelected"
                    @change="togglePageSelection"
                  >
                </th>
                <th class="w-[140px] text-center">Image</th>
                <th class="min-w-[320px]">Storage path</th>
                <th v-if="canUpdate" class="w-[140px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asset in pagedAssets" :key="asset.id">
                <td v-if="canUpdate" class="align-middle">
                  <div class="flex justify-center">
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-line"
                      :checked="isAssetSelected(asset.id)"
                      @change="toggleAssetSelection(asset.id)"
                    >
                  </div>
                </td>
                <td class="align-middle">
                  <div class="flex justify-center">
                    <ClientOnly>
                      <img
                        :src="asset.img"
                        alt="Product asset"
                        class="h-20 w-20 rounded-lg border border-line/60 object-cover"
                      >
                      <template #fallback>
                        <div class="h-20 w-20 rounded-lg border border-line/60 bg-pearl" />
                      </template>
                    </ClientOnly>
                  </div>
                </td>
                <td class="align-middle">
                  <p class="break-all text-sm text-smoke">{{ asset.storagePath }}</p>
                </td>
                <td v-if="canUpdate" class="align-middle">
                  <div class="flex justify-center">
                    <AppButton class="table-action" variant="danger" @click="queueSingleRemove(asset.id)">
                      Remove
                    </AppButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>

        <AppEmptyState
          v-else
          title="No product assets yet"
          detail="Upload the first image asset before selecting cover or gallery imagery."
        />
      </div>
    </AppPanel>
  </div>
</template>
