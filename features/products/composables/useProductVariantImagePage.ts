import type { ProductAssetResponse, ProductVariantResponse } from "~/features/products/types";

export const useProductVariantImagePage = async () => {
  const route = useRoute();
  const productApi = useProductAdminApi();

  const productId = computed(() => route.params.productId as string);
  const variantId = computed(() => route.params.variantId as string);

  const { data, pending, error, refresh } = await useAsyncData(
    () => `product-variant-image:${productId.value}:${variantId.value}`,
    async () => {
      const [product, variants, assets] = await Promise.all([
        productApi.getProductById(productId.value),
        productApi.getProductVariants(productId.value),
        productApi.getProductAssets(productId.value),
      ]);

      return {
        product,
        variants,
        assets,
      };
    },
  );

  const variant = computed<ProductVariantResponse | null>(() =>
    data.value?.variants.find((entry) => entry.id === variantId.value) ?? null,
  );

  const draftProductAssetId = ref("");
  const savePending = ref(false);
  const saveSuccess = ref("");
  const saveError = ref("");
  const currentPage = ref(1);
  const assetsPerPage = 8;

  const assets = computed(() => data.value?.assets.assets ?? []);

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(assets.value.length / assetsPerPage)),
  );

  const pagedAssets = computed(() => {
    const start = (currentPage.value - 1) * assetsPerPage;
    return assets.value.slice(start, start + assetsPerPage);
  });

  const pageSummary = computed(() => {
    if (!assets.value.length) {
      return "0 of 0 assets";
    }

    const start = (currentPage.value - 1) * assetsPerPage + 1;
    const end = Math.min(currentPage.value * assetsPerPage, assets.value.length);
    return `${start}-${end} of ${assets.value.length} assets`;
  });

  watch(
    () => variant.value,
    (currentVariant) => {
      draftProductAssetId.value = currentVariant?.productAssetId || "";
    },
    { immediate: true },
  );

  watch(
    () => assets.value.length,
    () => {
      currentPage.value = Math.min(currentPage.value, totalPages.value);
    },
    { immediate: true },
  );

  const variantInitial = computed(() =>
    variant.value?.name?.trim()?.charAt(0)?.toUpperCase() || "?",
  );

  const selectedAsset = computed(() =>
    assets.value.find((asset) => asset.id === draftProductAssetId.value) ?? null,
  );

  const selectAsset = (asset: ProductAssetResponse) => {
    draftProductAssetId.value = asset.id;
    saveSuccess.value = "";
    saveError.value = "";
  };

  const removeImage = () => {
    draftProductAssetId.value = "";
    saveSuccess.value = "";
    saveError.value = "";
  };

  const resetDraft = () => {
    draftProductAssetId.value = variant.value?.productAssetId || "";
    saveSuccess.value = "";
    saveError.value = "";
  };

  const isAssetSelected = (asset: ProductAssetResponse) => draftProductAssetId.value === asset.id;

  const submitImage = async () => {
    if (!variant.value) {
      return;
    }

    savePending.value = true;
    saveSuccess.value = "";
    saveError.value = "";

    try {
      await productApi.updateProductVariant(productId.value, variantId.value, {
        sku: variant.value.sku,
        name: variant.value.name,
        price: variant.value.price,
        compareAtPrice: variant.value.compareAtPrice ?? null,
        productAssetId: draftProductAssetId.value || null,
      });

      saveSuccess.value = "Variant image updated.";
      await refresh();
    } catch (requestError) {
      saveError.value = getProblemMessage(requestError, "Unable to save the variant image.");
    } finally {
      savePending.value = false;
    }
  };

  return {
    productId,
    variantId,
    variant,
    pending,
    error,
    data,
    submitImage,
    selectedAsset,
    variantInitial,
    pageSummary,
    totalPages,
    currentPage,
    pagedAssets,
    isAssetSelected,
    selectAsset,
    removeImage,
    resetDraft,
    saveSuccess,
    saveError,
    savePending,
  };
};

export type ProductVariantImagePage = Awaited<ReturnType<typeof useProductVariantImagePage>>;
