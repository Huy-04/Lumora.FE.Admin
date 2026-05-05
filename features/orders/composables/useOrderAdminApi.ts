import { toSearchParams } from "~/Shared/api/queryParams";
import type {
  CancelOrderRequest,
  OrderResponse,
  OrderSearchResponse,
  ReturnOrderToSenderRequest,
  SearchOrdersRequest,
} from "~/features/orders/types";

const orderRoute = (path = "") => `/orders${path}`;

export const useOrderAdminApi = () => {
  const api = useApiClient();

  return {
    searchOrders: (params: SearchOrdersRequest = {}) =>
      api.request<OrderSearchResponse>(`${orderRoute("/search")}${toSearchParams({
        keyword: params.keyword,
        userId: params.userId,
        warehouseId: params.warehouseId,
        status: params.status,
        paymentStatus: params.paymentStatus,
        createdFrom: params.createdFrom,
        createdTo: params.createdTo,
        page: params.page ?? 1,
        size: params.size ?? 20,
      })}`),

    getOrderById: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${orderId}`)),

    getOrdersByUserId: (userId: string, page = 1, size = 20) =>
      api.request<OrderSearchResponse>(`${orderRoute(`/users/${userId}`)}${toSearchParams({ page, size })}`),

    confirmOrder: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${orderId}/confirm`), { method: "POST" }),

    startProcessingOrder: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${orderId}/start-processing`), { method: "POST" }),

    markOrderInTransit: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${orderId}/mark-in-transit`), { method: "POST" }),

    deliverOrder: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${orderId}/deliver`), { method: "POST" }),

    completeOrder: (orderId: string) =>
      api.request<OrderResponse>(orderRoute(`/${orderId}/complete`), { method: "POST" }),

    cancelOrder: (orderId: string, payload: CancelOrderRequest) =>
      api.request<OrderResponse>(orderRoute(`/${orderId}/cancel`), {
        method: "POST",
        body: payload,
      }),

    returnOrderToSender: (orderId: string, payload: ReturnOrderToSenderRequest) =>
      api.request<OrderResponse>(orderRoute(`/${orderId}/return-to-sender`), {
        method: "POST",
        body: payload,
      }),
  };
};
