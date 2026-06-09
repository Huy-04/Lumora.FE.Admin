import type {
  CategoryResponse,
  CategoryTreeNodeResponse,
} from "~/features/categories/types";
import { CATEGORY_MAX_DEPTH, CATEGORY_MAX_LEVEL } from "~/features/categories/constants";

export const useCategoryEditTab = (
  props: {
    category: CategoryResponse;
    parent?: CategoryTreeNodeResponse | null;
    tree: CategoryTreeNodeResponse[];
    children: CategoryTreeNodeResponse[];
  },
  onRefresh: () => void,
) => {
  const categoryApi = useCategoryAdminApi();

  const form = reactive({
    name: "",
    slug: "",
    description: "",
    img: "",
    seoTitle: "",
    seoDescription: "",
  });

  const moveForm = reactive({
    parentId: "",
  });

  const actionPending = ref(false);
  const actionError = ref("");
  const movePending = ref(false);
  const moveError = ref("");

  const flattenTree = (nodes: CategoryTreeNodeResponse[]): CategoryTreeNodeResponse[] =>
    nodes.flatMap((node) => [node, ...flattenTree(node.children)]);

  const findTreeNode = (nodes: CategoryTreeNodeResponse[], id: string): CategoryTreeNodeResponse | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }

      const match = findTreeNode(node.children, id);
      if (match) {
        return match;
      }
    }

    return null;
  };

  const containsCategory = (node: CategoryTreeNodeResponse, categoryId: string): boolean =>
    node.id === categoryId || node.children.some((child) => containsCategory(child, categoryId));

  const getMaxDescendantLevel = (node: CategoryTreeNodeResponse): number =>
    Math.max(node.level, ...node.children.map(getMaxDescendantLevel));

  const hasChildren = computed(() => props.children.length > 0);
  const currentTreeNode = computed(() => findTreeNode(props.tree, props.category.id));
  const subtreeDepth = computed(() => {
    const node = currentTreeNode.value;
    return node ? getMaxDescendantLevel(node) - node.level : 0;
  });

  const parentOptions = computed(() => {
    const options = flattenTree(props.tree)
      .filter((category) =>
        category.id !== props.category.id
        && !currentTreeNode.value?.children.some((child) => containsCategory(child, category.id))
        && category.isActive
        && !category.isDeleted
        && category.level + 1 + subtreeDepth.value <= CATEGORY_MAX_LEVEL)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        label: `${"- ".repeat(category.level)}${category.name}`,
        value: category.id,
      }));

    return [
      { label: "Root category", value: "" },
      ...options,
    ];
  });

  const parentIdValue = computed(() => props.category.parentId ?? "");

  const hasMoveChange = computed(() => moveForm.parentId !== parentIdValue.value);

  const moveHelpText = computed(() => {
    if (hasChildren.value) {
      return `This category has nested categories. Parent options are limited so the moved subtree stays within the ${CATEGORY_MAX_DEPTH}-level catalog depth.`;
    }

    return `Move between root scope and an active parent that has not reached the ${CATEGORY_MAX_DEPTH}-level catalog depth. Drag rows in the tree view to change sort order.`;
  });

  watchEffect(() => {
    if (!props.category) {
      return;
    }

    form.name = props.category.name;
    form.slug = props.category.slug;
    form.description = props.category.description || "";
    form.img = props.category.img || "";
    form.seoTitle = props.category.seoTitle || "";
    form.seoDescription = props.category.seoDescription || "";
    moveForm.parentId = parentIdValue.value;
  });

  const saveCategory = async () => {
    actionPending.value = true;
    actionError.value = "";

    try {
      await categoryApi.updateCategory(props.category.id, {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        img: form.img || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
      });

      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update the category.");
    } finally {
      actionPending.value = false;
    }
  };

  const moveCategory = async () => {
    if (!hasMoveChange.value) {
      moveError.value = "Choose a new parent before moving the category.";
      return;
    }

    if (moveForm.parentId && !parentOptions.value.some((option) => option.value === moveForm.parentId)) {
      moveError.value = `Choose a valid active parent within the ${CATEGORY_MAX_DEPTH}-level catalog depth.`;
      return;
    }

    movePending.value = true;
    moveError.value = "";

    try {
      await categoryApi.moveCategory(props.category.id, {
        parentId: moveForm.parentId || null,
        sortOrder: null,
      });

      onRefresh();
    } catch (requestError) {
      moveError.value = getProblemMessage(requestError, "Unable to move the category.");
    } finally {
      movePending.value = false;
    }
  };

  return {
    actionError,
    actionPending,
    form,
    moveCategory,
    moveError,
    moveForm,
    moveHelpText,
    movePending,
    parentOptions,
    saveCategory,
  };
};
