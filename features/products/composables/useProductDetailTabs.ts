export const useProductDetailTabs = (
  route: ReturnType<typeof useRoute>,
  productId: ComputedRef<string>,
  canEditProduct: ComputedRef<boolean>,
) => {
  type ProductTab = "overview" | "edit" | "variants" | "assets" | "gallery" | "attributes";

  const productTabs = computed<Array<{ label: string; value: ProductTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Variants", value: "variants" },
    { label: "Assets", value: "assets" },
    { label: "Gallery", value: "gallery" },
    { label: "Attributes", value: "attributes" },
    ...(canEditProduct.value ? [{ label: "Edit", value: "edit" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): ProductTab => {
    const resolved = value === "edit"
      ? "edit"
      : value === "variants"
        ? "variants"
        : value === "assets"
          ? "assets"
          : value === "gallery"
            ? "gallery"
            : value === "attributes"
              ? "attributes"
              : "overview";

    return productTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const activeTab = ref<ProductTab>("overview");

  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
    { immediate: true },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  const selectTab = async (tab: ProductTab) => {
    activeTab.value = normalizeTab(tab);

    await navigateTo(
      {
        path: `/products/${productId.value}`,
        query: { tab },
      },
      { replace: true },
    );
  };

  return {
    activeTab,
    productTabs,
    selectTab,
  };
};
