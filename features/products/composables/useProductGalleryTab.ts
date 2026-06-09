import type { ProductGalleryResponse, ProductStatus } from "~/features/products/types";

export const useProductGalleryTab = (
  props: {
    productId: string;
    productStatus: ProductStatus;
    gallery: ProductGalleryResponse | null;
    canUpdate: boolean;
    canReorder: boolean;
  },
  onRefresh: () => void,
) => {
  const productApi = useProductAdminApi();

  const confirmImageId = ref("");
  const actionPending = ref<"" | "remove" | "primary" | "reorder">("");
  const actionTargetId = ref("");
  const actionError = ref("");
  const dragSourceId = ref("");
  const dragTargetId = ref("");
  const pendingReorder = ref<null | {
    sourceId: string;
    sourceLabel: string;
    targetId: string;
    targetLabel: string;
  }>(null);

  const actionErrorOpen = computed(() => actionError.value.length > 0);

  const closeActionError = () => {
    actionError.value = "";
  };

  const confirmImage = computed(() =>
    props.gallery?.images.find((image) => image.id === confirmImageId.value) ?? null,
  );

  const confirmImageRemoveBlocked = computed(() =>
    props.productStatus === "Published"
    && Boolean(confirmImage.value)
    && (props.gallery?.images.length ?? 0) <= 1,
  );

  const blockedImageRemoveMessage = "Published products must keep at least one gallery image. Add another image or move the product out of Published before removing this one.";

  const isImageRemoveBlockedByPublishedLastImage = (requestError: unknown) => {
    const problem = getProblemDetails(requestError);
    const normalizedErrors = Array.isArray(problem?.errors) ? problem.errors : [];

    return problem?.status === 409
      && normalizedErrors.some((entry) =>
        entry.field === "ProductStatus" && entry.errorCode === "InvalidStatus");
  };

  const removeImage = async () => {
    if (!confirmImageId.value) {
      return;
    }

    actionPending.value = "remove";
    actionTargetId.value = confirmImageId.value;
    actionError.value = "";

    try {
      await productApi.removeProductImage(props.productId, confirmImageId.value);
      confirmImageId.value = "";
      onRefresh();
    } catch (requestError) {
      actionError.value = isImageRemoveBlockedByPublishedLastImage(requestError)
        ? blockedImageRemoveMessage
        : getProblemMessage(requestError, "Unable to remove the image.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const confirmRemoveImageAction = async () => {
    if (confirmImageRemoveBlocked.value) {
      confirmImageId.value = "";
      return;
    }

    await removeImage();
  };

  const setPrimary = async (imageId: string) => {
    actionPending.value = "primary";
    actionTargetId.value = imageId;
    actionError.value = "";

    try {
      await productApi.setPrimaryProductImage(props.productId, imageId);
      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to set the primary image.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const saveOrder = async () => {
    if (!pendingReorder.value || !props.gallery?.images?.length) {
      pendingReorder.value = null;
      return;
    }

    actionPending.value = "reorder";
    actionError.value = "";

    try {
      const ordered = [...props.gallery.images];
      const sourceIndex = ordered.findIndex((image) => image.id === pendingReorder.value?.sourceId);
      const targetIndex = ordered.findIndex((image) => image.id === pendingReorder.value?.targetId);

      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        pendingReorder.value = null;
        actionPending.value = "";
        return;
      }

      const [movedImage] = ordered.splice(sourceIndex, 1);
      const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      ordered.splice(insertIndex, 0, movedImage);

      const items = ordered.map((image, index) => ({
        imageId: image.id,
        sortOrder: index + 1,
      }));

      await productApi.reorderProductImages(props.productId, { items });
      pendingReorder.value = null;
      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to reorder the gallery.");
    } finally {
      actionPending.value = "";
    }
  };

  const canDragImages = computed(() =>
    props.canReorder
    && (props.gallery?.images.length ?? 0) > 1,
  );

  const resetDragState = () => {
    dragSourceId.value = "";
    dragTargetId.value = "";
  };

  const handleImageDragStart = (imageId: string) => {
    if (!canDragImages.value) {
      return;
    }

    dragSourceId.value = imageId;
    dragTargetId.value = "";
  };

  const handleImageDragOver = (imageId: string) => {
    if (!canDragImages.value || !dragSourceId.value || dragSourceId.value === imageId) {
      return;
    }

    dragTargetId.value = imageId;
  };

  const handleImageDrop = (targetId: string) => {
    if (!canDragImages.value || !dragSourceId.value || dragSourceId.value === targetId) {
      resetDragState();
      return;
    }

    const sourceImage = props.gallery?.images.find((image) => image.id === dragSourceId.value);
    const targetImage = props.gallery?.images.find((image) => image.id === targetId);

    if (!sourceImage || !targetImage) {
      resetDragState();
      return;
    }

    pendingReorder.value = {
      sourceId: sourceImage.id,
      sourceLabel: sourceImage.alt || `Image ${sourceImage.sortOrder}`,
      targetId: targetImage.id,
      targetLabel: targetImage.alt || `Image ${targetImage.sortOrder}`,
    };

    resetDragState();
  };

  return {
    actionError,
    actionErrorOpen,
    actionPending,
    actionTargetId,
    blockedImageRemoveMessage,
    canDragImages,
    closeActionError,
    confirmImage,
    confirmImageId,
    confirmImageRemoveBlocked,
    confirmRemoveImageAction,
    dragSourceId,
    dragTargetId,
    handleImageDragOver,
    handleImageDragStart,
    handleImageDrop,
    pendingReorder,
    resetDragState,
    saveOrder,
    setPrimary,
  };
};
