import type { ProductAttributeResponse } from "~/features/products/types/products";

type AttributeGroup = "skin-types" | "skin-concerns";

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

export const useProductAttributesTab = (
  props: {
    productId: string;
    attributes: ProductAttributeResponse | null;
    canUpdate: boolean;
  },
  onRefresh: () => void,
) => {
  const productApi = useProductAdminApi();
  const { skinTypeValueOptions, skinConcernValueOptions } = useProductOptions();

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

  const toggleChecked = (group: AttributeGroup, value: string) => {
    if (!props.canUpdate) {
      return;
    }

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

  const groupAllChecked = (group: AttributeGroup) => {
    const options = group === "skin-types" ? skinTypeValueOptions : skinConcernValueOptions;
    const checked = group === "skin-types" ? checkedSkinTypes.value : checkedSkinConcerns.value;
    return options.length > 0 && options.every((option) => checked.has(option.value));
  };

  const groupPartialChecked = (group: AttributeGroup) => {
    const options = group === "skin-types" ? skinTypeValueOptions : skinConcernValueOptions;
    const checked = group === "skin-types" ? checkedSkinTypes.value : checkedSkinConcerns.value;
    return options.some((option) => checked.has(option.value)) && !groupAllChecked(group);
  };

  const toggleGroup = (group: AttributeGroup) => {
    if (!props.canUpdate) {
      return;
    }

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

      onRefresh();
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

      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to sync skin concerns.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
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
  };
};
