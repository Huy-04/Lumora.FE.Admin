import type { PaginatedResponse } from "~/Shared/types/api";

export type ShipmentStatus =
  | "Draft"
  | "Submitted"
  | "PickedUp"
  | "InTransit"
  | "Delivered"
  | "Returned"
  | "Cancelled"
  | "Failed";

export type ShipmentCarrier = "GHN";

export interface ShipmentCancellationResponse {
  reason: string;
  cancelledBy: string;
  cancelledAt: string;
}

export interface ShipmentResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  shipmentNumber: string;
  carrier: string;
  carrierOrderCode?: string | null;
  carrierShopId?: number | null;
  status: ShipmentStatus | string;
  submittedAt?: string | null;
  pickedAt?: string | null;
  deliveredAt?: string | null;
  returnedAt?: string | null;
  cancelledAt?: string | null;
  cancellation?: ShipmentCancellationResponse | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentRequest {
  orderId: string;
  shipmentNumber?: string | null;
}

export interface SubmitShipmentRequest {
  requiredNote?: string | null;
  note?: string | null;
  content?: string | null;
  insuranceValue?: number | null;
  returnPhone?: string | null;
  returnAddress?: string | null;
  returnDistrictId?: number | null;
  returnWardCode?: string | null;
  pickStationId?: string | null;
  deliverStationId?: string | null;
  pickShift?: number[] | null;
}

export interface SearchShipmentsRequest {
  keyword?: string;
  orderId?: string;
  status?: ShipmentStatus | "";
  carrier?: ShipmentCarrier | "";
  page?: number;
  size?: number;
}

export type ShipmentSearchResponse = PaginatedResponse<ShipmentResponse>;
