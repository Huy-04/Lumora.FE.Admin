<script setup lang="ts">
import type {
  CategoryResponse,
  CategoryTreeNodeResponse,
} from "~/features/categories/types";

const props = defineProps<{
  category: CategoryResponse;
  parent?: CategoryTreeNodeResponse | null;
  tree: CategoryTreeNodeResponse[];
  children: CategoryTreeNodeResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();

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
const MAX_CATEGORY_LEVEL = 2;

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
      && category.level + 1 + subtreeDepth.value <= MAX_CATEGORY_LEVEL)
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
    return "This category has nested categories. Parent options are limited so the moved subtree stays within the 3-level catalog depth.";
  }

  return "Move between root scope and an active parent that has not reached the 3-level catalog depth. Drag rows in the tree view to change sort order.";
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

    emit("refresh");
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
    moveError.value = "Choose a valid active parent within the 3-level catalog depth.";
    return;
  }

  movePending.value = true;
  moveError.value = "";

  try {
    await categoryApi.moveCategory(props.category.id, {
      parentId: moveForm.parentId || null,
      sortOrder: null,
    });

    emit("refresh");
  } catch (requestError) {
    moveError.value = getProblemMessage(requestError, "Unable to move the category.");
  } finally {
    movePending.value = false;
  }
};
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel eyebrow="Edit category">
      <form class="form-stack" @submit.prevent="saveCategory">
        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.name" label="Category name" />
          <AppInput v-model="form.slug" label="Slug" />
        </div>

        <AppTextarea v-model="form.description" label="Description" placeholder="Explain what belongs in this category." />

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.img" label="Image URL" placeholder="https://…" />
          <AppInput v-model="form.seoTitle" label="SEO title" />
        </div>

        <AppTextarea v-model="form.seoDescription" label="SEO description" placeholder="Short search-result summary." />

        <AppNotice v-if="actionError" tone="danger" title="Category update failed">
          {{ actionError }}
        </AppNotice>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
        </div>
      </form>
    </AppPanel>

    <AppPanel eyebrow="Move category">
      <form class="form-stack" @submit.prevent="moveCategory">
        <AppNotice tone="info" title="Hierarchy rule">
          {{ moveHelpText }}
        </AppNotice>

        <div class="grid gap-4">
          <AppSelect
            v-model="moveForm.parentId"
            label="Parent scope"
            :options="parentOptions"
          />
        </div>

        <AppNotice v-if="moveError" tone="danger" title="Move category failed">
          {{ moveError }}
        </AppNotice>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4">
          <p class="text-sm text-smoke">
            Current parent: {{ parent?.name ?? "Root category" }}
          </p>
          <AppButton :loading="movePending" type="submit">Move category</AppButton>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
