import type { PaginatedResponse } from "~/Shared/types/api";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "InTransit"
  | "Delivered"
  | "Completed"
  | "Cancelled"
  | "ReturnedToSender";

export type OrderPaymentStatus = "Awaiting" | "Paid" | "Failed";

export type StockReservationStatus =
  | "Pending"
  | "Reserved"
  | "Failed"
  | "Released"
  | "Committed"
  | "Restocked";

export interface OrderAddressResponse {
  province: string;
  district: string;
  ward: string;
  street: string;
}

export interface OrderCancellationResponse {
  reason: string;
  cancelledBy: string;
  cancelledAt: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productVariantId: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  thumbnailSnapshot?: string | null;
  skuSnapshot: string;
  priceSnapshot: number;
  weightSnapshot: number;
  lengthSnapshot: number;
  widthSnapshot: number;
  heightSnapshot: number;
  quantity: number;
}

export interface OrderResponse {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  stockReservationStatus: StockReservationStatus;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: string;
  shippingAddress: OrderAddressResponse;
  recipientPhone: string;
  recipientName: string;
  warehouseId: string;
  subTotal: number;
  shippingFee: number;
  shippingQuoteId: string;
  discountAmount: number;
  totalAmount: number;
  customerNote?: string | null;
  cancellation?: OrderCancellationResponse | null;
  items: OrderItemResponse[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchOrdersRequest {
  keyword?: string;
  userId?: string;
  warehouseId?: string;
  status?: OrderStatus | "";
  paymentStatus?: OrderPaymentStatus | "";
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface ReturnOrderToSenderRequest {
  reason: string;
}

export type OrderSearchResponse = PaginatedResponse<OrderResponse>;
