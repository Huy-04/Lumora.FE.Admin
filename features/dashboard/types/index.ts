export interface DashboardOrderSummaryResponse {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  inTransit: number;
  delivered: number;
  completed: number;
  cancelled: number;
}

export interface DashboardPaymentSummaryResponse {
  total: number;
  succeeded: number;
  pending: number;
  processing: number;
  failed: number;
}

export interface DashboardShipmentSummaryResponse {
  total: number;
  draft: number;
  submitted: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  returned: number;
  cancelled: number;
  failed: number;
}

export interface DashboardProductSummaryResponse {
  total: number;
  published: number;
  draft: number;
  discontinued: number;
}

export interface DashboardRevenueSummaryResponse {
  total: number;
  today: number;
  thisMonth: number;
  averageOrderValue: number;
  paidOrders: number;
}

export interface DashboardSummaryResponse {
  orders: DashboardOrderSummaryResponse;
  payments: DashboardPaymentSummaryResponse;
  shipments: DashboardShipmentSummaryResponse;
  products: DashboardProductSummaryResponse;
  revenue: DashboardRevenueSummaryResponse;
}

export interface DashboardOrderTrendPointResponse {
  date: string;
  count: number;
}

export interface DashboardOrderTrendResponse {
  range: string;
  points: DashboardOrderTrendPointResponse[];
}

export interface DashboardOrderTrendsResponse {
  ranges: DashboardOrderTrendResponse[];
}
