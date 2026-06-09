<script setup lang="ts">
import type { ProductAttributeResponse } from "~/features/products/types";

const props = defineProps<{
  productId: string;
  attributes: ProductAttributeResponse | null;
  canUpdate: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const {
  actionError,
  actionErrorOpen,
  actionPending,
  checkedSkinConcerns,
  checkedSkinTypes,
  closeActionError,
  groupAllChecked,
  groupPartialChecked,
  skinConcernValueOptions,
  skinConcernsOpen,
  skinTypeValueOptions,
  skinTypesOpen,
  syncSkinConcerns,
  syncSkinTypes,
  toggleChecked,
  toggleGroup,
} = useProductAttributesTab(props, () => emit("refresh"));
</script>

<template>
  <AppAssignmentPanel
    eyebrow="Attribute matrix"
    :has-items="skinTypeValueOptions.length > 0 || skinConcernValueOptions.length > 0"
    empty-title="No product attributes"
    empty-detail="Product attribute options are not available."
  >
    <AppConfirm
      :open="actionErrorOpen"
      title="Attribute action failed"
      :detail="actionError"
      cancel-label="Close"
      tone="danger"
      hide-confirm
      @cancel="closeActionError"
    />

    <AppNotice v-if="!canUpdate" tone="warning" title="Read-only access">
      You can review assigned skin types and concerns here, but product update permission is required to change them.
    </AppNotice>

    <AppAssignmentGroup
      v-model:open="skinTypesOpen"
      title="Skin types"
      :count-label="`${[...checkedSkinTypes].length}/${skinTypeValueOptions.length}`"
      :checked="groupAllChecked('skin-types')"
      :indeterminate="groupPartialChecked('skin-types')"
      content-id="skin-types-list"
      @toggle-all="toggleGroup('skin-types')"
    >
      <div class="divide-y divide-line/50">
        <label
          v-for="option in skinTypeValueOptions"
          :key="option.value"
          class="flex cursor-pointer items-center gap-3 px-5 py-4 transition-colors hover:bg-line/20 dark:hover:bg-white/6"
        >
          <input
            type="checkbox"
            class="h-4 w-4 cursor-pointer rounded accent-ink"
            :checked="checkedSkinTypes.has(option.value)"
            :disabled="!canUpdate"
            @change="toggleChecked('skin-types', option.value)"
          />
          <span class="text-sm font-semibold text-ink">{{ option.label }}</span>
        </label>
      </div>

      <div v-if="canUpdate" class="flex justify-end border-t border-line/70 p-4">
        <AppButton :loading="actionPending === 'skin-types'" @click="syncSkinTypes">
          Save skin types
        </AppButton>
      </div>
    </AppAssignmentGroup>

    <AppAssignmentGroup
      v-model:open="skinConcernsOpen"
      title="Skin concerns"
      :count-label="`${[...checkedSkinConcerns].length}/${skinConcernValueOptions.length}`"
      :checked="groupAllChecked('skin-concerns')"
      :indeterminate="groupPartialChecked('skin-concerns')"
      content-id="skin-concerns-list"
      @toggle-all="toggleGroup('skin-concerns')"
    >
      <div class="divide-y divide-line/50">
        <label
          v-for="option in skinConcernValueOptions"
          :key="option.value"
          class="flex cursor-pointer items-center gap-3 px-5 py-4 transition-colors hover:bg-line/20 dark:hover:bg-white/6"
        >
          <input
            type="checkbox"
            class="h-4 w-4 cursor-pointer rounded accent-ink"
            :checked="checkedSkinConcerns.has(option.value)"
            :disabled="!canUpdate"
            @change="toggleChecked('skin-concerns', option.value)"
          />
          <span class="text-sm font-semibold text-ink">{{ option.label }}</span>
        </label>
      </div>

      <div v-if="canUpdate" class="flex justify-end border-t border-line/70 p-4">
        <AppButton :loading="actionPending === 'skin-concerns'" @click="syncSkinConcerns">
          Save skin concerns
        </AppButton>
      </div>
    </AppAssignmentGroup>

  </AppAssignmentPanel>
</template>
