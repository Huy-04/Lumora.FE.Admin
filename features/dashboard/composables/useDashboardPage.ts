type DashboardTrendPoint = { date: string; label: string; count: number };

const toTrendDate = (date: string) => new Date(`${date}T00:00:00`);

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useDashboardPage = async () => {
  const session = useAuthSession();
  const dashboardApi = useDashboardAdminApi();

  const currentUser = computed(() => session.user.value);

  const today = new Date();
  const defaultToDate = formatDateInput(today);
  const defaultFromDate = formatDateInput(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6));

  const fromDate = ref(defaultFromDate);
  const toDate = ref(defaultToDate);
  const orderTrend = ref<DashboardTrendPoint[]>([]);
  const trendPending = ref(false);
  const trendError = ref<unknown>(null);
  let trendRequestId = 0;

  const mapTrendPoints = (points: Array<{ date: string; count: number }>) =>
    points.map(point => {
      const date = toTrendDate(point.date);
      return {
        date: point.date,
        label: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
        count: point.count,
      };
    });

  const trendFilterError = computed(() => {
    if (!fromDate.value || !toDate.value) return "Select both from and to dates.";
    if (fromDate.value > toDate.value) return "From date must be before or equal to to date.";
    return null;
  });

  const loadOrderTrends = async () => {
    if (trendFilterError.value) {
      trendError.value = new Error(trendFilterError.value);
      orderTrend.value = [];
      return;
    }

    const requestId = ++trendRequestId;
    trendPending.value = true;
    trendError.value = null;

    try {
      const response = await dashboardApi.getOrderTrends(fromDate.value, toDate.value);
      if (requestId === trendRequestId) {
        orderTrend.value = mapTrendPoints(response.ranges[0]?.points ?? []);
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

  const applyTrendFilter = async () => {
    await loadOrderTrends();
  };

  return {
    currentUser,
    stats,
    pending,
    refreshing,
    error,
    refresh,
    fromDate,
    toDate,
    trendFilterError,
    trendPending,
    trendError,
    loadOrderTrends,
    applyTrendFilter,
  };
};

export type DashboardPageState = Awaited<ReturnType<typeof useDashboardPage>>;
