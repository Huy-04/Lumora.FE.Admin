import type { ProductStatus, ProductVariantResponse } from "~/features/products/types";

export const useProductVariantsTab = (
  props: {
    productId: string;
    productStatus: ProductStatus;
    variants: ProductVariantResponse[];
    canUpdate: boolean;
    canReorder: boolean;
  },
  onRefresh: () => void,
) => {
  const productApi = useProductAdminApi();

  const confirmVariantId = ref("");
  const actionPending = ref<"" | "remove" | "default" | "status" | "reorder">("");
  const actionTargetId = ref("");
  const actionError = ref("");
  const dragSourceId = ref("");
  const dragTargetId = ref("");
  const pendingReorder = ref<null | {
    sourceId: string;
    sourceName: string;
    targetId: string;
    targetName: string;
  }>(null);

  const actionErrorOpen = computed(() => actionError.value.length > 0);

  const closeActionError = () => {
    actionError.value = "";
  };

  const confirmVariant = computed(() =>
    props.variants.find((variant) => variant.id === confirmVariantId.value) ?? null,
  );

  const blockedStatusVariantId = ref("");

  const blockedStatusVariant = computed(() =>
    props.variants.find((variant) => variant.id === blockedStatusVariantId.value) ?? null,
  );

  const activeVariantCount = computed(() =>
    props.variants.filter((variant) => variant.status === "Active").length,
  );

  const canDragVariants = computed(() =>
    props.canReorder
    && props.variants.length > 1,
  );

  const publishedVariantStatusMessage = "Published products must keep at least one active variant. Activate another variant or move the product out of Published before deactivating this one.";
  const defaultVariantStatusMessage = "Default variants must stay active. Set another default variant before deactivating this one.";
  const inactiveDefaultVariantMessage = "Only active variants can become the default variant.";

  const isDeactivateBlocked = (variant: ProductVariantResponse) =>
    props.productStatus === "Published"
    && variant.status === "Active"
    && activeVariantCount.value <= 1;

  const isRemoveBlocked = (variant: ProductVariantResponse) =>
    props.productStatus === "Published"
    && variant.status === "Active"
    && activeVariantCount.value <= 1;

  const isSetDefaultBlocked = (variant: ProductVariantResponse) =>
    variant.status !== "Active";

  const getVariantStatusErrorMessage = (error: unknown) => {
    const problem = getProblemDetails(error);
    const hasActiveVariantRule = problem?.status === 409
      && Array.isArray(problem.errors)
      && problem.errors.some((entry) => entry.field === "VariantStatus" && entry.errorCode === "InvalidStatus");

    if (hasActiveVariantRule) {
      return publishedVariantStatusMessage;
    }

    const hasDefaultVariantRule = problem?.status === 409
      && Array.isArray(problem.errors)
      && problem.errors.some((entry) => entry.field === "VariantIsDefault" && entry.errorCode === "InvalidStatus");

    if (hasDefaultVariantRule) {
      return defaultVariantStatusMessage;
    }

    return getProblemMessage(error, "Unable to update the variant status.");
  };

  const removeVariant = async () => {
    if (!confirmVariantId.value) {
      return;
    }

    if (confirmVariant.value && isRemoveBlocked(confirmVariant.value)) {
      blockedStatusVariantId.value = confirmVariantId.value;
      confirmVariantId.value = "";
      return;
    }

    actionPending.value = "remove";
    actionTargetId.value = confirmVariantId.value;
    actionError.value = "";

    try {
      await productApi.removeProductVariant(props.productId, confirmVariantId.value);
      confirmVariantId.value = "";
      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to remove the variant.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const setDefault = async (variantId: string) => {
    const variant = props.variants.find((entry) => entry.id === variantId);
    if (!variant || isSetDefaultBlocked(variant)) {
      return;
    }

    actionPending.value = "default";
    actionTargetId.value = variantId;
    actionError.value = "";

    try {
      await productApi.setProductDefaultVariant(props.productId, variantId);
      onRefresh();
    } catch (requestError) {
      const problem = getProblemDetails(requestError);
      const hasDefaultVariantRule = problem?.status === 409
        && Array.isArray(problem.errors)
        && problem.errors.some((entry) => entry.field === "VariantIsDefault" && entry.errorCode === "InvalidStatus");

      actionError.value = hasDefaultVariantRule
        ? inactiveDefaultVariantMessage
        : getProblemMessage(requestError, "Unable to change the default variant.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const updateStatus = async (variantId: string) => {
    const variant = props.variants.find((entry) => entry.id === variantId);

    if (!variant) {
      return;
    }

    actionPending.value = "status";
    actionTargetId.value = variantId;
    actionError.value = "";

    if (isDeactivateBlocked(variant)) {
      blockedStatusVariantId.value = variantId;
      actionPending.value = "";
      actionTargetId.value = "";
      return;
    }

    try {
      await productApi.changeProductVariantStatus(props.productId, variantId, {
        status: variant.status === "Active" ? "Inactive" : "Active",
      });
      onRefresh();
    } catch (requestError) {
      actionError.value = getVariantStatusErrorMessage(requestError);
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const resetDragState = () => {
    dragSourceId.value = "";
    dragTargetId.value = "";
  };

  const handleVariantDragStart = (variantId: string) => {
    if (!canDragVariants.value) {
      return;
    }

    dragSourceId.value = variantId;
    dragTargetId.value = "";
  };

  const handleVariantDragOver = (variantId: string) => {
    if (!canDragVariants.value || !dragSourceId.value || dragSourceId.value === variantId) {
      return;
    }

    dragTargetId.value = variantId;
  };

  const handleVariantDrop = (targetId: string) => {
    if (!canDragVariants.value || !dragSourceId.value || dragSourceId.value === targetId) {
      resetDragState();
      return;
    }

    const sourceVariant = props.variants.find((variant) => variant.id === dragSourceId.value);
    const targetVariant = props.variants.find((variant) => variant.id === targetId);

    if (!sourceVariant || !targetVariant) {
      resetDragState();
      return;
    }

    pendingReorder.value = {
      sourceId: sourceVariant.id,
      sourceName: sourceVariant.name,
      targetId: targetVariant.id,
      targetName: targetVariant.name,
    };

    resetDragState();
  };

  const buildReorderItems = () => {
    if (!pendingReorder.value) {
      return [];
    }

    const ordered = [...props.variants];
    const sourceIndex = ordered.findIndex((variant) => variant.id === pendingReorder.value?.sourceId);
    const targetIndex = ordered.findIndex((variant) => variant.id === pendingReorder.value?.targetId);

    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return [];
    }

    const [movedVariant] = ordered.splice(sourceIndex, 1);
    const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    ordered.splice(insertIndex, 0, movedVariant);

    return ordered.map((variant, index) => ({
      variantId: variant.id,
      sortOrder: index + 1,
    }));
  };

  const confirmReorder = async () => {
    const items = buildReorderItems();
    if (!items.length) {
      pendingReorder.value = null;
      return;
    }

    actionPending.value = "reorder";
    actionError.value = "";

    try {
      await productApi.reorderProductVariants(props.productId, { items });
      pendingReorder.value = null;
      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to reorder the variants.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionErrorOpen,
    actionPending,
    actionTargetId,
    blockedStatusVariant,
    blockedStatusVariantId,
    canDragVariants,
    closeActionError,
    confirmReorder,
    confirmVariant,
    confirmVariantId,
    defaultVariantStatusMessage,
    dragSourceId,
    dragTargetId,
    handleVariantDragOver,
    handleVariantDragStart,
    handleVariantDrop,
    inactiveDefaultVariantMessage,
    isSetDefaultBlocked,
    pendingReorder,
    publishedVariantStatusMessage,
    removeVariant,
    resetDragState,
    setDefault,
    updateStatus,
  };
};
