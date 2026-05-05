export const PRODUCT_STATUS_OPTIONS = [
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
  { label: "Discontinued", value: "Discontinued" },
] as const;

export const PRODUCT_STATUS_VALUE_OPTIONS = [
  { label: "Draft", value: "0" },
  { label: "Published", value: "1" },
  { label: "Discontinued", value: "2" },
] as const;

export const GENDER_TARGET_OPTIONS = [
  { label: "Unisex", value: "Unisex" },
  { label: "Female", value: "Female" },
  { label: "Male", value: "Male" },
] as const;

export const GENDER_TARGET_VALUE_OPTIONS = [
  { label: "Unisex", value: "0" },
  { label: "Female", value: "1" },
  { label: "Male", value: "2" },
] as const;

export const VARIANT_STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
] as const;

export const VARIANT_STATUS_VALUE_OPTIONS = [
  { label: "Active", value: "0" },
  { label: "Inactive", value: "1" },
] as const;

export const FEATURE_FILTER_OPTIONS = [
  { label: "All featured states", value: "" },
  { label: "Featured", value: "true" },
  { label: "Not featured", value: "false" },
] as const;

export const DELETED_FILTER_OPTIONS = [
  { label: "All record states", value: "" },
  { label: "Active only", value: "false" },
  { label: "Deleted only", value: "true" },
] as const;

export const SKIN_TYPE_VALUE_OPTIONS = [
  { label: "All", value: "0" },
  { label: "Oily", value: "1" },
  { label: "Dry", value: "2" },
  { label: "Combination", value: "3" },
  { label: "Normal", value: "4" },
  { label: "Sensitive", value: "5" },
] as const;

export const SKIN_CONCERN_VALUE_OPTIONS = [
  { label: "Acne", value: "0" },
  { label: "Aging", value: "1" },
  { label: "Darkspots", value: "2" },
  { label: "Dryness", value: "3" },
  { label: "Oiliness", value: "4" },
  { label: "Sensitivity", value: "5" },
  { label: "Uneven tone", value: "6" },
  { label: "Large pores", value: "7" },
  { label: "Dullness", value: "8" },
  { label: "Redness", value: "9" },
] as const;

export const useProductOptions = () => ({
  productStatusOptions: PRODUCT_STATUS_OPTIONS,
  productStatusValueOptions: PRODUCT_STATUS_VALUE_OPTIONS,
  genderTargetOptions: GENDER_TARGET_OPTIONS,
  genderTargetValueOptions: GENDER_TARGET_VALUE_OPTIONS,
  variantStatusOptions: VARIANT_STATUS_OPTIONS,
  variantStatusValueOptions: VARIANT_STATUS_VALUE_OPTIONS,
  featureFilterOptions: FEATURE_FILTER_OPTIONS,
  deletedFilterOptions: DELETED_FILTER_OPTIONS,
  skinTypeValueOptions: SKIN_TYPE_VALUE_OPTIONS,
  skinConcernValueOptions: SKIN_CONCERN_VALUE_OPTIONS,
});
