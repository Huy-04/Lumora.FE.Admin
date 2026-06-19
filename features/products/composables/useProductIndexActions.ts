import type { ProductResponse } from "~/features/products/types/products";

type ProductIndexActionKey =
  | ""
  | "remove"
  | "status"
  | "feature"
  | "restore"
  | "reorder"
  | "discontinue";

export const useProductIndexActions = (
  productApi: ReturnType<typeof useProductAdminApi>,
  items: ComputedRef<ProductResponse[]>,
  canDragProducts: ComputedRef<boolean>,
  refresh: () => Promise<void>,
) => {
  const confirmProductId = ref("");
  const actionPending = ref<ProductIndexActionKey>("");
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

  const confirmProduct = computed(() =>
    items.value.find((product) => product.id === confirmProductId.value) ?? null,
  );

  const getPublicationBlockedReasons = (requestError: unknown, action: "publish" | "republish") => {
    const problem = getProblemDetails(requestError);
    const normalizedErrors = Array.isArray(problem?.errors) ? problem.errors : [];
    const blockedReasons: string[] = [];

    if (normalizedErrors.some((entry) => entry.field === "VariantStatus" && entry.errorCode === "InvalidStatus")) {
      blockedReasons.push(`Add or activate at least one variant before ${action}ing.`);
    }

    if (normalizedErrors.some((entry) => entry.field === "ProductId" && entry.errorCode === "Required")) {
      blockedReasons.push(`Add at least one gallery image before ${action}ing.`);
    }

    if (action === "republish"
      && normalizedErrors.some((entry) => entry.field === "ProductStatus" && entry.errorCode === "InvalidStatus")) {
      blockedReasons.push("Only discontinued products can be republished.");
    }

    return blockedReasons;
  };

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
      const publishBlockedReasons = getPublicationBlockedReasons(requestError, "publish");

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
    publishBlockedMessage.value = "";

    try {
      await productApi.republishProduct(productId);
      await refresh();
    } catch (requestError) {
      const publishBlockedReasons = getPublicationBlockedReasons(requestError, "republish");

      if (publishBlockedReasons.length) {
        publishBlockedMessage.value = publishBlockedReasons.join(" ");
        confirmPublishBlockedOpen.value = true;
      } else {
        actionError.value = getProblemMessage(requestError, "Unable to republish the product.");
      }
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

  return {
    actionError,
    actionPending,
    actionTargetId,
    confirmProduct,
    confirmProductId,
    confirmProductReorder,
    confirmPublishBlockedOpen,
    discontinueProduct,
    dragSourceId,
    dragTargetId,
    handleProductDragOver,
    handleProductDragStart,
    handleProductDrop,
    pendingReorder,
    publishBlockedMessage,
    publishProduct,
    removeProduct,
    republishProduct,
    requestRemove,
    resetDragState,
    restoreProduct,
    toggleFeatured,
    unpublishProduct,
  };
};
