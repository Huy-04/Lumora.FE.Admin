<script setup lang="ts">
import type {
  CategoryResponse,
  CategoryTreeNodeResponse,
} from "~/features/categories/types";

const props = defineProps<{
  category: CategoryResponse;
  children: CategoryTreeNodeResponse[];
  actionPending?: boolean;
  actionTargetId?: string;
}>();

const emit = defineEmits<{
  requestReorder: [payload: { sourceId: string; targetId: string; sourceName: string; targetName: string }];
  requestToggle: [child: CategoryTreeNodeResponse];
  requestRemove: [child: CategoryTreeNodeResponse];
  requestRestore: [child: CategoryTreeNodeResponse];
}>();

const authz = useAdminAuthorization();

const canCreateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryCreateAll));
const canDeleteCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryDeleteAll));
const canActivateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryActivateAll));
const canDeactivateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryDeactivateAll));
const canReorderCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryReorderAll));
const canRestoreCategory = canDeleteCategory;
const statusTone = (child: CategoryTreeNodeResponse) => {
  if (child.isDeleted) return "danger";
  return child.isActive ? "success" : "warning";
};
const dragSourceId = ref("");
const dragTargetId = ref("");

const canDragChildren = computed(() =>
  canReorderCategory.value
  && !props.category.isDeleted
  && props.children.length > 1
  && props.children.every((child) => !child.isDeleted),
);

const resetDragState = () => {
  dragSourceId.value = "";
  dragTargetId.value = "";
};

const handleChildDragStart = (childId: string) => {
  if (!canDragChildren.value) {
    return;
  }

  dragSourceId.value = childId;
  dragTargetId.value = "";
};

const handleChildDragOver = (childId: string) => {
  if (!canDragChildren.value || !dragSourceId.value || dragSourceId.value === childId) {
    return;
  }

  dragTargetId.value = childId;
};

const handleChildDrop = (targetId: string) => {
  if (!canDragChildren.value || !dragSourceId.value || dragSourceId.value === targetId) {
    resetDragState();
    return;
  }

  const sourceChild = props.children.find((child) => child.id === dragSourceId.value);
  const targetChild = props.children.find((child) => child.id === targetId);

  if (!sourceChild || !targetChild) {
    resetDragState();
    return;
  }

  emit("requestReorder", {
    sourceId: sourceChild.id,
    targetId: targetChild.id,
    sourceName: sourceChild.name,
    targetName: targetChild.name,
  });

  resetDragState();
};
</script>

<template>
  <AppPanel
    eyebrow="Child categories"
  >
    <div class="mb-5">
      <p class="text-sm text-smoke">
        {{ children.length }} child categories linked to this root.
      </p>
    </div>

    <div v-if="children.length" class="table-shell overflow-x-auto">
      <table class="data-table">
        <thead>
          <tr>
            <th class="min-w-[240px]">Child category</th>
            <th class="min-w-[90px]">Sort</th>
            <th class="min-w-[110px]">Status</th>
            <th class="w-[110px] text-center">Open</th>
            <th v-if="canActivateCategory || canDeactivateCategory || canRestoreCategory" class="w-[120px] text-center">State</th>
            <th v-if="canDeleteCategory" class="w-[96px] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="child in children"
            :key="child.id"
            :draggable="canDragChildren"
            :class="{
              'cursor-grab': canDragChildren,
              'opacity-55': dragSourceId === child.id,
              'bg-moss/10': dragTargetId === child.id,
            }"
            @dragstart="handleChildDragStart(child.id)"
            @dragend="resetDragState"
            @dragover.prevent="handleChildDragOver(child.id)"
            @drop.prevent="handleChildDrop(child.id)"
          >
            <td class="align-middle">
              <p class="table-title">{{ child.name }}</p>
              <p class="table-copy">{{ child.slug }}</p>
            </td>
            <td class="align-middle">{{ child.sortOrder }}</td>
            <td class="align-middle">
              <AppBadge :tone="statusTone(child)">
                {{ child.isDeleted ? "Deleted" : child.isActive ? "Active" : "Inactive" }}
              </AppBadge>
            </td>
            <td class="align-middle">
                <div class="flex justify-center">
                  <NuxtLink class="secondary-link table-action" :to="`/categories/${child.id}`">
                    Open
                  </NuxtLink>
                </div>
            </td>
            <td v-if="canActivateCategory || canDeactivateCategory || canRestoreCategory" class="align-middle">
              <div class="flex justify-center">
                <AppButton
                  v-if="child.isDeleted && canRestoreCategory"
                  class="table-action"
                  variant="secondary"
                  :loading="props.actionPending && props.actionTargetId === child.id"
                  @click="emit('requestRestore', child)"
                >
                  Restore
                </AppButton>
                <AppButton
                  v-if="!child.isDeleted && (child.isActive ? canDeactivateCategory : canActivateCategory)"
                  class="table-action"
                  variant="secondary"
                  :loading="props.actionPending && props.actionTargetId === child.id"
                  @click="emit('requestToggle', child)"
                >
                  {{ child.isActive ? "Deactivate" : "Activate" }}
                </AppButton>
              </div>
            </td>
            <td v-if="canDeleteCategory" class="align-middle">
              <div class="flex justify-center">
                <AppButton
                  v-if="!child.isDeleted"
                  class="table-action whitespace-nowrap"
                  variant="danger"
                  :loading="props.actionPending && props.actionTargetId === child.id"
                  @click="emit('requestRemove', child)"
                >
                  Remove
                </AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppEmptyState
      v-else
      title="No child categories yet"
      detail="Create the first child category from this root to build out the second level."
    />

    <div v-if="canCreateCategory && !category.isDeleted" class="mt-4 flex justify-end border-t border-line/70 pt-4">
      <NuxtLink
        class="secondary-link"
        :to="`/categories/create?parentId=${category.id}`"
      >
        Add child
      </NuxtLink>
    </div>
  </AppPanel>
</template>
