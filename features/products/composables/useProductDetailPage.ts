import type { CategoryTreeNodeResponse } from "~/features/categories/types";

export const useProductDetailPage = async () => {
  const route = useRoute();
  const categoryApi = useCategoryAdminApi();
  const productApi = useProductAdminApi();
  const authz = useAdminAuthorization();
  const { findNode, toOptions } = useCategoryTreeCatalog();
  const emptyCategoryTree: CategoryTreeNodeResponse[] = [];

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
        canReadCategories.value
          ? resolveSection("category catalog", categoryApi.getCategoryTree())
          : Promise.resolve(emptyCategoryTree),
        productApi.getProductVariants(productId.value),
        resolveSection("assets", productApi.getProductAssets(productId.value)),
        resolveSection("gallery", productApi.getProductGallery(productId.value)),
        resolveSection("attributes", productApi.getProductAttributes(productId.value)),
      ]);

      return {
        product,
        categoryTree: categoryTree ?? emptyCategoryTree,
        variants,
        assets,
        gallery,
        attributes,
      };
    },
  );

  const realtimeRefresh = useRealtimeRefresh(refresh);
  useCatalogRealtime((notification) => {
    if (notification.entity === "product" && notification.entityId === productId.value) {
      realtimeRefresh.scheduleRefresh();
    }
  });

  const canEditProduct = computed(() => canUpdateProduct.value && !data.value?.product?.isDeleted);
  const canManageProductContent = computed(() => canUpdateProduct.value && !data.value?.product?.isDeleted);
  const tabState = useProductDetailTabs(route, productId, canEditProduct);
  const canUseCategoryCatalog = computed(() =>
    canReadCategories.value && !productSectionWarnings.value.includes("category catalog"),
  );

  const categoryLabel = computed(() => {
    if (!data.value?.product) {
      return "";
    }

    return findNode(data.value.categoryTree as CategoryTreeNodeResponse[], data.value.product.categoryId)?.name
      ?? data.value.product.categoryId;
  });

  const categoryOptions = computed(() => toOptions((data.value?.categoryTree ?? []) as CategoryTreeNodeResponse[]));

  return {
    error,
    pending,
    data,
    canUseCategoryCatalog,
    categoryLabel,
    productSectionWarnings,
    canRestoreProduct,
    productId,
    canManageProductContent,
    canReorderProduct,
    canReadCategories,
    canPublishProduct,
    canDiscontinueProduct,
    categoryOptions,
    refresh,
    ...tabState,
  };
};

export type ProductDetailPage = Awaited<ReturnType<typeof useProductDetailPage>>;
