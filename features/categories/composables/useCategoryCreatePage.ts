import type { CategoryTreeNodeResponse } from "~/features/categories/types";

export const useCategoryCreatePage = async () => {
  const route = useRoute();
  const categoryApi = useCategoryAdminApi();
  const authz = useAdminAuthorization();

  const canReadCategories = computed(() => authz.can(ADMIN_PERMISSION.categoryReadAll));

  const initialParentId = computed(() => {
    const value = route.query.parentId;
    return typeof value === "string" ? value : "";
  });

  const form = reactive({
    mode: initialParentId.value ? "child" : "root",
    parentId: initialParentId.value,
    name: "",
    slug: "",
    description: "",
    img: "",
    seoTitle: "",
    seoDescription: "",
  });

  const pending = ref(false);
  const errorMessage = ref("");

  const { data: categoryCatalog, error: categoryCatalogError } = await useAsyncData(
    "categories-create-catalog",
    async () => {
      if (!canReadCategories.value) {
        return [] as CategoryTreeNodeResponse[];
      }

      return categoryApi.getCategoryTree();
    },
  );

  const activeRootOptions = computed(() => {
    const options = (categoryCatalog.value ?? [])
      .filter((category) => category.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        label: `${category.name} (#${category.sortOrder})`,
        value: category.id,
      }));

    return [{ label: "Select parent category", value: "" }, ...options];
  });

  watch(
    () => initialParentId.value,
    (parentId) => {
      if (!parentId) {
        return;
      }

      form.mode = "child";
      form.parentId = parentId;
    },
    { immediate: true },
  );

  watch(
    () => form.mode,
    (mode) => {
      if (mode === "root") {
        form.parentId = "";
        return;
      }

      if (!form.parentId && activeRootOptions.value[1]) {
        form.parentId = activeRootOptions.value[1].value;
      }
    },
    { immediate: true },
  );

  const submit = async () => {
    pending.value = true;
    errorMessage.value = "";

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        img: form.img || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
      };

      const created = form.mode === "child"
        ? await categoryApi.createCategoryChild(form.parentId, payload)
        : await categoryApi.createCategory(payload);

      await navigateTo(`/categories/${created.id}`);
    } catch (requestError) {
      errorMessage.value = getProblemMessage(requestError, "Unable to create the category.");
    } finally {
      pending.value = false;
    }
  };

  return {
    form,
    pending,
    errorMessage,
    categoryCatalogError,
    canReadCategories,
    activeRootOptions,
    submit,
  };
};

export type CategoryCreatePage = Awaited<ReturnType<typeof useCategoryCreatePage>>;
