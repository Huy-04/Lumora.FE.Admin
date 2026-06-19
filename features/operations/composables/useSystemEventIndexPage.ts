import type { SystemEventSearchResponse, SystemEventStatus } from "~/features/operations/types/operations";

export const useSystemEventIndexPage = async () => {
  // 1. Dependency injection
  const systemEventApi = useSystemEventAdminApi();
  const authz = useAdminAuthorization();

  const statusOptions = [
    { label: "All statuses", value: "" },
    { label: "Pending", value: "Pending" },
    { label: "Processed", value: "Processed" },
    { label: "Failed", value: "Failed" },
  ];

  // 2. Permissions
  const canReadSystemEvents = computed(() =>
    authz.can([ADMIN_PERMISSION.systemEventReadAll, ADMIN_PERMISSION.adminAccessAll]),
  );

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      {
        keyword: "",
        status: "" as SystemEventStatus | "",
        eventType: "",
        aggregateId: "",
        occurredFrom: "",
        occurredTo: "",
      },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // 5. Data fetching
  const emptySystemEvents = (): SystemEventSearchResponse => ({
    items: [],
    totalCount: 0,
    page: pagination.page.value,
    size: Number(pagination.pageSize.value),
    totalPages: 0,
  });

  const toUtcDayStart = (value: string) =>
    value ? `${value}T00:00:00.000Z` : undefined;

  const toUtcDayEnd = (value: string) =>
    value ? `${value}T23:59:59.999Z` : undefined;

  const { data, pending, error, refresh } = await useAsyncData(
    () => `system-events:${appliedFilters.keyword.value || "all"}:${appliedFilters.status.value || "all"}:${appliedFilters.eventType.value || "all"}:${appliedFilters.aggregateId.value || "none"}:${appliedFilters.occurredFrom.value || "none"}:${appliedFilters.occurredTo.value || "none"}:${pagination.page.value}:${pagination.pageSize.value}`,
    () => {
      if (!canReadSystemEvents.value) {
        return Promise.resolve(emptySystemEvents());
      }

      return systemEventApi.searchSystemEvents({
        keyword: appliedFilters.keyword.value || undefined,
        status: appliedFilters.status.value || undefined,
        eventType: appliedFilters.eventType.value || undefined,
        aggregateId: appliedFilters.aggregateId.value || undefined,
        occurredFrom: toUtcDayStart(appliedFilters.occurredFrom.value),
        occurredTo: toUtcDayEnd(appliedFilters.occurredTo.value),
        page: pagination.page.value,
        size: Number(pagination.pageSize.value),
      });
    },
  );

  // 8. Watchers
  watch(() => data.value?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const realtimeRefresh = useRealtimeRefresh(refresh);
  useOperationsRealtime(
    () => realtimeRefresh.scheduleRefresh(),
    { enabled: canReadSystemEvents },
  );

  // 6. Computed derivations
  const systemEvents = computed(() => data.value?.items ?? []);
  const totalSystemEvents = computed(() => data.value?.totalCount ?? 0);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "System events are not available right now."));

  const summaryStats = computed(() => [
    { label: "Events", value: `${totalSystemEvents.value}`, detail: "Events matching the current search." },
    { label: "Page pending", value: `${systemEvents.value.filter((event) => event.status === "Pending").length}`, detail: "Pending events on this page." },
    { label: "Page failed", value: `${systemEvents.value.filter((event) => event.status === "Failed").length}`, detail: "Failed events on this page." },
    { label: "Page processed", value: `${systemEvents.value.filter((event) => event.status === "Processed").length}`, detail: "Processed events on this page." },
  ]);

  // 9. Return statement
  return {
    applyFilters,
    canReadSystemEvents,
    clearFilters,
    error,
    hasActiveFilters,
    loadErrorMessage,
    localFilters,
    pending,
    refresh,
    statusOptions,
    summaryStats,
    systemEvents,
    totalSystemEvents,
    ...pagination,
  };
};

export type SystemEventIndexPageState = Awaited<ReturnType<typeof useSystemEventIndexPage>>;
