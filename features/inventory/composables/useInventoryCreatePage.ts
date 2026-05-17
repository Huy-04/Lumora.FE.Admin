export const useInventoryCreatePage = async () => {
  // 1. Dependency injection
  const inventoryApi = useInventoryAdminApi();
  const productApi = useProductAdminApi();

  // 2. Form state
  const form = reactive({
    productVariantId: "",
  });
  const pending = ref(false);
  const errorMessage = ref("");

  // 3. Product search
  const productSearch = ref("");
  const productSearchPending = ref(false);
  const searchedProducts = ref<Array<{ id: string; name: string; slug: string }>>([]);
  const selectedProductId = ref("");
  const variants = ref<Array<{ id: string; sku: string; name: string }>>([]);
  const variantsPending = ref(false);

  // 4. Computed derivations
  const productOptions = computed(() =>
    searchedProducts.value.map((p) => ({ label: p.name, value: p.id })),
  );

  const variantOptions = computed(() =>
    variants.value.map((v) => ({ label: `${v.sku} — ${v.name}`, value: v.id })),
  );

  // 5. Actions/mutations
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const searchProducts = (keyword: string) => {
    productSearch.value = keyword;
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    if (!keyword.trim()) {
      searchedProducts.value = [];
      return;
    }
    searchTimeout = setTimeout(async () => {
      productSearchPending.value = true;
      try {
        const result = await productApi.searchProducts({ keyword, page: 1, size: 10 });
        searchedProducts.value = result.items.map((p) => ({ id: p.id, name: p.name, slug: p.slug }));
      } catch {
        searchedProducts.value = [];
      } finally {
        productSearchPending.value = false;
      }
    }, 300);
  };

  const selectProduct = async (productId: string) => {
    if (!productId) return;
    selectedProductId.value = productId;
    form.productVariantId = "";
    variants.value = [];
    variantsPending.value = true;
    try {
      const result = await productApi.getProductVariants(productId);
      variants.value = result.map((v) => ({ id: v.id, sku: v.sku, name: v.name }));
    } catch {
      variants.value = [];
    } finally {
      variantsPending.value = false;
    }
  };

  const submit = async () => {
    if (!form.productVariantId.trim()) {
      errorMessage.value = "Product variant id is required.";
      return;
    }
    pending.value = true;
    errorMessage.value = "";
    try {
      const created = await inventoryApi.createInventory({ productVariantId: form.productVariantId.trim() });
      await navigateTo(`/inventory/${created.id}`);
    } catch (requestError) {
      const status = getProblemStatus(requestError);
      if (status === 409) {
        errorMessage.value = getProblemMessage(requestError, "An inventory already exists for the selected product variant.");
      } else if (status === 404) {
        errorMessage.value = getProblemMessage(requestError, "The selected product variant does not exist.");
      } else {
        errorMessage.value = getProblemMessage(requestError, "Unable to create inventory.");
      }
    } finally {
      pending.value = false;
    }
  };

  // 6. Return statement
  return {
    form, pending, errorMessage, submit,
    productSearch, productSearchPending, searchedProducts,
    selectedProductId, variants, variantsPending,
    productOptions, variantOptions,
    searchProducts, selectProduct,
  };
};

export type InventoryCreatePageState = Awaited<ReturnType<typeof useInventoryCreatePage>>;
