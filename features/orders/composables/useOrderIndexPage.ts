import type { OrderPaymentStatus, OrderStatus } from "~/features/orders/types";

export const useOrderIndexPage = async () => {
  const orderApi = useOrderAdminApi();
  const authz = useAdminAuthorization();
  const { orderStatusOptions, paymentStatusOptions } = useOrderOptions();

  const canReadOrders = computed(() => authz.can(ADMIN_PERMISSION.orderReadAll));

  const localKeyword = ref("");
  const localUserId = ref("");
  const localWarehouseId = ref("");
  const localStatus = ref<OrderStatus | "">("");
  const localPaymentStatus = ref<OrderPaymentStatus | "">("");
  const localCreatedFrom = ref("");
  const localCreatedTo = ref("");

  const keyword = ref("");
  const userId = ref("");
  const warehouseId = ref("");
  const status = ref<OrderStatus | "">("");
  const paymentStatus = ref<OrderPaymentStatus | "">("");
  const createdFrom = ref("");
  const createdTo = ref("");
  const page = ref(1);
  const pageSize = ref("20");

  const applyFilters = () => {
    keyword.value = localKeyword.value.trim();
    userId.value = localUserId.value.trim();
    warehouseId.value = localWarehouseId.value.trim();
    status.value = localStatus.value;
    paymentStatus.value = localPaymentStatus.value;
    createdFrom.value = localCreatedFrom.value;
    createdTo.value = localCreatedTo.value;
    page.value = 1;
  };

  const clearFilters = () => {
    localKeyword.value = "";
    localUserId.value = "";
    localWarehouseId.value = "";
    localStatus.value = "";
    localPaymentStatus.value = "";
    localCreatedFrom.value = "";
    localCreatedTo.value = "";
    applyFilters();
  };

  const { data, pending, error, refresh } = await useAsyncData(
    () => `orders:${keyword.value || "all"}:${userId.value || "all"}:${warehouseId.value || "all"}:${status.value || "all"}:${paymentStatus.value || "all"}:${createdFrom.value || "none"}:${createdTo.value || "none"}:${page.value}:${pageSize.value}`,
    () => orderApi.searchOrders({
      keyword: keyword.value || undefined,
      userId: userId.value || undefined,
      warehouseId: warehouseId.value || undefined,
      status: status.value || undefined,
      paymentStatus: paymentStatus.value || undefined,
      createdFrom: createdFrom.value || undefined,
      createdTo: createdTo.value || undefined,
      page: page.value,
      size: Number(pageSize.value),
    }),
  );

  const orders = computed(() => data.value?.items ?? []);
  const totalOrders = computed(() => data.value?.totalCount ?? 0);
  const hasFilters = computed(() => Boolean(keyword.value || userId.value || warehouseId.value || status.value || paymentStatus.value || createdFrom.value || createdTo.value));
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The order queue is not available right now."));
  const totalPages = computed(() => Math.max(1, Math.ceil(totalOrders.value / Number(pageSize.value))));
  const pageSizeOptions = [
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];
  const firstItemNumber = computed(() => totalOrders.value === 0 ? 0 : (page.value - 1) * Number(pageSize.value) + 1);
  const lastItemNumber = computed(() => Math.min(page.value * Number(pageSize.value), totalOrders.value));

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
      label: "Orders",
      value: `${totalOrders.value}`,
      detail: "Orders matching the current admin search.",
    },
    {
      label: "Pending",
      value: `${orders.value.filter((order) => order.status === "Pending").length}`,
      detail: "Orders waiting for confirmation and inventory reservation.",
    },
    {
      label: "Processing",
      value: `${orders.value.filter((order) => order.status === "Processing").length}`,
      detail: "Orders being prepared before carrier transit.",
    },
    {
      label: "Payment awaiting",
      value: `${orders.value.filter((order) => order.paymentStatus === "Awaiting").length}`,
      detail: "Orders still waiting for payment resolution.",
    },
  ]);

  return {
    applyFilters,
    canReadOrders,
    clearFilters,
    createdFrom,
    createdTo,
    error,
    hasFilters,
    keyword,
    loadErrorMessage,
    localCreatedFrom,
    localCreatedTo,
    localKeyword,
    localPaymentStatus,
    localStatus,
    localUserId,
    localWarehouseId,
    orderStatusOptions,
    orders,
    page,
    pageSize,
    pageSizeOptions,
    paymentStatus,
    paymentStatusOptions,
    pending,
    firstItemNumber,
    goToNextPage,
    goToPreviousPage,
    lastItemNumber,
    refresh,
    status,
    summaryStats,
    totalPages,
    totalOrders,
    userId,
    warehouseId,
  };
};

export type OrderIndexPageState = Awaited<ReturnType<typeof useOrderIndexPage>>;
