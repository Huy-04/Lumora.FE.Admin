import type { CategoryTreeNodeResponse } from "~/features/categories/types";
import type { ProductResponse } from "~/features/products/types";

export const useProductIndexPage = async () => {
  // 1. Dependency injection
  const productApi = useProductAdminApi();
  const categoryApi = useCategoryAdminApi();
  const authz = useAdminAuthorization();
  const { findNode } = useCategoryTreeCatalog();
  const { productStatusOptions, genderTargetOptions, featureFilterOptions, deletedFilterOptions } = useProductOptions();

  // 2. Permissions
  const canReadCategories = computed(() => authz.can(ADMIN_PERMISSION.categoryReadAll));
  const canCreateProduct = computed(() => authz.can(ADMIN_PERMISSION.productCreateAll));
  const canDeleteProduct = computed(() => authz.can(ADMIN_PERMISSION.productDeleteAll));
  const canRestoreProduct = computed(() => authz.can(ADMIN_PERMISSION.productRestoreAll));
  const canReorderProduct = computed(() => authz.can(ADMIN_PERMISSION.productReorderAll));
  const canPublishProduct = computed(() => authz.can(ADMIN_PERMISSION.productPublishAll));
  const canDiscontinueProduct = computed(() => authz.can(ADMIN_PERMISSION.productDiscontinueAll));
  const canFeatureProduct = computed(() => authz.can(ADMIN_PERMISSION.productFeatureAll));

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
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

  // 5. Data fetching
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

  // 6. Computed derivations
  const items = computed(() => data.value?.products.items ?? []);
  const totalProducts = computed(() => data.value?.products.totalCount ?? 0);
  const categoryTree = computed<CategoryTreeNodeResponse[]>(() => data.value?.categoryTree ?? []);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The product directory is not available right now."));

  // Wire totalItems to fetched data
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

  // 7. Actions/mutations
  const confirmProductId = ref("");
  const actionPending = ref<"" | "remove" | "status" | "feature" | "restore" | "reorder" | "discontinue">("");
  const actionTargetId = ref("");
  const actionError = ref("");
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

  const confirmProduct = computed(() => items.value.find((product) => product.id === confirmProductId.value) ?? null);

  const requestRemove = (productId: string) => {
    confirmProductId.value = productId;
    actionError.value = "";
  };

  const removeProduct = async () => {
    if (!confirmProductId.value) {
      return;
    }

    actionPending.value = "remove";
    actionTargetId.value = confirmProductId.value;
    actionError.value = "";

    try {
      if (confirmProduct.value?.isDeleted) {
        confirmProductId.value = "";
        return;
      }

      await productApi.deleteProduct(confirmProductId.value);

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

    try {
      await productApi.restoreProduct(productId);
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
    publishBlockedMessage.value = "";

    try {
      await productApi.publishProduct(productId);
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

    try {
      await productApi.unpublishProduct(productId);
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to unpublish the product.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const discontinueProduct = async (productId: string) => {
    actionPending.value = "discontinue";
    actionTargetId.value = productId;
    actionError.value = "";

    try {
      await productApi.discontinueProduct(productId);
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to discontinue the product.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const republishProduct = async (productId: string) => {
    actionPending.value = "status";
    actionTargetId.value = productId;
    actionError.value = "";

    try {
      await productApi.republishProduct(productId);
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to republish the product.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const toggleFeatured = async (product: ProductResponse) => {
    actionPending.value = "feature";
    actionTargetId.value = product.id;
    actionError.value = "";

    try {
      if (product.isFeatured) {
        await productApi.unmarkProductFeatured(product.id);
      } else {
        await productApi.markProductFeatured(product.id);
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

    try {
      await productApi.reorderProducts({
        items: pendingReorder.value.items,
      });

      pendingReorder.value = null;
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to reorder products.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  // 8. Watchers
  // (pagination reset on filter/pageSize change is handled by useFilters onApply and usePagination internal watcher)

  // 9. Return statement
  return {
    actionError,
    actionPending,
    actionTargetId,
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
    confirmProduct,
    confirmProductId,
    confirmProductReorder,
    confirmPublishBlockedOpen,
    deletedFilterOptions,
    discontinueProduct,
    dragSourceId,
    dragTargetId,
    error,
    featureFilterOptions,
    genderTargetOptions,
    handleProductDragOver,
    handleProductDragStart,
    handleProductDrop,
    hasActiveFilters,
    items,
    loadErrorMessage,
    localFilters,
    pending,
    pendingReorder,
    productStatusOptions,
    publishBlockedMessage,
    publishProduct,
    refresh,
    removeProduct,
    republishProduct,
    requestRemove,
    resetDragState,
    restoreProduct,
    summaryStats,
    toggleFeatured,
    totalProducts,
    unpublishProduct,
    ...pagination,
  };
};

export type ProductIndexPageState = Awaited<ReturnType<typeof useProductIndexPage>>;
