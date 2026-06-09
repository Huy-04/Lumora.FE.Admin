import type { CategoryTreeNodeResponse } from "~/features/categories/types";
import type { ProductResponse } from "~/features/products/types";

export const useProductIndexPage = async () => {
  const productApi = useProductAdminApi();
  const categoryApi = useCategoryAdminApi();
  const authz = useAdminAuthorization();
  const { findNode } = useCategoryTreeCatalog();
  const { productStatusOptions, genderTargetOptions, featureFilterOptions, deletedFilterOptions } = useProductOptions();

  const canReadCategories = computed(() => authz.can(ADMIN_PERMISSION.categoryReadAll));
  const canCreateProduct = computed(() => authz.can(ADMIN_PERMISSION.productCreateAll));
  const canDeleteProduct = computed(() => authz.can(ADMIN_PERMISSION.productDeleteAll));
  const canRestoreProduct = computed(() => authz.can(ADMIN_PERMISSION.productRestoreAll));
  const canReorderProduct = computed(() => authz.can(ADMIN_PERMISSION.productReorderAll));
  const canPublishProduct = computed(() => authz.can(ADMIN_PERMISSION.productPublishAll));
  const canDiscontinueProduct = computed(() => authz.can(ADMIN_PERMISSION.productDiscontinueAll));
  const canFeatureProduct = computed(() => authz.can(ADMIN_PERMISSION.productFeatureAll));

  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      {
        keyword: "",
        status: "",
        genderTarget: "",
        feature: "",
        deleted: "",
        category: "",
      },
      { onApply: () => { pagination.page.value = 1; } },
    );

  const { data, pending, error, refresh } = await useAsyncData(
    () => `products:${appliedFilters.keyword.value || "all"}:${appliedFilters.status.value || "all"}:${appliedFilters.genderTarget.value || "all"}:${appliedFilters.feature.value || "all"}:${appliedFilters.deleted.value || "all"}:${appliedFilters.category.value || "all"}:${pagination.page.value}:${pagination.pageSize.value}`,
    async () => {
      const hasFilter = Boolean(
        appliedFilters.keyword.value
        || appliedFilters.status.value
        || appliedFilters.genderTarget.value
        || appliedFilters.feature.value
        || appliedFilters.deleted.value
        || appliedFilters.category.value,
      );

      const products = hasFilter
        ? await productApi.searchProducts({
          keyword: appliedFilters.keyword.value || undefined,
          status: appliedFilters.status.value || undefined,
          genderTarget: appliedFilters.genderTarget.value || undefined,
          isFeatured: appliedFilters.feature.value || undefined,
          isDeleted: appliedFilters.deleted.value || undefined,
          categoryId: appliedFilters.category.value || undefined,
          page: pagination.page.value,
          size: Number(pagination.pageSize.value),
        })
        : await productApi.getAllProducts(pagination.page.value, Number(pagination.pageSize.value));

      const categoryTree = canReadCategories.value
        ? await categoryApi.getCategoryTree()
        : [];

      return {
        products,
        categoryTree,
      };
    },
  );

  const realtimeRefresh = useRealtimeRefresh(refresh);
  useCatalogRealtime((notification) => {
    if (notification.entity === "product" || notification.entity === "category") {
      realtimeRefresh.scheduleRefresh();
    }
  });

  const items = computed(() => data.value?.products.items ?? []);
  const totalProducts = computed(() => data.value?.products.totalCount ?? 0);
  const categoryTree = computed<CategoryTreeNodeResponse[]>(() => data.value?.categoryTree ?? []);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The product directory is not available right now."));

  watch(() => data.value?.products.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const categoryNameFor = (product: ProductResponse) =>
    findNode(categoryTree.value, product.categoryId)?.name ?? product.categoryId;

  const categoryFilterOptions = computed(() => {
    const options: Array<{ label: string; value: string }> = [{ label: "All categories", value: "" }];
    for (const root of categoryTree.value) {
      options.push({ label: `${root.name} (root)`, value: root.id });
      for (const child of root.children) {
        options.push({ label: `  ${child.name}`, value: child.id });
      }
    }
    return options;
  });

  const isClearFilter = (value: string) => !value || value === "";

  const canDragProducts = computed(() =>
    canReorderProduct.value
    && !appliedFilters.keyword.value.trim()
    && isClearFilter(appliedFilters.status.value)
    && isClearFilter(appliedFilters.genderTarget.value)
    && isClearFilter(appliedFilters.feature.value)
    && isClearFilter(appliedFilters.category.value)
    && appliedFilters.deleted.value === "false"
    && items.value.length > 1
    && items.value.length === totalProducts.value
    && items.value.every((product) => !product.isDeleted),
  );

  const summaryStats = computed(() => [
    {
      label: "Products",
      value: `${items.value.length}`,
      detail: "Product records in the current result set.",
    },
    {
      label: "Published",
      value: `${items.value.filter((product) => product.status === "Published").length}`,
      detail: "Products currently live on storefront-facing surfaces.",
    },
    {
      label: "Draft",
      value: `${items.value.filter((product) => product.status === "Draft").length}`,
      detail: "Products still being prepared before launch.",
    },
    {
      label: "Featured",
      value: `${items.value.filter((product) => product.isFeatured).length}`,
      detail: "Products flagged for emphasis in merchandising flows.",
    },
  ]);

  const productActions = useProductIndexActions(
    productApi,
    items,
    canDragProducts,
    refresh,
  );

  return {
    applyFilters,
    canCreateProduct,
    canDeleteProduct,
    canDragProducts,
    canDiscontinueProduct,
    canFeatureProduct,
    canPublishProduct,
    canReorderProduct,
    canRestoreProduct,
    categoryFilterOptions,
    categoryNameFor,
    clearFilters,
    deletedFilterOptions,
    error,
    featureFilterOptions,
    genderTargetOptions,
    hasActiveFilters,
    items,
    loadErrorMessage,
    localFilters,
    pending,
    productStatusOptions,
    refresh,
    summaryStats,
    totalProducts,
    ...productActions,
    ...pagination,
  };
};

export type ProductIndexPageState = Awaited<ReturnType<typeof useProductIndexPage>>;
