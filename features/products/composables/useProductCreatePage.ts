export const useProductCreatePage = async () => {
  const categoryApi = useCategoryAdminApi();
  const productApi = useProductAdminApi();
  const authz = useAdminAuthorization();
  const { toOptions } = useCategoryTreeCatalog();
  const { genderTargetValueOptions } = useProductOptions();

  const canReadCategories = computed(() => authz.can(ADMIN_PERMISSION.categoryReadAll));

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

  const pending = ref(false);
  const errorMessage = ref("");

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
