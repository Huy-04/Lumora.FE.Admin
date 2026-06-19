import type { ProductAssetResponse, ProductImageResponse } from "~/features/products/types/products";

export const useProductGalleryDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const productApi = useProductAdminApi();
  const authz = useAdminAuthorization();

  type GalleryTab = "overview" | "edit";

  // 2. Permissions
  const productId = computed(() => route.params.productId as string);
  const imageId = computed(() => route.params.imageId as string);
  const canUpdateProduct = computed(() => authz.can(ADMIN_PERMISSION.productUpdateAll));

  // 3. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `product-gallery-detail:${productId.value}:${imageId.value}`,
    async () => {
      const [product, gallery, assets] = await Promise.all([
        productApi.getProductById(productId.value),
        productApi.getProductGallery(productId.value),
        productApi.getProductAssets(productId.value),
      ]);

      return {
        product,
        gallery,
        assets,
      };
    },
  );

  // 4. Computed derivations
  const image = computed<ProductImageResponse | null>(() =>
    data.value?.gallery.images.find((entry) => entry.id === imageId.value) ?? null,
  );

  const assets = computed<ProductAssetResponse[]>(() => data.value?.assets.assets ?? []);

  const canEditImage = computed(() => canUpdateProduct.value && !data.value?.product?.isDeleted);

  const galleryTabs = computed<Array<{ label: string; value: GalleryTab }>>(() => [
    { label: "Overview", value: "overview" },
    ...(canEditImage.value ? [{ label: "Edit", value: "edit" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): GalleryTab => {
    const resolved = value === "edit" ? "edit" : "overview";
    return galleryTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const activeTab = ref<GalleryTab>("overview");

  // 6. Watchers
  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
    { immediate: true },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  // 5. Actions/mutations
  const selectTab = async (tab: GalleryTab) => {
    activeTab.value = normalizeTab(tab);

    await navigateTo(
      {
        path: `/products/${productId.value}/gallery/${imageId.value}`,
        query: { tab },
      },
      { replace: true },
    );
  };

  // 7. Return statement
  return {
    error,
    pending,
    data,
    productId,
    imageId,
    image,
    assets,
    galleryTabs,
    activeTab,
    selectTab,
    refresh,
  };
};

export type ProductGalleryDetailPage = Awaited<ReturnType<typeof useProductGalleryDetailPage>>;
