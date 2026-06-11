import type { ReviewResponse } from "~/features/reviews/types";

type ReviewActionKey = "hide" | "show" | "delete";

export const useReviewDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const reviewApi = useReviewAdminApi();
  const authz = useAdminAuthorization();

  // 2. Permissions
  const reviewId = computed(() => String(route.params.id ?? ""));
  const canModifyReviews = computed(() => authz.can(ADMIN_PERMISSION.reviewModifyAll));

  // 3. Action state
  const actionPending = ref<ReviewActionKey | "">("");
  const actionError = ref("");
  const actionSuccess = ref("");

  // 4. Data fetching
  const fetchReviewById = async (): Promise<ReviewResponse> => reviewApi.getReview(reviewId.value);

  const { data, pending, error, refresh } = await useAsyncData(
    () => `review:${reviewId.value}`,
    fetchReviewById,
  );

  // 5. Computed derivations
  const review = computed<ReviewResponse | null>(() => data.value ?? null);
  const isNotFound = computed(() => getProblemStatus(error.value) === 404 || error.value?.statusCode === 404);
  const loadErrorMessage = computed(() =>
    isNotFound.value
      ? "Review not found."
      : getProblemMessage(error.value, "This review is not available right now."),
  );

  const isHidden = computed(() => review.value?.status === "Hidden");
  const isPublished = computed(() => review.value?.status === "Published");

  // 6. Actions/mutations
  const hideReview = async (reason?: string) => {
    if (!review.value || !canModifyReviews.value) return;

    actionPending.value = "hide";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await reviewApi.hideReview(review.value.id, reason);
      await refresh();
      actionSuccess.value = "Review hidden successfully.";
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to hide this review.");
    } finally {
      actionPending.value = "";
    }
  };

  const showReview = async () => {
    if (!review.value || !canModifyReviews.value) return;

    actionPending.value = "show";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await reviewApi.showReview(review.value.id);
      await refresh();
      actionSuccess.value = "Review is now visible.";
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to show this review.");
    } finally {
      actionPending.value = "";
    }
  };

  const deleteReview = async () => {
    if (!review.value || !canModifyReviews.value) return;

    actionPending.value = "delete";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await reviewApi.deleteReview(review.value.id);
      await navigateTo("/reviews");
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to delete this review.");
    } finally {
      actionPending.value = "";
    }
  };

  // 7. Return statement
  return {
    actionError,
    actionPending,
    actionSuccess,
    canModifyReviews,
    deleteReview,
    error,
    hideReview,
    isHidden,
    isNotFound,
    isPublished,
    loadErrorMessage,
    pending,
    refresh,
    review,
    reviewId,
    showReview,
  };
};

export type ReviewDetailPageState = Awaited<ReturnType<typeof useReviewDetailPage>>;
