import type { OrderPaymentStatus, OrderStatus } from "~/features/orders/types/orders";
import { toUtcDateFilter } from "~/features/orders/utils/dateTime";

export const useOrderIndexPage = async () => {
  // 1. Dependency injection
  const orderApi = useOrderAdminApi();
  const warehouseApi = useWarehouseAdminApi();
  const authz = useAdminAuthorization();
  const { orderStatusOptions, paymentStatusOptions } = useOrderOptions();

  // 2. Permissions
  const canReadOrders = computed(() => authz.can(ADMIN_PERMISSION.orderReadAll));
  const canReadWarehouses = computed(() => authz.can(ADMIN_PERMISSION.warehouseReadAll));

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      {
        keyword: "",
        warehouseId: "",
        status: "" as OrderStatus | "",
        paymentStatus: "" as OrderPaymentStatus | "",
        createdFrom: "",
        createdTo: "",
      },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `orders:${appliedFilters.keyword.value || "all"}:${appliedFilters.warehouseId.value || "all"}:${appliedFilters.status.value || "all"}:${appliedFilters.paymentStatus.value || "all"}:${appliedFilters.createdFrom.value || "none"}:${appliedFilters.createdTo.value || "none"}:${pagination.page.value}:${pagination.pageSize.value}`,
    () => orderApi.searchOrders({
      keyword: appliedFilters.keyword.value || undefined,
      warehouseId: appliedFilters.warehouseId.value || undefined,
      status: appliedFilters.status.value || undefined,
      paymentStatus: appliedFilters.paymentStatus.value || undefined,
      createdFrom: toUtcDateFilter(appliedFilters.createdFrom.value, "start"),
      createdTo: toUtcDateFilter(appliedFilters.createdTo.value, "end"),
      page: pagination.page.value,
      size: Number(pagination.pageSize.value),
    }),
  );

  const { data: warehousesData, pending: warehousesPending } = await useAsyncData(
    "orders:warehouse-options",
    async () => {
      if (!canReadWarehouses.value) {
        return [];
      }

      return await warehouseApi.getWarehouses();
    },
  );

  // 6. Computed derivations
  const orders = computed(() => data.value?.items ?? []);
  const warehouseOptions = computed(() => [
    { label: "All warehouses", value: "" },
    ...(warehousesData.value ?? []).map((warehouse) => ({
      label: warehouse.name,
      value: warehouse.id,
    })),
  ]);
  const totalOrders = computed(() => data.value?.totalCount ?? 0);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The order queue is not available right now."));

  // Wire totalItems to fetched data
  watch(() => data.value?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

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

  // 7. Actions/mutations
  // (none for index page)

  // 8. Watchers
  // (pagination reset on filter/pageSize change is handled by useFilters onApply and usePagination internal watcher)

  // 9. Return statement
  return {
    applyFilters,
    canReadOrders,
    clearFilters,
    error,
    hasActiveFilters,
    loadErrorMessage,
    localFilters,
    orderStatusOptions,
    orders,
    paymentStatusOptions,
    pending,
    refresh,
    summaryStats,
    totalOrders,
    warehouseOptions,
    warehousesPending,
    ...pagination,
  };
};

export type OrderIndexPageState = Awaited<ReturnType<typeof useOrderIndexPage>>;
