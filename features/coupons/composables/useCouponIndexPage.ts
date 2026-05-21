import type { CouponResponse } from "~/features/coupons/types";
import { toUtcDateFilter } from "~/features/coupons/utils/dateTime";

export const useCouponIndexPage = async () => {
  // 1. Dependency injection
  const couponApi = useCouponsAdminApi();

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      {
        keyword: "",
        isActive: "",
        startsFrom: "",
        expiresTo: "",
        sortBy: "",
        sortDirection: "",
      },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `coupons:${appliedFilters.keyword.value || "all"}:${appliedFilters.isActive.value || "all"}:${appliedFilters.startsFrom.value || "all"}:${appliedFilters.expiresTo.value || "all"}:${appliedFilters.sortBy.value || "all"}:${appliedFilters.sortDirection.value || "all"}:${pagination.page.value}:${pagination.pageSize.value}`,
    async () => {
      return await couponApi.searchCoupons({
        keyword: appliedFilters.keyword.value || undefined,
        isActive: appliedFilters.isActive.value || undefined,
        startsFrom: toUtcDateFilter(appliedFilters.startsFrom.value, "start"),
        expiresTo: toUtcDateFilter(appliedFilters.expiresTo.value, "end"),
        sortBy: appliedFilters.sortBy.value || undefined,
        sortDirection: appliedFilters.sortDirection.value || undefined,
        page: pagination.page.value,
        size: Number(pagination.pageSize.value),
      });
    },
  );

  // 6. Computed derivations
  const items = computed<CouponResponse[]>(() => data.value?.items ?? []);
  const totalCoupons = computed(() => data.value?.totalCount ?? 0);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "Coupons could not be loaded."));

  // Wire totalItems to fetched data
  watch(() => data.value?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  // 9. Return statement
  return {
    items,
    totalItems: totalCoupons,
    pending,
    error,
    loadErrorMessage,
    refresh,
    localFilters,
    appliedFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    ...pagination,
  };
};

export type CouponIndexPageState = Awaited<ReturnType<typeof useCouponIndexPage>>;
