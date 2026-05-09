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

const productApi = useProductAdminApi();
const { skinTypeValueOptions, skinConcernValueOptions } = useProductOptions();

const skinTypeIndexMap: Record<string, string> = {
  All: "0",
  Oily: "1",
  Dry: "2",
  Combination: "3",
  Normal: "4",
  Sensitive: "5",
};

const skinConcernIndexMap: Record<string, string> = {
  Acne: "0",
  Aging: "1",
  Darkspots: "2",
  Dryness: "3",
  Oiliness: "4",
  Sensitivity: "5",
  UnevenTone: "6",
  LargePores: "7",
  Dullness: "8",
  Redness: "9",
};

const actionPending = ref<"" | "skin-types" | "skin-concerns">("");
const actionError = ref("");

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};

const assignedSkinTypes = computed(() =>
  new Set(
    (props.attributes?.skinTypes ?? [])
      .map((label) => skinTypeIndexMap[label] ?? "")
      .filter(Boolean),
  ),
);

const assignedSkinConcerns = computed(() =>
  new Set(
    (props.attributes?.skinConcerns ?? [])
      .map((label) => skinConcernIndexMap[label] ?? "")
      .filter(Boolean),
  ),
);

const checkedSkinTypes = ref<Set<string>>(new Set());
const checkedSkinConcerns = ref<Set<string>>(new Set());
const skinTypesOpen = ref(true);
const skinConcernsOpen = ref(true);

watchEffect(() => {
  checkedSkinTypes.value = new Set(assignedSkinTypes.value);
  checkedSkinConcerns.value = new Set(assignedSkinConcerns.value);
});

const toggleChecked = (group: "skin-types" | "skin-concerns", value: string) => {
  if (!props.canUpdate) return;

  const current = group === "skin-types" ? checkedSkinTypes.value : checkedSkinConcerns.value;
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  if (group === "skin-types") {
    checkedSkinTypes.value = next;
    return;
  }

  checkedSkinConcerns.value = next;
};

const groupAllChecked = (group: "skin-types" | "skin-concerns") => {
  const options = group === "skin-types" ? skinTypeValueOptions : skinConcernValueOptions;
  const checked = group === "skin-types" ? checkedSkinTypes.value : checkedSkinConcerns.value;
  return options.length > 0 && options.every((option) => checked.has(option.value));
};

const groupPartialChecked = (group: "skin-types" | "skin-concerns") => {
  const options = group === "skin-types" ? skinTypeValueOptions : skinConcernValueOptions;
  const checked = group === "skin-types" ? checkedSkinTypes.value : checkedSkinConcerns.value;
  return options.some((option) => checked.has(option.value)) && !groupAllChecked(group);
};

const toggleGroup = (group: "skin-types" | "skin-concerns") => {
  if (!props.canUpdate) return;

  const options = group === "skin-types" ? skinTypeValueOptions : skinConcernValueOptions;
  const allChecked = groupAllChecked(group);
  const next = allChecked ? new Set<string>() : new Set(options.map((option) => option.value));

  if (group === "skin-types") {
    checkedSkinTypes.value = next;
    return;
  }

  checkedSkinConcerns.value = next;
};

const syncSkinTypes = async () => {
  actionPending.value = "skin-types";
  actionError.value = "";

  try {
    const addIds = [...checkedSkinTypes.value].filter((value) => !assignedSkinTypes.value.has(value));
    const removeIds = [...assignedSkinTypes.value].filter((value) => !checkedSkinTypes.value.has(value));

    await Promise.all([
      ...addIds.map((value) => productApi.addProductSkinType(props.productId, Number(value))),
      ...removeIds.map((value) => productApi.removeProductSkinType(props.productId, Number(value))),
    ]);

    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to sync skin types.");
  } finally {
    actionPending.value = "";
  }
};

const syncSkinConcerns = async () => {
  actionPending.value = "skin-concerns";
  actionError.value = "";

  try {
    const addIds = [...checkedSkinConcerns.value].filter((value) => !assignedSkinConcerns.value.has(value));
    const removeIds = [...assignedSkinConcerns.value].filter((value) => !checkedSkinConcerns.value.has(value));

    await Promise.all([
      ...addIds.map((value) => productApi.addProductSkinConcern(props.productId, Number(value))),
      ...removeIds.map((value) => productApi.removeProductSkinConcern(props.productId, Number(value))),
    ]);

    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to sync skin concerns.");
  } finally {
    actionPending.value = "";
  }
};
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
