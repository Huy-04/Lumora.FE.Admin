import type { CategoryTreeNodeResponse } from "~/features/categories/types";

const MAX_CATEGORY_LEVEL = 2;

const flattenTree = (nodes: CategoryTreeNodeResponse[]): CategoryTreeNodeResponse[] =>
  nodes.flatMap((node) => [node, ...flattenTree(node.children)]);

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

  const activeParentOptions = computed(() => {
    const options = flattenTree(categoryCatalog.value ?? [])
      .filter((category) =>
        category.isActive
        && !category.isDeleted
        && category.level < MAX_CATEGORY_LEVEL)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        label: `${"- ".repeat(category.level)}${category.name} (#${category.sortOrder})`,
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

      if (!form.parentId && activeParentOptions.value[1]) {
        form.parentId = activeParentOptions.value[1].value;
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
    activeParentOptions,
    submit,
  };
};

export type CategoryCreatePage = Awaited<ReturnType<typeof useCategoryCreatePage>>;
