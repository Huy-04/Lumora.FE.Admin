<script setup lang="ts">
import type { ProductAssetResponse } from "~/features/products/types/products";

const props = withDefaults(defineProps<{
  assets: ProductAssetResponse[];
  selectedAssetId?: string;
  previewImg?: string | null;
  previewFallback?: string;
  previewLabel?: string;
  previewSelectedText?: string;
  previewEmptyText?: string;
  libraryTitle?: string;
  librarySubject?: string;
  librarySubtitle?: string;
  assetAlt?: string;
  pageSize?: number;
  showFallbackPreview?: boolean;
}>(), {
  selectedAssetId: "",
  previewImg: "",
  previewFallback: "None",
  previewLabel: "Preview",
  previewSelectedText: "Image preview",
  previewEmptyText: "Select an asset below",
  libraryTitle: "Asset library",
  librarySubject: "",
  librarySubtitle: "",
  assetAlt: "Product asset",
  pageSize: 8,
  showFallbackPreview: false,
});

const emit = defineEmits<{
  select: [asset: ProductAssetResponse];
}>();

const currentPage = ref(1);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.assets.length / props.pageSize)),
);

const pagedAssets = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  return props.assets.slice(start, start + props.pageSize);
});

const pageSummary = computed(() => {
  if (!props.assets.length) {
    return "0 of 0 assets";
  }

  const start = (currentPage.value - 1) * props.pageSize + 1;
  const end = Math.min(currentPage.value * props.pageSize, props.assets.length);
  return `${start}-${end} of ${props.assets.length} assets`;
});

const selectedAsset = computed(() =>
  props.assets.find((asset) => asset.id === props.selectedAssetId) ?? null,
);

const previewImage = computed(() => {
  if (selectedAsset.value?.img) {
    return selectedAsset.value.img;
  }

  return props.showFallbackPreview ? props.previewImg : "";
});

watch(
  () => props.assets.length,
  () => {
    currentPage.value = Math.min(currentPage.value, totalPages.value);
  },
  { immediate: true },
);

const isAssetSelected = (asset: ProductAssetResponse) => asset.id === props.selectedAssetId;
</script>

<template>
  <div class="grid gap-5">
    <div class="flex flex-wrap items-center justify-between gap-4 border-y border-line/70 py-4">
      <div class="flex min-w-0 items-center gap-3">
        <div class="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-line bg-pearl">
          <img
            v-if="previewImage"
            :src="previewImage"
            :alt="assetAlt"
            class="h-full w-full object-cover"
          >
          <div v-else class="grid h-full w-full place-items-center text-xs font-medium text-smoke">
            {{ previewFallback }}
          </div>
        </div>

        <div class="min-w-0">
          <p class="meta-label">{{ previewLabel }}</p>
          <p class="truncate text-sm font-semibold text-ink">
            {{ selectedAsset ? previewSelectedText : previewEmptyText }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <slot name="preview-actions" />
        <AppBadge v-if="selectedAsset" tone="success">
          Selected
        </AppBadge>
      </div>
    </div>

    <div class="grid gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="grid gap-1">
          <p class="meta-label">{{ libraryTitle }}</p>
          <p class="text-sm text-smoke">
            {{ librarySubtitle || (librarySubject ? `${librarySubject} - ${pageSummary}` : pageSummary) }}
          </p>
        </div>

        <div v-if="totalPages > 1" class="flex items-center gap-3">
          <AppButton
            type="button"
            variant="secondary"
            :disabled="currentPage <= 1"
            @click="currentPage -= 1"
          >
            Previous
          </AppButton>
          <span class="text-sm font-semibold text-smoke">Page {{ currentPage }} / {{ totalPages }}</span>
          <AppButton
            type="button"
            variant="secondary"
            :disabled="currentPage >= totalPages"
            @click="currentPage += 1"
          >
            Next
          </AppButton>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        <button
          v-for="asset in pagedAssets"
          :key="asset.id"
          type="button"
          class="group grid gap-2 rounded-[16px] border p-2 text-left transition duration-200 ease-out"
          :class="isAssetSelected(asset)
            ? 'border-ink bg-panel dark:bg-panel/80'
            : 'border-line bg-surface hover:border-ink/35 hover:bg-surface-quiet'"
          @click="emit('select', asset)"
        >
          <div class="relative aspect-square overflow-hidden rounded-[12px] border border-line bg-pearl">
            <img :src="asset.img" :alt="assetAlt" class="h-full w-full object-cover">
            <span
              v-if="isAssetSelected(asset)"
              class="absolute bottom-2 left-2 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-pearl"
            >
              Selected
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
