export const useProductVariantCreatePage = async () => {
  const route = useRoute();
  const productApi = useProductAdminApi();
  const authz = useAdminAuthorization();
  const { parseOptionalNumber, parseRequiredNumber } = useNumericForm();

  const productId = computed(() => route.params.productId as string);
  const canUpdateProduct = computed(() => authz.can(ADMIN_PERMISSION.productUpdateAll));

  const form = reactive({
    sku: "",
    name: "",
    price: "",
    compareAtPrice: "",
  });

  const pending = ref(false);
  const errorMessage = ref("");

  const { data: product, pending: productPending, error: productError } = await useAsyncData(
    () => `product-variant-create:${productId.value}`,
    async () => productApi.getProductById(productId.value),
  );

  const canCreateVariant = computed(() => canUpdateProduct.value && !product.value?.isDeleted);

  const findCreatedVariantId = async (sku: string) => {
    const variants = await productApi.getProductVariants(productId.value);
    const matchingVariant = variants.find((entry) => entry.sku === sku)
      ?? [...variants].sort((left, right) => right.sortOrder - left.sortOrder)[0];

    return matchingVariant?.id ?? "";
  };

  const submit = async () => {
    if (!canCreateVariant.value) {
      return;
    }

    pending.value = true;
    errorMessage.value = "";

    try {
      const normalizedSku = form.sku.trim().toUpperCase();

      await productApi.addProductVariant(productId.value, {
        sku: normalizedSku,
        name: form.name,
        price: parseRequiredNumber(form.price, "Price"),
        compareAtPrice: parseOptionalNumber(form.compareAtPrice, "Compare-at price"),
        productAssetId: null,
      });

      const createdVariantId = await findCreatedVariantId(normalizedSku);

      if (createdVariantId) {
        await navigateTo(`/products/${productId.value}/variants/${createdVariantId}`);
        return;
      }

      await navigateTo(`/products/${productId.value}?tab=variants`);
    } catch (requestError) {
      errorMessage.value = getProblemMessage(requestError, "Unable to create the variant.");
    } finally {
      pending.value = false;
    }
  };

  return {
    productError,
    productPending,
    product,
    productId,
    form,
    canUpdateProduct,
    canCreateVariant,
    pending,
    errorMessage,
    submit,
  };
};

export type ProductVariantCreatePage = Awaited<ReturnType<typeof useProductVariantCreatePage>>;
