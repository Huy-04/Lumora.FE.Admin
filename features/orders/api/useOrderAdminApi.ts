import type {
  CancelOrderRequest,
  OrderResponse,
  OrderSearchResponse,
  ReturnOrderToSenderRequest,
  SearchOrdersRequest,
} from "~/features/orders/types/orders";

const orderRoute = (path = "") => `/orders${path}`;

function buildSearchQuery(params: SearchOrdersRequest) {
  const query: Record<string, string | number> = {};
  if (params.keyword) query.keyword = params.keyword;
  if (params.userId) query.userId = params.userId;
  if (params.warehouseId) query.warehouseId = params.warehouseId;
  if (params.status) query.status = params.status;
  if (params.paymentStatus) query.paymentStatus = params.paymentStatus;
  if (params.createdFrom) query.createdFrom = params.createdFrom;
  if (params.createdTo) query.createdTo = params.createdTo;
  if (params.page != null) query.page = params.page;
  if (params.size != null) query.size = params.size;
  return query;
}

export const useOrderAdminApi = () => {
  const api = useApiClient();

  return {
    searchOrders: (params: SearchOrdersRequest = {}) =>
      api.request<OrderSearchResponse>(orderRoute("/search"), {
        query: buildSearchQuery(params),
      }),

    getOrderById: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${encodeURIComponent(orderId)}`)),

    getOrdersByUserId: (userId: string, page = 1, size = 20) =>
      api.request<OrderSearchResponse>(orderRoute(`/users/${encodeURIComponent(userId)}`), {
        query: { page, size },
      }),

    confirmOrder: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${encodeURIComponent(orderId)}/confirm`), { method: "POST" }),

    startProcessingOrder: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${encodeURIComponent(orderId)}/start-processing`), { method: "POST" }),

    markOrderInTransit: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${encodeURIComponent(orderId)}/mark-in-transit`), { method: "POST" }),

    deliverOrder: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${encodeURIComponent(orderId)}/deliver`), { method: "POST" }),

    completeOrder: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${encodeURIComponent(orderId)}/complete`), { method: "POST" }),

    cancelOrder: (orderId: string, payload: CancelOrderRequest) =>
      api.request<OrderResponse>(orderRoute(`/${encodeURIComponent(orderId)}/cancel`), {
        method: "POST",
        body: payload,
      }),

    returnOrderToSender: (orderId: string, payload: ReturnOrderToSenderRequest) =>
      api.request<OrderResponse>(orderRoute(`/${encodeURIComponent(orderId)}/return-to-sender`), {
        method: "POST",
        body: payload,
      }),
  };
};
