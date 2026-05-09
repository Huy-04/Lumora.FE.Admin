import { toSearchParams } from "~/Shared/api/queryParams";
import type {
  PaymentResponse,
  PaymentSearchResponse,
  PaymentSummaryResponse,
  SearchPaymentsRequest,
} from "~/features/payments/types";

const paymentRoute = (path = "") => `/payments${path}`;

export const usePaymentAdminApi = () => {
  const api = useApiClient();

  return {
    searchPayments: (params: SearchPaymentsRequest = {}) =>
      api.request<PaymentSearchResponse>(`${paymentRoute("/search")}${toSearchParams({
        keyword: params.keyword,
        userId: params.userId,
        orderId: params.orderId,
        status: params.status,
        method: params.method,
        provider: params.provider,
        createdFrom: params.createdFrom,
        createdTo: params.createdTo,
        page: params.page ?? 1,
        size: params.size ?? 20,
      })}`),

    getPaymentById: (paymentId: string) =>
      api.request<PaymentResponse>(paymentRoute(`/${paymentId}`)),

    getPaymentByOrderId: (orderId: string) =>
      api.request<PaymentResponse>(paymentRoute(`/orders/${orderId}`)),

    markManualSuccess: (orderId: string) =>
      api.request<PaymentSummaryResponse>(paymentRoute(`/orders/${orderId}/manual-success`), { method: "POST" }),

    markManualFailed: (orderId: string) =>
      api.request<PaymentSummaryResponse>(paymentRoute(`/orders/${orderId}/manual-failed`), { method: "POST" }),
  };
};
