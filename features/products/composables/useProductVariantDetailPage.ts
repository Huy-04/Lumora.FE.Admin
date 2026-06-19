import type { ProductVariantResponse } from "~/features/products/types/products";

export const useProductVariantDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const productApi = useProductAdminApi();
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();

  type VariantTab = "overview" | "edit" | "inventory";

  // 2. Permissions
  const productId = computed(() => route.params.productId as string);
  const variantId = computed(() => route.params.variantId as string);
  const canUpdateProduct = computed(() => authz.can(ADMIN_PERMISSION.productUpdateAll));
  const canReadInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryReadAll));
  const canCreateInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryCreateAll));
  const inventoryActionPending = ref("");
  const inventoryActionError = ref("");

  // 3. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `product-variant-detail:${productId.value}:${variantId.value}`,
    async () => {
      const [product, variants, assets] = await Promise.all([
        productApi.getProductById(productId.value),
        productApi.getProductVariants(productId.value),
        productApi.getProductAssets(productId.value),
      ]);

      return {
        product,
        variants,
        assets,
      };
    },
  );

  // 4. Computed derivations
  const variant = computed<ProductVariantResponse | null>(() =>
    data.value?.variants.find((entry) => entry.id === variantId.value) ?? null,
  );

  const canEditVariant = computed(() => canUpdateProduct.value && !data.value?.product?.isDeleted);

  const variantTabs = computed<Array<{ label: string; value: VariantTab }>>(() => [
    { label: "Overview", value: "overview" },
    ...(canEditVariant.value ? [{ label: "Edit", value: "edit" as const }] : []),
    ...(canReadInventory.value || canCreateInventory.value ? [{ label: "Inventory", value: "inventory" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): VariantTab => {
    const resolved = value === "edit" || value === "inventory" ? value : "overview";
    return variantTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const activeTab = ref<VariantTab>("overview");

  // 6. Watchers
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

  // 5. Actions/mutations
  const selectTab = async (tab: VariantTab) => {
    activeTab.value = normalizeTab(tab);

    await navigateTo(
      {
        path: `/products/${productId.value}/variants/${variantId.value}`,
        query: { tab },
      },
      { replace: true },
    );
  };

  const openInventory = async () => {
    if (!canReadInventory.value) {
      return;
    }

    inventoryActionPending.value = "open";
    inventoryActionError.value = "";

    try {
      const inventory = await inventoryApi.getInventoryByProductVariantId(variantId.value);
      await navigateTo(`/inventory/${inventory.id}`);
    } catch (requestError) {
      inventoryActionError.value = getProblemMessage(requestError, "No inventory record exists for this variant yet.");
    } finally {
      inventoryActionPending.value = "";
    }
  };

  const createInventory = async () => {
    if (!canCreateInventory.value) {
      return;
    }

    inventoryActionPending.value = "create";
    inventoryActionError.value = "";

    try {
      const inventory = await inventoryApi.createInventory({
        productVariantId: variantId.value,
      });
      await navigateTo(`/inventory/${inventory.id}`);
    } catch (requestError) {
      inventoryActionError.value = getProblemMessage(requestError, "Unable to create inventory for this variant.");
    } finally {
      inventoryActionPending.value = "";
    }
  };

  // 7. Return statement
  return {
    error,
    pending,
    data,
    productId,
    variantId,
    variant,
    variantTabs,
    activeTab,
    canCreateInventory,
    canReadInventory,
    createInventory,
    inventoryActionError,
    inventoryActionPending,
    openInventory,
    selectTab,
    refresh,
  };
};

export type ProductVariantDetailPage = Awaited<ReturnType<typeof useProductVariantDetailPage>>;
