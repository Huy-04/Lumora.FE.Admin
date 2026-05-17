import type {
  DashboardOrderTrendsResponse,
  DashboardSummaryResponse,
} from "~/features/dashboard/types";

const dashboardRoute = (path = "") => `/dashboard${path}`;

export const useDashboardAdminApi = () => {
  const api = useApiClient();

  return {
    getSummary: () =>
      api.request<DashboardSummaryResponse>(dashboardRoute("/summary")),

    getOrderTrends: () =>
      api.request<DashboardOrderTrendsResponse>(dashboardRoute("/order-trends")),
  };
};
