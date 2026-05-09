import type { ShipmentCarrier, ShipmentStatus } from "~/features/shipments/types";

export const useShipmentIndexPage = async () => {
  const shipmentApi = useShipmentAdminApi();
  const authz = useAdminAuthorization();

  const canReadShipment = computed(() => authz.can(ADMIN_PERMISSION.shipmentReadAll));

  const localKeyword = ref("");
  const localOrderId = ref("");
  const localStatus = ref<ShipmentStatus | "">("");
  const localCarrier = ref<ShipmentCarrier | "">("");

  const keyword = ref("");
  const orderId = ref("");
  const status = ref<ShipmentStatus | "">("");
  const carrier = ref<ShipmentCarrier | "">("");
  const page = ref(1);
  const pageSize = ref("20");

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

  const pageSizeOptions = [
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];

  const applyFilters = () => {
    keyword.value = localKeyword.value.trim();
    orderId.value = localOrderId.value.trim();
    status.value = localStatus.value;
    carrier.value = localCarrier.value;
    page.value = 1;
  };

  const clearFilters = () => {
    localKeyword.value = "";
    localOrderId.value = "";
    localStatus.value = "";
    localCarrier.value = "";
    applyFilters();
  };

  const { data, pending, error, refresh } = await useAsyncData(
    () => `shipments:${keyword.value || "all"}:${orderId.value || "all"}:${status.value || "all"}:${carrier.value || "all"}:${page.value}:${pageSize.value}`,
    () => shipmentApi.searchShipments({
      keyword: keyword.value || undefined,
      orderId: orderId.value || undefined,
      status: status.value || undefined,
      carrier: carrier.value || undefined,
      page: page.value,
      size: Number(pageSize.value),
    }),
  );

  const shipments = computed(() => data.value?.items ?? []);
  const totalShipments = computed(() => data.value?.totalCount ?? 0);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalShipments.value / Number(pageSize.value))));
  const hasFilters = computed(() => Boolean(keyword.value || orderId.value || status.value || carrier.value));
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The shipment queue is not available right now."));
  const firstItemNumber = computed(() => totalShipments.value === 0 ? 0 : (page.value - 1) * Number(pageSize.value) + 1);
  const lastItemNumber = computed(() => Math.min(page.value * Number(pageSize.value), totalShipments.value));

  const goToPreviousPage = () => {
    if (page.value <= 1) {
      return;
    }

    page.value -= 1;
  };

  const goToNextPage = () => {
    if (page.value >= totalPages.value) {
      return;
    }

    page.value += 1;
  };

  watch(pageSize, () => {
    page.value = 1;
  });

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

  return {
    applyFilters,
    carrierOptions,
    canReadShipment,
    clearFilters,
    error,
    firstItemNumber,
    goToNextPage,
    goToPreviousPage,
    hasFilters,
    lastItemNumber,
    loadErrorMessage,
    localCarrier,
    localKeyword,
    localOrderId,
    localStatus,
    page,
    pageSize,
    pageSizeOptions,
    pending,
    refresh,
    shipmentStatusOptions,
    shipments,
    summaryStats,
    totalPages,
    totalShipments,
  };
};

export type ShipmentIndexPageState = Awaited<ReturnType<typeof useShipmentIndexPage>>;
