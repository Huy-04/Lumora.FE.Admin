import type { ProductAssetResponse } from "~/features/products/types";

export const useProductAssetsTab = (
  props: {
    productId: string;
    assets: ProductAssetResponse[];
    canUpdate: boolean;
  },
  onRefresh: () => void,
) => {
  const productApi = useProductAdminApi();

  const selectedFiles = ref<File[]>([]);
  const fileInput = ref<HTMLInputElement | null>(null);
  const confirmAssetIds = ref<string[]>([]);
  const selectedAssetIds = ref<string[]>([]);
  const actionPending = ref<"" | "upload" | "remove">("");
  const actionError = ref("");
  const currentPage = ref(1);
  const assetsPerPage = 8;

  const actionErrorOpen = computed(() => actionError.value.length > 0);

  const closeActionError = () => {
    actionError.value = "";
  };

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

  const openFilePicker = () => {
    fileInput.value?.click();
  };

  const handleFileChange = (event: Event) => {
    try {
      const input = event.target as HTMLInputElement;
      const files = input.files;

      if (files && files.length > 0) {
        selectedFiles.value = Array.from(files);
      }
      actionError.value = "";
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

    if (selectedFiles.value.length > 10) {
      actionError.value = "Maximum 10 files allowed per upload. Please select fewer files.";
      return;
    }

    actionPending.value = "upload";
    actionError.value = "";

    try {
      if (selectedFiles.value.length === 1) {
        await productApi.uploadProductAsset(props.productId, selectedFiles.value[0]);
      } else {
        await productApi.uploadProductAssets(props.productId, selectedFiles.value);
      }

      clearUploadSelection();
      currentPage.value = 1;
      onRefresh();
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

    try {
      if (confirmAssetIds.value.length === 1) {
        await productApi.removeProductAsset(props.productId, confirmAssetIds.value[0]);
      } else {
        await productApi.removeProductAssets(props.productId, confirmAssetIds.value);
      }

      selectedAssetIds.value = selectedAssetIds.value.filter((id) => !confirmAssetIds.value.includes(id));
      confirmAssetIds.value = [];
      onRefresh();
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

  return {
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
  };
};
