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
  sortOrder: "",
});

const actionPending = ref(false);
const actionError = ref("");
const movePending = ref(false);
const moveError = ref("");

const flattenTree = (nodes: CategoryTreeNodeResponse[]): CategoryTreeNodeResponse[] =>
  nodes.flatMap((node) => [node, ...flattenTree(node.children)]);

const hasChildren = computed(() => props.children.length > 0);

const activeRootOptions = computed(() => {
  const options = flattenTree(props.tree)
    .filter((category) =>
      category.level === 0
      && category.id !== props.category.id
      && category.isActive
      && !category.isDeleted)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((category) => ({
      label: category.name,
      value: category.id,
    }));

  return [
    { label: "Root category", value: "" },
    ...options,
  ];
});

const parentIdValue = computed(() => props.category.parentId ?? "");

const hasMoveChange = computed(() =>
  moveForm.parentId !== parentIdValue.value
  || (moveForm.sortOrder.trim() !== "" && Number(moveForm.sortOrder) !== props.category.sortOrder),
);

const moveHelpText = computed(() => {
  if (hasChildren.value) {
    return "This category has children, so it can only move between root positions. Moving it under another root would exceed the current two-level catalog depth.";
  }

  return "Move between root scope and an active root parent. Leave sort order empty to append in the target scope.";
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
  moveForm.sortOrder = "";
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
    moveError.value = "Choose a new parent or sort order before moving the category.";
    return;
  }

  if (hasChildren.value && moveForm.parentId) {
    moveError.value = "A category with children cannot be moved under another root in the current two-level catalog.";
    return;
  }

  movePending.value = true;
  moveError.value = "";

  try {
    await categoryApi.moveCategory(props.category.id, {
      parentId: moveForm.parentId || null,
      sortOrder: moveForm.sortOrder.trim() ? Number(moveForm.sortOrder) : null,
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
    <AppPanel title="Edit category" description="Update storefront-facing content and search metadata without changing hierarchy placement.">
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

        <div class="panel-action-row border-t border-line/70 pt-4">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
          <NuxtLink class="secondary-link" to="/categories">
            Back to categories
          </NuxtLink>
        </div>
      </form>
    </AppPanel>

    <AppPanel title="Move category" description="Change the parent scope or save a specific sibling position.">
      <form class="form-stack" @submit.prevent="moveCategory">
        <AppNotice tone="info" title="Hierarchy rule">
          {{ moveHelpText }}
        </AppNotice>

        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect
            v-model="moveForm.parentId"
            label="Parent scope"
            :options="activeRootOptions"
            :disabled="hasChildren"
          />
          <AppInput
            v-model="moveForm.sortOrder"
            label="Sort order"
            inputmode="numeric"
            placeholder="Append to end"
          />
        </div>

        <AppNotice v-if="moveError" tone="danger" title="Move category failed">
          {{ moveError }}
        </AppNotice>

        <div class="panel-action-row border-t border-line/70 pt-4">
          <AppButton :loading="movePending" type="submit">Move category</AppButton>
          <p class="text-sm text-smoke">
            Current parent: {{ parent?.name ?? "Root category" }}
          </p>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
