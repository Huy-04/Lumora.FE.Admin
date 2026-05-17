import type { ShipmentCarrier, ShipmentStatus } from "~/features/shipments/types";

const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const useShipmentIndexPage = async () => {
  // 1. Dependency injection
  const shipmentApi = useShipmentAdminApi();
  const authz = useAdminAuthorization();

  // 2. Permissions
  const canReadShipment = computed(() => authz.can(ADMIN_PERMISSION.shipmentReadAll));
  const canCreateShipment = computed(() => authz.can(ADMIN_PERMISSION.shipmentModifyAll));

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      { keyword: "", status: "" as ShipmentStatus | "", carrier: "" as ShipmentCarrier | "" },
      { onApply: () => { pagination.page.value = 1; } },
    );

  const searchTerms = computed(() => {
    const keyword = appliedFilters.keyword.value.trim();
    const isOrderId = guidPattern.test(keyword);

    return {
      keyword: keyword && !isOrderId ? keyword : undefined,
      orderId: isOrderId ? keyword : undefined,
    };
  });

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `shipments:${searchTerms.value.keyword || "all"}:${searchTerms.value.orderId || "all"}:${appliedFilters.status.value || "all"}:${appliedFilters.carrier.value || "all"}:${pagination.page.value}:${pagination.pageSize.value}`,
    () => shipmentApi.searchShipments({
      keyword: searchTerms.value.keyword,
      orderId: searchTerms.value.orderId,
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

  // 7. Watchers
  // (pagination reset on filter apply and pageSize change handled by usePagination and useFilters)

  // 8. Return statement
  return {
    applyFilters,
    canCreateShipment,
    canReadShipment,
    carrierOptions,
    clearFilters,
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
