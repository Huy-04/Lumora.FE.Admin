const dashboardTrendRanges = [
  { value: "1d", label: "1D", days: 1, bucket: "day" },
  { value: "3d", label: "3D", days: 3, bucket: "day" },
  { value: "5d", label: "5D", days: 5, bucket: "day" },
  { value: "7d", label: "7D", days: 7, bucket: "day" },
  { value: "30d", label: "30D", days: 30, bucket: "day" },
  { value: "3y", label: "3Y", months: 36, bucket: "month" },
] as const;

type DashboardTrendRange = typeof dashboardTrendRanges[number]["value"];
type DashboardTrendPoint = { date: string; label: string; count: number };

const toTrendDate = (date: string) => new Date(`${date}T00:00:00`);

export const useDashboardPage = async () => {
  // 1. Dependency injection
  const session = useAuthSession();
  const dashboardApi = useDashboardAdminApi();

  // 6. Computed derivations
  const currentUser = computed(() => session.user.value);

  const selectedTrendRange = ref<DashboardTrendRange>("7d");
  const orderTrend = ref<DashboardTrendPoint[]>([]);
  const orderTrendByRange = ref<Partial<Record<DashboardTrendRange, DashboardTrendPoint[]>>>({});
  const trendPending = ref(false);
  const trendError = ref<unknown>(null);
  let trendRequestId = 0;

  const mapTrendPoints = (range: DashboardTrendRange, points: Array<{ date: string; count: number }>) => {
    const selectedRange = dashboardTrendRanges.find(r => r.value === range) ?? dashboardTrendRanges[3];

    return points.map(point => {
      const date = toTrendDate(point.date);

      return {
        date: point.date,
        label: selectedRange.bucket === "month"
          ? date.toLocaleDateString("en", { month: "short" })
          : date.toLocaleDateString("en", { weekday: "short" }),
        count: point.count,
      };
    });
  };

  // 7. Actions/mutations
  const loadOrderTrends = async () => {
    const requestId = ++trendRequestId;
    trendPending.value = true;
    trendError.value = null;

    try {
      const response = await dashboardApi.getOrderTrends();
      if (requestId === trendRequestId) {
        orderTrendByRange.value = Object.fromEntries(
          response.ranges.map(item => [
            item.range,
            mapTrendPoints(item.range as DashboardTrendRange, item.points),
          ]),
        ) as Partial<Record<DashboardTrendRange, DashboardTrendPoint[]>>;
        orderTrend.value = orderTrendByRange.value[selectedTrendRange.value] ?? [];
      }
    } catch (error) {
      if (requestId === trendRequestId) {
        trendError.value = error;
        orderTrend.value = [];
      }
    } finally {
      if (requestId === trendRequestId) {
        trendPending.value = false;
      }
    }
  };

  // 5. Data fetching
  const summaryAsyncData = useAsyncData("dashboard-summary", async () => {
    return await dashboardApi.getSummary();
  });

  const [{ data, pending: summaryPending, error, refresh: refreshSummary }] = await Promise.all([
    summaryAsyncData,
    loadOrderTrends(),
  ]);

  const stats = computed(() => {
    const summary = data.value ?? {
      orders: { total: 0, pending: 0, confirmed: 0, processing: 0, inTransit: 0, delivered: 0, completed: 0, cancelled: 0 },
      payments: { total: 0, succeeded: 0, pending: 0, processing: 0, failed: 0 },
      shipments: { total: 0, draft: 0, submitted: 0, pickedUp: 0, inTransit: 0, delivered: 0, returned: 0, cancelled: 0, failed: 0 },
      products: { total: 0, published: 0, draft: 0, discontinued: 0 },
      revenue: { total: 0, today: 0, thisMonth: 0, averageOrderValue: 0, paidOrders: 0 },
      recentOrders: [],
    };

    return {
      ...summary,
      orderTrend: orderTrend.value ?? [],
    };
  });

  const pending = computed(() => summaryPending.value && !data.value);
  const refreshing = computed(() => summaryPending.value || trendPending.value);

  const refresh = async () => {
    await Promise.all([refreshSummary(), loadOrderTrends()]);
  };

  const setTrendRange = (range: DashboardTrendRange) => {
    if (selectedTrendRange.value === range) return;
    selectedTrendRange.value = range;
    orderTrend.value = orderTrendByRange.value[range] ?? [];
  };

  // 9. Return statement
  return {
    currentUser,
    stats,
    pending,
    refreshing,
    error,
    refresh,
    trendRanges: dashboardTrendRanges,
    selectedTrendRange,
    trendPending,
    trendError,
    loadOrderTrends,
    setTrendRange,
  };
};

export type DashboardPageState = Awaited<ReturnType<typeof useDashboardPage>>;
