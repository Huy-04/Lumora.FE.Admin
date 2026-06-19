import type { ProductAssetResponse } from "~/features/products/types/products";

export const useProductGalleryCreatePage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const productApi = useProductAdminApi();
  const authz = useAdminAuthorization();

  const productId = computed(() => route.params.productId as string);
  const canUpdateProduct = computed(() => authz.can(ADMIN_PERMISSION.productUpdateAll));

  // 2. Form state
  const form = reactive({
    assetId: "",
    alt: "",
  });

  // 3. Submission state
  const pending = ref(false);
  const errorMessage = ref("");
  const currentPage = ref(1);
  const assetsPerPage = 8;

  // 4. Computed / derived state
  const { data: product, pending: productPending, error: productError } = await useAsyncData(
    () => `product-gallery-create:${productId.value}`,
    async () => {
      const [product, assets] = await Promise.all([
        productApi.getProductById(productId.value),
        productApi.getProductAssets(productId.value),
      ]);

      return {
        product,
        assets,
      };
    },
  );

  const assets = computed(() => product.value?.assets.assets ?? []);

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

  const selectedAsset = computed(() =>
    assets.value.find((asset) => asset.id === form.assetId) ?? null,
  );

  watchEffect(() => {
    if (!form.assetId && assets.value.length) {
      form.assetId = assets.value[0].id;
    }
  });

  watch(
    () => assets.value.length,
    () => {
      currentPage.value = Math.min(currentPage.value, totalPages.value);
    },
    { immediate: true },
  );

  const canCreateImage = computed(() =>
    canUpdateProduct.value
    && !product.value?.product?.isDeleted
    && Boolean(form.assetId),
  );

  // 5. Actions
  const selectAsset = (asset: ProductAssetResponse) => {
    form.assetId = asset.id;
    errorMessage.value = "";
  };

  const isAssetSelected = (asset: ProductAssetResponse) => form.assetId === asset.id;

  const submit = async () => {
    if (!canCreateImage.value) {
      return;
    }

    pending.value = true;
    errorMessage.value = "";

    try {
      await productApi.addProductImage(productId.value, {
        assetId: form.assetId,
        alt: form.alt || null,
      });

      await navigateTo(`/products/${productId.value}?tab=gallery`);
    } catch (requestError) {
      errorMessage.value = getProblemMessage(requestError, "Unable to create the gallery image.");
    } finally {
      pending.value = false;
    }
  };

  // 6. Return statement
  return {
    productError,
    productPending,
    product,
    productId,
    assets,
    totalPages,
    pagedAssets,
    pageSummary,
    selectedAsset,
    currentPage,
    canUpdateProduct,
    form,
    errorMessage,
    pending,
    canCreateImage,
    selectAsset,
    isAssetSelected,
    submit,
  };
};

export type ProductGalleryCreatePage = Awaited<ReturnType<typeof useProductGalleryCreatePage>>;
