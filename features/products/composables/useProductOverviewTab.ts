import type {
  ProductAttributeResponse,
  ProductGalleryResponse,
  ProductResponse,
  ProductVariantResponse,
} from "~/features/products/types";

export const useProductOverviewTab = (
  props: {
    product: ProductResponse;
    variants: ProductVariantResponse[];
    gallery: ProductGalleryResponse | null;
    attributes: ProductAttributeResponse | null;
    canRestore: boolean;
  },
  onRefresh: () => void,
) => {
  const { formatDateTime, enumLabel } = useAuthPresentation();
  const productApi = useProductAdminApi();

  const activeVariants = computed(() => props.variants.filter((variant) => variant.status === "Active").length);
  const primaryImage = computed(() => props.gallery?.images.find((image) => image.isPrimary) ?? null);
  const actionPending = ref<"" | "restore">("");
  const actionError = ref("");

  const actionErrorOpen = computed(() => actionError.value.length > 0);

  const closeActionError = () => {
    actionError.value = "";
  };

  const restoreProduct = async () => {
    actionPending.value = "restore";
    actionError.value = "";

    try {
      await productApi.restoreProduct(props.product.id);
      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to restore the product.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionErrorOpen,
    actionPending,
    activeVariants,
    closeActionError,
    enumLabel,
    formatDateTime,
    primaryImage,
    restoreProduct,
  };
};
