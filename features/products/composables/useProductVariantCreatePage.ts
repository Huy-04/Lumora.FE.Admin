export const useProductVariantCreatePage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const productApi = useProductAdminApi();
  const authz = useAdminAuthorization();
  const { parseOptionalNumber, parseRequiredInt, parseRequiredNumber } = useNumericForm();

  const productId = computed(() => route.params.productId as string);
  const canUpdateProduct = computed(() => authz.can(ADMIN_PERMISSION.productUpdateAll));

  // 2. Form state
  const form = reactive({
    sku: "",
    name: "",
    price: "",
    compareAtPrice: "",
    weight: "",
    length: "",
    width: "",
    height: "",
  });

  // 3. Submission state
  const pending = ref(false);
  const errorMessage = ref("");

  // 4. Computed / derived state
  const { data: product, pending: productPending, error: productError } = await useAsyncData(
    () => `product-variant-create:${productId.value}`,
    async () => productApi.getProductById(productId.value),
  );

  const canCreateVariant = computed(() => canUpdateProduct.value && !product.value?.isDeleted);

  // 5. Actions
  const findCreatedVariantId = async (sku: string) => {
    const variants = await productApi.getProductVariants(productId.value);
    const matchingVariant = variants.find((entry) => entry.sku === sku)
      ?? [...variants].sort((left, right) => right.sortOrder - left.sortOrder)[0];

    return matchingVariant?.id ?? "";
  };

  const parsePositiveInt = (value: string, label: string) => {
    const parsed = parseRequiredInt(value, label);
    if (parsed <= 0) {
      throw new Error(`${label} must be greater than 0.`);
    }

    return parsed;
  };

  const submit = async () => {
    if (!canCreateVariant.value) {
      return;
    }

    pending.value = true;
    errorMessage.value = "";

    try {
      const skuValidationMessage = getProductSkuValidationMessage(form.sku);
      if (skuValidationMessage) {
        throw new Error(skuValidationMessage);
      }

      await productApi.addProductVariant(productId.value, {
        sku: form.sku,
        name: form.name,
        price: parseRequiredNumber(form.price, "Price"),
        weight: parsePositiveInt(form.weight, "Weight"),
        length: parsePositiveInt(form.length, "Length"),
        width: parsePositiveInt(form.width, "Width"),
        height: parsePositiveInt(form.height, "Height"),
        compareAtPrice: parseOptionalNumber(form.compareAtPrice, "Compare-at price"),
        productAssetId: null,
      });

      const createdVariantId = await findCreatedVariantId(form.sku);

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

  // 6. Return statement
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
