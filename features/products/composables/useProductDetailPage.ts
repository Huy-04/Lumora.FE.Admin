import type { CategoryTreeNodeResponse } from "~/features/categories/types";

export const useProductDetailPage = async () => {
  const route = useRoute();
  const categoryApi = useCategoryAdminApi();
  const productApi = useProductAdminApi();
  const authz = useAdminAuthorization();
  const { findNode, toOptions } = useCategoryTreeCatalog();

  type ProductTab = "overview" | "edit" | "variants" | "assets" | "gallery" | "attributes";

  const productId = computed(() => route.params.id as string);
  const canReadCategories = computed(() => authz.can(ADMIN_PERMISSION.categoryReadAll));
  const canUpdateProduct = computed(() => authz.can(ADMIN_PERMISSION.productUpdateAll));
  const canReorderProduct = computed(() => authz.can(ADMIN_PERMISSION.productReorderAll));
  const canRestoreProduct = computed(() => authz.can(ADMIN_PERMISSION.productRestoreAll));
  const canPublishProduct = computed(() => authz.can(ADMIN_PERMISSION.productPublishAll));
  const canDiscontinueProduct = computed(() => authz.can(ADMIN_PERMISSION.productDiscontinueAll));
  const productSectionWarnings = ref<string[]>([]);

  const resolveSection = async <T>(label: string, request: Promise<T>) => {
    try {
      return await request;
    } catch {
      productSectionWarnings.value = [...productSectionWarnings.value, label];
      return null;
    }
  };

  const { data, pending, error, refresh } = await useAsyncData(
    () => `product-detail:${productId.value}`,
    async () => {
      productSectionWarnings.value = [];

      const [product, categoryTree, variants, assets, gallery, attributes] = await Promise.all([
        productApi.getProductById(productId.value),
        canReadCategories.value ? categoryApi.getCategoryTree() : Promise.resolve([]),
        productApi.getProductVariants(productId.value),
        resolveSection("assets", productApi.getProductAssets(productId.value)),
        resolveSection("gallery", productApi.getProductGallery(productId.value)),
        resolveSection("attributes", productApi.getProductAttributes(productId.value)),
      ]);

      return {
        product,
        categoryTree,
        variants,
        assets,
        gallery,
        attributes,
      };
    },
  );

  const canEditProduct = computed(() => canUpdateProduct.value && !data.value?.product?.isDeleted);
  const canManageProductContent = computed(() => canUpdateProduct.value && !data.value?.product?.isDeleted);

  const productTabs = computed<Array<{ label: string; value: ProductTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Variants", value: "variants" },
    { label: "Assets", value: "assets" },
    { label: "Gallery", value: "gallery" },
    { label: "Attributes", value: "attributes" },
    ...(canEditProduct.value ? [{ label: "Edit", value: "edit" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): ProductTab => {
    const resolved = value === "edit"
      ? "edit"
      : value === "variants"
        ? "variants"
        : value === "assets"
          ? "assets"
          : value === "gallery"
            ? "gallery"
            : value === "attributes"
              ? "attributes"
              : "overview";

    return productTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const activeTab = ref<ProductTab>("overview");

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

  const selectTab = async (tab: ProductTab) => {
    activeTab.value = normalizeTab(tab);

    await navigateTo(
      {
        path: `/products/${productId.value}`,
        query: { tab },
      },
      { replace: true },
    );
  };

  const categoryLabel = computed(() => {
    if (!data.value?.product) {
      return "";
    }

    return findNode(data.value.categoryTree as CategoryTreeNodeResponse[], data.value.product.categoryId)?.name
      ?? data.value.product.categoryId;
  });

  const categoryOptions = computed(() => toOptions((data.value?.categoryTree ?? []) as CategoryTreeNodeResponse[], true));

  return {
    error,
    pending,
    data,
    categoryLabel,
    productSectionWarnings,
    productTabs,
    activeTab,
    selectTab,
    canRestoreProduct,
    productId,
    canManageProductContent,
    canReorderProduct,
    canReadCategories,
    canPublishProduct,
    canDiscontinueProduct,
    categoryOptions,
    refresh,
  };
};

export type ProductDetailPage = Awaited<ReturnType<typeof useProductDetailPage>>;
