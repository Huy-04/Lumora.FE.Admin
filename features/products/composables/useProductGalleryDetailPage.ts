import type { ProductAssetResponse, ProductImageResponse } from "~/features/products/types";

export const useProductGalleryDetailPage = async () => {
  const route = useRoute();
  const productApi = useProductAdminApi();
  const authz = useAdminAuthorization();

  type GalleryTab = "overview" | "edit";

  const productId = computed(() => route.params.productId as string);
  const imageId = computed(() => route.params.imageId as string);
  const canUpdateProduct = computed(() => authz.can(ADMIN_PERMISSION.productUpdateAll));

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
