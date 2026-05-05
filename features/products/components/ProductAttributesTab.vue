<script setup lang="ts">
import { PhCaretDown } from "@phosphor-icons/vue";

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
const actionSuccess = ref("");

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

watchEffect(() => {
  checkedSkinTypes.value = new Set(assignedSkinTypes.value);
  checkedSkinConcerns.value = new Set(assignedSkinConcerns.value);
});

const toggleChecked = (group: "skin-types" | "skin-concerns", value: string) => {
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

const syncSkinTypes = async () => {
  actionPending.value = "skin-types";
  actionError.value = "";
  actionSuccess.value = "";

  try {
    const addIds = [...checkedSkinTypes.value].filter((value) => !assignedSkinTypes.value.has(value));
    const removeIds = [...assignedSkinTypes.value].filter((value) => !checkedSkinTypes.value.has(value));

    await Promise.all([
      ...addIds.map((value) => productApi.addProductSkinType(props.productId, Number(value))),
      ...removeIds.map((value) => productApi.removeProductSkinType(props.productId, Number(value))),
    ]);

    actionSuccess.value = addIds.length || removeIds.length
      ? "Skin types updated."
      : "Skin types already match the current selection.";
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
  actionSuccess.value = "";

  try {
    const addIds = [...checkedSkinConcerns.value].filter((value) => !assignedSkinConcerns.value.has(value));
    const removeIds = [...assignedSkinConcerns.value].filter((value) => !checkedSkinConcerns.value.has(value));

    await Promise.all([
      ...addIds.map((value) => productApi.addProductSkinConcern(props.productId, Number(value))),
      ...removeIds.map((value) => productApi.removeProductSkinConcern(props.productId, Number(value))),
    ]);

    actionSuccess.value = addIds.length || removeIds.length
      ? "Skin concerns updated."
      : "Skin concerns already match the current selection.";
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to sync skin concerns.");
  } finally {
    actionPending.value = "";
  }
};
</script>

<template>
  <div class="grid max-w-6xl content-start gap-6">
    <AppNotice v-if="actionSuccess" tone="success" title="Attributes updated">
      {{ actionSuccess }}
    </AppNotice>

    <AppNotice v-if="actionError" tone="danger" title="Attribute action failed">
      {{ actionError }}
    </AppNotice>

    <AppPanel
      title="Attribute matrix"
      description="Toggle skin targeting attributes in batches. Changes are applied when you click Save for each section."
    >
      <div class="grid gap-5">
        <AppNotice v-if="!canUpdate" tone="warning" title="Read-only access">
          You can review assigned skin types and concerns here, but product update permission is required to change them.
        </AppNotice>

        <details class="accordion-shell accordion-shell-active group" open>
          <summary class="accordion-summary">
            <span class="flex-1 text-sm font-semibold text-ink">Skin types</span>
            <span class="subtle-pill text-xs">
              {{ [...checkedSkinTypes].length }}/{{ skinTypeValueOptions.length }}
            </span>
            <PhCaretDown :size="14" class="text-smoke transition-transform group-open:rotate-180" />
          </summary>

          <div class="accordion-body divide-y divide-line/20">
            <label
              v-for="option in skinTypeValueOptions"
              :key="option.value"
              class="flex cursor-pointer items-center gap-3 py-2.5 pl-4 pr-4 transition-colors hover:bg-line/20 dark:hover:bg-white/6"
            >
              <input
                type="checkbox"
                class="h-3.5 w-3.5 cursor-pointer rounded accent-ink"
                :checked="checkedSkinTypes.has(option.value)"
                :disabled="!canUpdate"
                @change="toggleChecked('skin-types', option.value)"
              />
              <span class="flex-1 text-xs font-medium text-ink">{{ option.label }}</span>
            </label>
          </div>

          <div v-if="canUpdate" class="panel-action-row border-t border-line/70 p-4">
            <AppButton :loading="actionPending === 'skin-types'" @click="syncSkinTypes">
              Save skin types
            </AppButton>
          </div>
        </details>

        <details class="accordion-shell accordion-shell-active group" open>
          <summary class="accordion-summary">
            <span class="flex-1 text-sm font-semibold text-ink">Skin concerns</span>
            <span class="subtle-pill text-xs">
              {{ [...checkedSkinConcerns].length }}/{{ skinConcernValueOptions.length }}
            </span>
            <PhCaretDown :size="14" class="text-smoke transition-transform group-open:rotate-180" />
          </summary>

          <div class="accordion-body divide-y divide-line/20">
            <label
              v-for="option in skinConcernValueOptions"
              :key="option.value"
              class="flex cursor-pointer items-center gap-3 py-2.5 pl-4 pr-4 transition-colors hover:bg-line/20 dark:hover:bg-white/6"
            >
              <input
                type="checkbox"
                class="h-3.5 w-3.5 cursor-pointer rounded accent-ink"
                :checked="checkedSkinConcerns.has(option.value)"
                :disabled="!canUpdate"
                @change="toggleChecked('skin-concerns', option.value)"
              />
              <span class="flex-1 text-xs font-medium text-ink">{{ option.label }}</span>
            </label>
          </div>

          <div v-if="canUpdate" class="panel-action-row border-t border-line/70 p-4">
            <AppButton :loading="actionPending === 'skin-concerns'" @click="syncSkinConcerns">
              Save skin concerns
            </AppButton>
          </div>
        </details>
      </div>
    </AppPanel>
  </div>
</template>
