import type { PaginatedResponse } from "~/Shared/types/api";

export type PaymentStatus = "Pending" | "Processing" | "Succeeded" | "Failed";
export type PaymentMethod = "COD" | "VnPay";
export type PaymentProvider = "None" | "VnPay";
export type PaymentAttemptStatus = "Pending" | "RedirectIssued" | "ReturnReceived" | "Succeeded" | "Failed" | "Expired";

export interface PaymentSummaryResponse {
  id: string;
  orderId: string;
  userId: string;
  method: PaymentMethod | string;
  provider: PaymentProvider | string;
  status: PaymentStatus | string;
  amount: number;
  currency: string;
  succeededAt?: string | null;
  failedAt?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
}

export interface PaymentAttemptResponse {
  id: string;
  attemptNo: number;
  status: PaymentAttemptStatus | string;
  txnRef: string;
  providerTransactionNo?: string | null;
  amount: number;
  issuedAt: string;
  expiresAt: string;
  returnedAt?: string | null;
  ipnReceivedAt?: string | null;
  providerResponseCode?: string | null;
  providerTransactionStatus?: string | null;
  bankCode?: string | null;
  providerPayDate?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
}

export interface PaymentResponse extends PaymentSummaryResponse {
  orderNumber: string;
  attempts: PaymentAttemptResponse[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchPaymentsRequest {
  keyword?: string;
  userId?: string;
  orderId?: string;
  status?: PaymentStatus | "";
  method?: PaymentMethod | "";
  provider?: PaymentProvider | "";
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
}

export type PaymentSearchResponse = PaginatedResponse<PaymentSummaryResponse>;
