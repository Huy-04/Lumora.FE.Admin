export const useReviewIndexPage = async () => {
  // 1. Dependency injection
  const reviewApi = useReviewAdminApi();

  // 2. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 3. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      {
        productId: "",
        userId: "",
        isHidden: "" as "" | "true" | "false",
        rating: "" as "" | "1" | "2" | "3" | "4" | "5",
      },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // 4. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `reviews:${appliedFilters.productId.value || "all"}:${appliedFilters.userId.value || "all"}:${appliedFilters.isHidden.value || "all"}:${appliedFilters.rating.value || "all"}:${pagination.page.value}:${pagination.pageSize.value}`,
    () => reviewApi.searchReviews({
      productId: appliedFilters.productId.value || undefined,
      userId: appliedFilters.userId.value || undefined,
      isHidden: appliedFilters.isHidden.value ? appliedFilters.isHidden.value === "true" : undefined,
      rating: appliedFilters.rating.value ? Number(appliedFilters.rating.value) : undefined,
      page: pagination.page.value,
      size: Number(pagination.pageSize.value),
    }),
  );

  // 5. Computed derivations
  const reviews = computed(() => data.value?.items ?? []);
  const totalReviews = computed(() => data.value?.totalCount ?? 0);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The review list is not available right now."));

  // Wire totalItems to fetched data
  watch(() => data.value?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const ratingOptions = [
    { label: "All ratings", value: "" },
    { label: "1 star", value: "1" },
    { label: "2 stars", value: "2" },
    { label: "3 stars", value: "3" },
    { label: "4 stars", value: "4" },
    { label: "5 stars", value: "5" },
  ];

  const hiddenStatusOptions = [
    { label: "All statuses", value: "" },
    { label: "Published", value: "false" },
    { label: "Hidden", value: "true" },
  ];

  const summaryStats = computed(() => [
    {
      label: "Reviews",
      value: `${totalReviews.value}`,
      detail: "Reviews matching the current admin search.",
    },
    {
      label: "Published",
      value: `${reviews.value.filter((review) => review.status === "Published").length}`,
      detail: "Published reviews visible on the storefront.",
    },
    {
      label: "Hidden",
      value: `${reviews.value.filter((review) => review.status === "Hidden").length}`,
      detail: "Reviews hidden from the storefront by admin.",
    },
  ]);

  // 6. Return statement
  return {
    applyFilters,
    clearFilters,
    error,
    hasActiveFilters,
    hiddenStatusOptions,
    loadErrorMessage,
    localFilters,
    pending,
    ratingOptions,
    refresh,
    reviews,
    summaryStats,
    totalReviews,
    ...pagination,
  };
};

export type ReviewIndexPageState = Awaited<ReturnType<typeof useReviewIndexPage>>;
