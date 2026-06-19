import type { PaginatedResponse } from "~/Shared/types/api";

export type ReviewStatus = "Published" | "Hidden";

export interface ReviewImageResponse {
  id: string;
  url: string;
  sortOrder: number;
  createdAt: string;
}

export interface ReviewResponse {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  content: string | null;
  status: ReviewStatus;
  hideReason?: string | null;
  images: ReviewImageResponse[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchReviewsRequest {
  productId?: string;
  userId?: string;
  isHidden?: boolean;
  rating?: number;
  page?: number;
  size?: number;
}

export interface HideReviewRequest {
  reason?: string;
}

export type ReviewSearchResponse = PaginatedResponse<ReviewResponse>;
