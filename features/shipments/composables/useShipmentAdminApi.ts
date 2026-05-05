import type { CreateShipmentRequest, SearchShipmentsRequest, ShipmentResponse, ShipmentSearchResponse, SubmitShipmentRequest } from "~/features/shipments/types";

const shipmentRoute = (path = "") => `/shipments${path}`;

export const useShipmentAdminApi = () => {
  const api = useApiClient();

  return {
    searchShipments: (params: SearchShipmentsRequest = {}) =>
      api.request<ShipmentSearchResponse>(shipmentRoute(toSearchParams({
        keyword: params.keyword,
        orderId: params.orderId,
        status: params.status,
        carrier: params.carrier,
        page: params.page,
        size: params.size,
      }))),

    getShipmentById: (shipmentId: string) =>
      api.request<ShipmentResponse>(shipmentRoute(`/${shipmentId}`)),

    getShipmentByOrderId: (orderId: string) =>
      api.request<ShipmentResponse>(shipmentRoute(`/orders/${orderId}`)),

    createShipment: (payload: CreateShipmentRequest) =>
      api.request<ShipmentResponse>(shipmentRoute(), {
        method: "POST",
        body: payload,
      }),

    submitShipment: (shipmentId: string, payload: SubmitShipmentRequest) =>
      api.request<ShipmentResponse>(shipmentRoute(`/${shipmentId}/submit`), {
        method: "POST",
        body: payload,
      }),
  };
};
