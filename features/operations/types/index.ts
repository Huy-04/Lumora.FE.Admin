import type { PaginatedResponse } from "~/Shared/types/api";

export type SystemEventStatus = "Pending" | "Processed" | "Failed";

export interface SystemEventSummaryResponse {
  id: string;
  eventType: string;
  aggregateId: string;
  status: SystemEventStatus | string;
  occurredOn: string;
  processedAt?: string | null;
  retryCount: number;
  hasError: boolean;
  errorPreview?: string | null;
}

export interface SystemEventDetailResponse {
  id: string;
  eventType: string;
  aggregateId: string;
  status: SystemEventStatus | string;
  payload: string;
  error?: string | null;
  occurredOn: string;
  processedAt?: string | null;
  retryCount: number;
  isFailed: boolean;
  hasError: boolean;
}

export interface SearchSystemEventsRequest {
  keyword?: string;
  status?: SystemEventStatus | "";
  eventType?: string;
  aggregateId?: string;
  occurredFrom?: string;
  occurredTo?: string;
  page?: number;
  size?: number;
}

export type SystemEventSearchResponse = PaginatedResponse<SystemEventSummaryResponse>;
