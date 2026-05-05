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

const productApi = useProductAdminApi();

const selectedFiles = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const confirmAssetIds = ref<string[]>([]);
const selectedAssetIds = ref<string[]>([]);
const actionPending = ref<"" | "upload" | "remove">("");
const actionError = ref("");
const actionSuccess = ref("");
const currentPage = ref(1);
const assetsPerPage = 8;

const confirmAssets = computed(() =>
  props.assets.filter((asset) => confirmAssetIds.value.includes(asset.id)),
);

const confirmTitle = computed(() => {
  if (!confirmAssets.value.length) {
    return "";
  }

  return confirmAssets.value.length === 1
    ? "Remove asset?"
    : `Remove ${confirmAssets.value.length} assets?`;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.assets.length / assetsPerPage)),
);

const pagedAssets = computed(() => {
  const start = (currentPage.value - 1) * assetsPerPage;
  return props.assets.slice(start, start + assetsPerPage);
});

const pageSummary = computed(() => {
  if (!props.assets.length) {
    return "0 of 0 assets";
  }

  const start = (currentPage.value - 1) * assetsPerPage + 1;
  const end = Math.min(currentPage.value * assetsPerPage, props.assets.length);
  return `${start}-${end} of ${props.assets.length} assets`;
});

const selectedCount = computed(() => selectedAssetIds.value.length);
const uploadSelectionCount = computed(() => selectedFiles.value.length);
const uploadSelectionSummary = computed(() => {
  if (!selectedFiles.value.length) {
    return "No images selected yet.";
  }

  if (selectedFiles.value.length === 1) {
    return selectedFiles.value[0].name;
  }

  return `${selectedFiles.value.length} images ready to upload.`;
});

const uploadPreviewNames = computed(() => selectedFiles.value.slice(0, 3).map((file) => file.name));
const uploadOverflowCount = computed(() => Math.max(0, selectedFiles.value.length - uploadPreviewNames.value.length));

const allPageSelected = computed(() =>
  pagedAssets.value.length > 0
  && pagedAssets.value.every((asset) => selectedAssetIds.value.includes(asset.id)),
);

const isAssetSelected = (assetId: string) => selectedAssetIds.value.includes(assetId);

const toggleAssetSelection = (assetId: string) => {
  if (selectedAssetIds.value.includes(assetId)) {
    selectedAssetIds.value = selectedAssetIds.value.filter((id) => id !== assetId);
    return;
  }

  selectedAssetIds.value = [...selectedAssetIds.value, assetId];
};

const togglePageSelection = () => {
  const pageIds = pagedAssets.value.map((asset) => asset.id);

  if (allPageSelected.value) {
    selectedAssetIds.value = selectedAssetIds.value.filter((id) => !pageIds.includes(id));
    return;
  }

  selectedAssetIds.value = Array.from(new Set([...selectedAssetIds.value, ...pageIds]));
};

const queueSingleRemove = (assetId: string) => {
  confirmAssetIds.value = [assetId];
};

const queueBatchRemove = () => {
  if (!selectedAssetIds.value.length) {
    return;
  }

  confirmAssetIds.value = [...selectedAssetIds.value];
};

const handleFileChange = (event: Event) => {
  try {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      selectedFiles.value = Array.from(files);
    }
    actionError.value = "";
    actionSuccess.value = "";
  } catch {
    actionError.value = "Failed to process selected files.";
  }
};

const clearUploadSelection = () => {
  selectedFiles.value = [];
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const uploadAsset = async () => {
  if (!props.canUpdate || !selectedFiles.value.length) {
    return;
  }

  actionPending.value = "upload";
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await productApi.uploadProductAssets(props.productId, selectedFiles.value);
    const uploadedCount = selectedFiles.value.length;
    clearUploadSelection();
    currentPage.value = 1;
    actionSuccess.value = uploadedCount === 1
      ? "Asset uploaded."
      : `${uploadedCount} assets uploaded.`;
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to upload the selected product assets.");
  } finally {
    actionPending.value = "";
  }
};

const removeAsset = async () => {
  if (!confirmAssetIds.value.length) {
    return;
  }

  actionPending.value = "remove";
  actionError.value = "";
  actionSuccess.value = "";

  try {
    if (confirmAssetIds.value.length === 1) {
      await productApi.removeProductAsset(props.productId, confirmAssetIds.value[0]);
      actionSuccess.value = "Asset removed.";
    } else {
      await productApi.removeProductAssets(props.productId, confirmAssetIds.value);
      actionSuccess.value = `${confirmAssetIds.value.length} assets removed.`;
    }

    selectedAssetIds.value = selectedAssetIds.value.filter((id) => !confirmAssetIds.value.includes(id));
    confirmAssetIds.value = [];
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(
      requestError,
      "Remove these assets from product cover and gallery before deleting them from the asset library.",
    );
  } finally {
    actionPending.value = "";
  }
};

watch(
  () => props.assets.length,
  () => {
    currentPage.value = Math.min(currentPage.value, totalPages.value);
    selectedAssetIds.value = selectedAssetIds.value.filter((id) => props.assets.some((asset) => asset.id === id));
  },
  { immediate: true },
);
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

    <AppPanel title="Product assets" description="Upload and manage the reusable image pool for this product. Product cover and gallery images should be selected from this library.">
      <div class="form-stack">
        <AppNotice v-if="!canUpdate" tone="warning" title="Read-only access">
          Product update permission is required to upload or remove assets.
        </AppNotice>

        <ClientOnly>
        <div v-if="canUpdate" class="grid gap-4 rounded-[28px] border border-line/70 bg-panel px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:bg-panel/80">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-1">
              <p class="app-label">Upload images</p>
              <p class="text-sm text-smoke">
                Choose one or many images, then upload them to the reusable product asset library.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <label class="secondary-link cursor-pointer">
                Choose images
                <input
                  ref="fileInput"
                  class="sr-only"
                  type="file"
                  accept="image/*"
                  multiple
                  @change="handleFileChange"
                >
              </label>
              <AppButton
                :loading="actionPending === 'upload'"
                :disabled="!selectedFiles.length"
                @click="uploadAsset"
              >
                Upload {{ uploadSelectionCount > 1 ? `${uploadSelectionCount} assets` : "asset" }}
              </AppButton>
            </div>
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

          <div v-if="selectedFiles.length" class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="secondary-link"
              @click="clearUploadSelection"
            >
              Clear selection
            </button>
          </div>
        </div>
        </ClientOnly>

        <AppNotice v-if="actionSuccess" tone="success" title="Assets updated">
          {{ actionSuccess }}
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Asset action failed">
          {{ actionError }}
        </AppNotice>

        <div v-if="assets.length" class="grid gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-line/70 bg-surface px-4 py-3 text-sm text-smoke">
            <div class="flex flex-wrap items-center gap-3">
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
