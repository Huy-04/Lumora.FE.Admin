export const useProductCreatePage = async () => {
  // 1. Dependency injection
  const categoryApi = useCategoryAdminApi();
  const productApi = useProductAdminApi();
  const authz = useAdminAuthorization();
  const { toOptions } = useCategoryTreeCatalog();
  const { genderTargetValueOptions } = useProductOptions();

  const canReadCategories = computed(() => authz.can(ADMIN_PERMISSION.categoryReadAll));

  // 2. Form state
  const form = reactive({
    categoryId: "",
    name: "",
    brand: "",
    slug: "",
    genderTarget: "0",
    shortDescription: "",
    description: "",
    highlights: "",
    ingredients: "",
    howToUse: "",
    storageGuide: "",
    caution: "",
    brandOrigin: "",
    manufactureLocation: "",
    manufactureDateNote: "",
    shelfLifeNote: "",
    seoTitle: "",
    seoDescription: "",
  });

  // 3. Submission state
  const pending = ref(false);
  const errorMessage = ref("");

  // 4. Computed / derived state
  const { data: categoryCatalog, error: categoryCatalogError } = await useAsyncData(
    "products-create-catalog",
    async () => {
      if (!canReadCategories.value) {
        return [];
      }

      return categoryApi.getCategoryTree();
    },
  );

  const categoryOptions = computed(() => [
    { label: "Select product category", value: "" },
    ...toOptions(categoryCatalog.value ?? [], true),
  ]);

  watchEffect(() => {
    if (!form.categoryId && categoryOptions.value[1]) {
      form.categoryId = categoryOptions.value[1].value;
    }
  });

  // 5. Actions
  const submit = async () => {
    pending.value = true;
    errorMessage.value = "";

    try {
      const created = await productApi.createProduct({
        categoryId: form.categoryId,
        name: form.name,
        brand: form.brand,
        slug: form.slug,
        genderTarget: Number(form.genderTarget),
        content: {
          shortDescription: form.shortDescription || null,
          description: form.description || null,
          highlights: form.highlights || null,
          ingredients: form.ingredients || null,
          howToUse: form.howToUse || null,
          storageGuide: form.storageGuide || null,
          caution: form.caution || null,
          brandOrigin: form.brandOrigin || null,
          manufactureLocation: form.manufactureLocation || null,
          manufactureDateNote: form.manufactureDateNote || null,
          shelfLifeNote: form.shelfLifeNote || null,
        },
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
      });

      await navigateTo(`/products/${created.id}`);
    } catch (requestError) {
      errorMessage.value = getProblemMessage(requestError, "Unable to create the product.");
    } finally {
      pending.value = false;
    }
  };

  // 6. Return statement
  return {
    form,
    canReadCategories,
    categoryOptions,
    genderTargetValueOptions,
    categoryCatalogError,
    errorMessage,
    pending,
    submit,
  };
};

export type ProductCreatePage = Awaited<ReturnType<typeof useProductCreatePage>>;
