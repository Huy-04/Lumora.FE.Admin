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
  const canFeatureProduct = computed(() => authz.can(ADMIN_PERMISSION.productFeatureAll));

  const localKeyword = ref("");
  const localStatusFilter = ref("");
  const localGenderTargetFilter = ref("");
  const localFeatureFilter = ref("");
  const localDeletedFilter = ref("");
  const localCategoryFilter = ref("");

  const keyword = ref("");
  const statusFilter = ref("");
  const genderTargetFilter = ref("");
  const featureFilter = ref("");
  const deletedFilter = ref("");
  const categoryFilter = ref("");

  const applyFilters = () => {
    keyword.value = localKeyword.value;
    statusFilter.value = localStatusFilter.value;
    genderTargetFilter.value = localGenderTargetFilter.value;
    featureFilter.value = localFeatureFilter.value;
    deletedFilter.value = localDeletedFilter.value;
    categoryFilter.value = localCategoryFilter.value;
  };

  const clearFilters = () => {
    localKeyword.value = "";
    localStatusFilter.value = "";
    localGenderTargetFilter.value = "";
    localFeatureFilter.value = "";
    localDeletedFilter.value = "";
    localCategoryFilter.value = "";
    keyword.value = "";
    statusFilter.value = "";
    genderTargetFilter.value = "";
    featureFilter.value = "";
    deletedFilter.value = "";
    categoryFilter.value = "";
  };

  const confirmProductId = ref("");
  const actionPending = ref<"" | "remove" | "status" | "feature" | "restore" | "reorder">("");
  const actionTargetId = ref("");
  const actionError = ref("");
  const actionSuccess = ref("");
  const confirmPublishBlockedOpen = ref(false);
  const publishBlockedMessage = ref("");
  const dragSourceId = ref("");
  const dragTargetId = ref("");
  const pendingReorder = ref<null | {
    sourceId: string;
    sourceName: string;
    targetName: string;
    items: Array<{ productId: string; sortOrder: number }>;
  }>(null);

  const page = ref(1);
  const pageSize = ref("20");
  const pageSizeOptions = [
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];

  const applyFiltersWithReset = () => {
    page.value = 1;
    applyFilters();
  };

  watch(pageSize, () => { page.value = 1; });

  const { data, pending, error, refresh } = await useAsyncData(
    () => `products:${keyword.value || "all"}:${statusFilter.value || "all"}:${genderTargetFilter.value || "all"}:${featureFilter.value || "all"}:${deletedFilter.value || "all"}:${categoryFilter.value || "all"}:${page.value}:${pageSize.value}`,
    async () => {
      const hasFilter = Boolean(
        keyword.value
        || statusFilter.value
        || genderTargetFilter.value
        || featureFilter.value
        || deletedFilter.value
        || categoryFilter.value,
      );

      const products = hasFilter
        ? await productApi.searchProducts({
          keyword: keyword.value || undefined,
          status: statusFilter.value || undefined,
          genderTarget: genderTargetFilter.value || undefined,
          isFeatured: featureFilter.value || undefined,
          isDeleted: deletedFilter.value || undefined,
          categoryId: categoryFilter.value || undefined,
          page: page.value,
          size: Number(pageSize.value),
        })
        : await productApi.getAllProducts(page.value, Number(pageSize.value));

      const categoryTree = canReadCategories.value
        ? await categoryApi.getCategoryTree()
        : [];

      return {
        products,
        categoryTree,
      };
    },
  );

  const items = computed(() => data.value?.products.items ?? []);
  const totalProducts = computed(() => data.value?.products.totalCount ?? 0);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalProducts.value / Number(pageSize.value))));
  const firstItemNumber = computed(() => totalProducts.value === 0 ? 0 : (page.value - 1) * Number(pageSize.value) + 1);
  const lastItemNumber = computed(() => Math.min(page.value * Number(pageSize.value), totalProducts.value));
  const goToNextPage = () => { if (page.value < totalPages.value) page.value += 1; };
  const goToPreviousPage = () => { if (page.value > 1) page.value -= 1; };
  const categoryTree = computed<CategoryTreeNodeResponse[]>(() => data.value?.categoryTree ?? []);
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
    && !keyword.value.trim()
    && isClearFilter(statusFilter.value)
    && isClearFilter(genderTargetFilter.value)
    && isClearFilter(featureFilter.value)
    && isClearFilter(categoryFilter.value)
    && deletedFilter.value === "false"
    && items.value.length > 1
    && items.value.length === totalProducts.value
    && items.value.every((product) => !product.isDeleted),
  );

  const confirmProduct = computed(() => items.value.find((product) => product.id === confirmProductId.value) ?? null);

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

  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The product directory is not available right now."));

  const requestRemove = (productId: string) => {
    confirmProductId.value = productId;
    actionError.value = "";
    actionSuccess.value = "";
  };

  const removeProduct = async () => {
    if (!confirmProductId.value) {
      return;
    }

    actionPending.value = "remove";
    actionTargetId.value = confirmProductId.value;
    actionError.value = "";
    actionSuccess.value = "";

    try {
      if (confirmProduct.value?.isDeleted) {
        confirmProductId.value = "";
        return;
      }

      await productApi.deleteProduct(confirmProductId.value);
      actionSuccess.value = "Product removed.";

      confirmProductId.value = "";
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to remove the product.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const restoreProduct = async (productId: string) => {
    actionPending.value = "restore";
    actionTargetId.value = productId;
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await productApi.restoreProduct(productId);
      actionSuccess.value = "Product restored.";
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to restore the product.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const publishProduct = async (productId: string) => {
    actionPending.value = "status";
    actionTargetId.value = productId;
    actionError.value = "";
    actionSuccess.value = "";
    publishBlockedMessage.value = "";

    try {
      await productApi.publishProduct(productId);
      actionSuccess.value = "Product published.";
      await refresh();
    } catch (requestError) {
      const problem = getProblemDetails(requestError);
      const normalizedErrors = Array.isArray(problem?.errors) ? problem.errors : [];
      const publishBlockedReasons: string[] = [];

      if (normalizedErrors.some((entry) => entry.field === "VariantStatus" && entry.errorCode === "InvalidStatus")) {
        publishBlockedReasons.push("Add or activate at least one variant before publishing.");
      }

      if (normalizedErrors.some((entry) => entry.field === "ProductId" && entry.errorCode === "Required")) {
        publishBlockedReasons.push("Add at least one gallery image before publishing.");
      }

      if (publishBlockedReasons.length) {
        publishBlockedMessage.value = publishBlockedReasons.join(" ");
        confirmPublishBlockedOpen.value = true;
      } else {
        actionError.value = getProblemMessage(requestError, "Unable to publish the product.");
      }
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const unpublishProduct = async (productId: string) => {
    actionPending.value = "status";
    actionTargetId.value = productId;
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await productApi.unpublishProduct(productId);
      actionSuccess.value = "Product moved back to draft.";
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to unpublish the product.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const toggleFeatured = async (product: ProductResponse) => {
    actionPending.value = "feature";
    actionTargetId.value = product.id;
    actionError.value = "";
    actionSuccess.value = "";

    try {
      if (product.isFeatured) {
        await productApi.unmarkProductFeatured(product.id);
        actionSuccess.value = "Product removed from featured merchandising.";
      } else {
        await productApi.markProductFeatured(product.id);
        actionSuccess.value = "Product marked as featured.";
      }

      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update featured state.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const resetDragState = () => {
    dragSourceId.value = "";
    dragTargetId.value = "";
  };

  const buildReorderItems = (products: ProductResponse[], sourceId: string, targetId: string) => {
    const sourceIndex = products.findIndex((product) => product.id === sourceId);
    const targetIndex = products.findIndex((product) => product.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return null;
    }

    const reordered = [...products];
    const [movedProduct] = reordered.splice(sourceIndex, 1);
    const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    reordered.splice(insertIndex, 0, movedProduct);

    return reordered.map((product, index) => ({
      productId: product.id,
      sortOrder: index + 1,
    }));
  };

  const handleProductDragStart = (productId: string) => {
    if (!canDragProducts.value) {
      return;
    }

    dragSourceId.value = productId;
    dragTargetId.value = "";
  };

  const handleProductDragOver = (productId: string) => {
    if (!canDragProducts.value || !dragSourceId.value || dragSourceId.value === productId) {
      return;
    }

    dragTargetId.value = productId;
  };

  const handleProductDrop = (targetId: string) => {
    if (!canDragProducts.value || !dragSourceId.value || dragSourceId.value === targetId) {
      resetDragState();
      return;
    }

    const itemsForReorder = buildReorderItems(items.value, dragSourceId.value, targetId);
    const sourceProduct = items.value.find((product) => product.id === dragSourceId.value);
    const targetProduct = items.value.find((product) => product.id === targetId);

    if (!itemsForReorder || !sourceProduct || !targetProduct) {
      resetDragState();
      return;
    }

    pendingReorder.value = {
      sourceId: sourceProduct.id,
      sourceName: sourceProduct.name,
      targetName: targetProduct.name,
      items: itemsForReorder,
    };

    resetDragState();
  };

  const confirmProductReorder = async () => {
    if (!pendingReorder.value) {
      return;
    }

    actionPending.value = "reorder";
    actionTargetId.value = pendingReorder.value.sourceId;
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await productApi.reorderProducts({
        items: pendingReorder.value.items,
      });

      actionSuccess.value = "Product order updated.";
      pendingReorder.value = null;
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to reorder products.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    actionSuccess,
    actionTargetId,
    applyFilters: applyFiltersWithReset,
    canCreateProduct,
    canDeleteProduct,
    canDragProducts,
    canFeatureProduct,
    canPublishProduct,
    canReorderProduct,
    canRestoreProduct,
    categoryFilter,
    categoryFilterOptions,
    categoryNameFor,
    clearFilters,
    confirmProduct,
    confirmProductId,
    confirmProductReorder,
    confirmPublishBlockedOpen,
    deletedFilter,
    deletedFilterOptions,
    dragSourceId,
    dragTargetId,
    error,
    featureFilter,
    featureFilterOptions,
    firstItemNumber,
    genderTargetFilter,
    genderTargetOptions,
    goToNextPage,
    goToPreviousPage,
    handleProductDragOver,
    handleProductDragStart,
    handleProductDrop,
    items,
    keyword,
    lastItemNumber,
    loadErrorMessage,
    localCategoryFilter,
    localDeletedFilter,
    localFeatureFilter,
    localGenderTargetFilter,
    localKeyword,
    localStatusFilter,
    page,
    pageSize,
    pageSizeOptions,
    pending,
    pendingReorder,
    productStatusOptions,
    publishBlockedMessage,
    publishProduct,
    refresh,
    removeProduct,
    requestRemove,
    resetDragState,
    restoreProduct,
    statusFilter,
    summaryStats,
    toggleFeatured,
    totalPages,
    totalProducts,
    unpublishProduct,
  };
};

export type ProductIndexPageState = Awaited<ReturnType<typeof useProductIndexPage>>;
