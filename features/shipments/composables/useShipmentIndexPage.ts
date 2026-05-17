import type { ShipmentCarrier, ShipmentStatus } from "~/features/shipments/types";

export const useShipmentIndexPage = async () => {
  // 1. Dependency injection
  const shipmentApi = useShipmentAdminApi();
  const authz = useAdminAuthorization();

  // 2. Permissions
  const canReadShipment = computed(() => authz.can(ADMIN_PERMISSION.shipmentReadAll));
  const canModifyShipment = computed(() => authz.can(ADMIN_PERMISSION.shipmentModifyAll));

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      { keyword: "", orderId: "", status: "" as ShipmentStatus | "", carrier: "" as ShipmentCarrier | "" },
      { onApply: () => { pagination.page.value = 1; } },
    );
  const createForm = reactive({
    orderId: "",
    shipmentNumber: "",
  });
  const createPending = ref(false);
  const createError = ref("");

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `shipments:${appliedFilters.keyword.value || "all"}:${appliedFilters.orderId.value || "all"}:${appliedFilters.status.value || "all"}:${appliedFilters.carrier.value || "all"}:${pagination.page.value}:${pagination.pageSize.value}`,
    () => shipmentApi.searchShipments({
      keyword: appliedFilters.keyword.value || undefined,
      orderId: appliedFilters.orderId.value || undefined,
      status: appliedFilters.status.value || undefined,
      carrier: appliedFilters.carrier.value || undefined,
      page: pagination.page.value,
      size: Number(pagination.pageSize.value),
    }),
  );

  // 6. Computed derivations
  const shipments = computed(() => data.value?.items ?? []);
  const totalShipments = computed(() => data.value?.totalCount ?? 0);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The shipment queue is not available right now."));

  // Wire totalItems to fetched data
  watch(() => data.value?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const shipmentStatusOptions = [
    { label: "All statuses", value: "" },
    { label: "Draft", value: "Draft" },
    { label: "Submitted", value: "Submitted" },
    { label: "Picked up", value: "PickedUp" },
    { label: "In transit", value: "InTransit" },
    { label: "Delivered", value: "Delivered" },
    { label: "Returned", value: "Returned" },
    { label: "Cancelled", value: "Cancelled" },
    { label: "Failed", value: "Failed" },
  ];

  const carrierOptions = [
    { label: "All carriers", value: "" },
    { label: "GHN", value: "GHN" },
  ];

  const summaryStats = computed(() => [
    {
      label: "Shipments",
      value: `${totalShipments.value}`,
      detail: "Shipments matching the current admin search.",
    },
    {
      label: "Draft",
      value: `${shipments.value.filter((shipment) => shipment.status === "Draft").length}`,
      detail: "Local drafts not submitted to carrier yet.",
    },
    {
      label: "In transit",
      value: `${shipments.value.filter((shipment) => shipment.status === "InTransit" || shipment.status === "PickedUp").length}`,
      detail: "Shipments currently moving through carrier flow.",
    },
    {
      label: "Delivered",
      value: `${shipments.value.filter((shipment) => shipment.status === "Delivered").length}`,
      detail: "Delivered shipments on this page.",
    },
  ]);

  // 7. Actions/mutations
  const createShipmentDraft = async () => {
    if (!canModifyShipment.value || createPending.value) {
      return;
    }

    const orderId = createForm.orderId.trim();
    const shipmentNumber = createForm.shipmentNumber.trim();

    if (!orderId) {
      createError.value = "Order ID is required.";
      return;
    }

    createPending.value = true;
    createError.value = "";

    try {
      const created = await shipmentApi.createShipment({
        orderId,
        shipmentNumber: shipmentNumber || null,
      });

      await navigateTo(`/shipments/${created.id}`);
    } catch (requestError) {
      createError.value = getProblemMessage(requestError, "Unable to create shipment draft.");
    } finally {
      createPending.value = false;
    }
  };

  // 8. Watchers
  // (pagination reset on filter apply and pageSize change handled by usePagination and useFilters)

  // 9. Return statement
  return {
    applyFilters,
    canModifyShipment,
    canReadShipment,
    carrierOptions,
    clearFilters,
    createError,
    createForm,
    createPending,
    createShipmentDraft,
    error,
    hasActiveFilters,
    loadErrorMessage,
    localFilters,
    pending,
    refresh,
    shipmentStatusOptions,
    shipments,
    summaryStats,
    totalShipments,
    ...pagination,
  };
};

export type ShipmentIndexPageState = Awaited<ReturnType<typeof useShipmentIndexPage>>;
