import type {
  HideReviewRequest,
  ReviewResponse,
  ReviewSearchResponse,
  SearchReviewsRequest,
} from "~/features/reviews/types";

const reviewRoute = (path = "") => `/admin/reviews${path}`;

function buildSearchQuery(params: SearchReviewsRequest) {
  const query: Record<string, string | number | boolean> = {};
  if (params.productId) query.productId = params.productId;
  if (params.userId) query.userId = params.userId;
  if (params.isHidden != null) query.isHidden = params.isHidden;
  if (params.rating != null) query.rating = params.rating;
  if (params.page != null) query.page = params.page;
  if (params.size != null) query.size = params.size;
  return query;
}

export const useReviewAdminApi = () => {
  const api = useApiClient();

  return {
    searchReviews: (params: SearchReviewsRequest = {}) =>
      api.request<ReviewSearchResponse>(reviewRoute(), {
        query: buildSearchQuery(params),
      }),

    getReview: (reviewId: string) =>
      api.request<ReviewResponse>(reviewRoute(`/${encodeURIComponent(reviewId)}`)),

    hideReview: (reviewId: string, reason?: string) => {
      const body: HideReviewRequest | undefined = reason != null ? { reason } : undefined;
      return api.request<ReviewResponse>(reviewRoute(`/${encodeURIComponent(reviewId)}/hide`), {
        method: "POST",
        ...(body && { body }),
      });
    },

    showReview: (reviewId: string) =>
      api.request<ReviewResponse>(reviewRoute(`/${encodeURIComponent(reviewId)}/show`), {
        method: "POST",
      }),

    deleteReview: (reviewId: string) =>
      api.request<void>(reviewRoute(`/${encodeURIComponent(reviewId)}`), {
        method: "DELETE",
      }),
  };
};
