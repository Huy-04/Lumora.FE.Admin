const PRODUCT_SKU_PATTERN = /^[A-Z0-9-]{3,50}$/;

export const getProductSkuValidationMessage = (sku: string) => {
  if (sku !== sku.trim()) {
    return "SKU must not have leading or trailing whitespace.";
  }

  if (!PRODUCT_SKU_PATTERN.test(sku)) {
    return "SKU must be 3-50 characters and use uppercase letters, numbers, or dash only.";
  }

  return "";
};
