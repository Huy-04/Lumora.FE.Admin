import type { CouponResponse } from "~/features/coupons/types";
import { toUtcDateFilter } from "~/features/coupons/utils/dateTime";

export const useCouponIndexPage = async () => {
  // 1. Dependency injection
  const couponApi = useCouponsAdminApi();
  const authz = useAdminAuthorization();

  // 2. Permissions
  const canRemoveCoupon = computed(() => authz.can(ADMIN_PERMISSION.couponModifyAll));

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

  // 7. Actions/mutations
  const confirmCouponId = ref("");
  const actionPending = ref<"" | "remove">("");
  const actionTargetId = ref("");
  const actionError = ref("");

  const confirmCoupon = computed(() => items.value.find((coupon) => coupon.id === confirmCouponId.value) ?? null);
  const confirmTitle = computed(() => confirmCoupon.value ? `Remove ${confirmCoupon.value.code}?` : "");
  const confirmDetail = computed(() =>
    confirmCoupon.value?.usedCount
      ? "Used coupons cannot be removed. Deactivate the coupon instead."
      : "This coupon will be permanently removed.",
  );

  const requestRemove = (couponId: string) => {
    if (!canRemoveCoupon.value) return;
    confirmCouponId.value = couponId;
    actionError.value = "";
  };

  const cancelRemove = () => {
    confirmCouponId.value = "";
  };

  const removeCoupon = async () => {
    if (!confirmCouponId.value || !canRemoveCoupon.value) return;

    if (confirmCoupon.value?.usedCount) {
      actionError.value = "Cannot delete a coupon that has been used. Deactivate it instead.";
      confirmCouponId.value = "";
      return;
    }

    actionPending.value = "remove";
    actionTargetId.value = confirmCouponId.value;
    actionError.value = "";

    try {
      await couponApi.deleteCoupon(confirmCouponId.value);
      confirmCouponId.value = "";
      await refresh();
    } catch (requestError) {
      const status = getProblemStatus(requestError);
      if (status === 404) {
        actionError.value = "Coupon not found.";
      } else if (status === 409) {
        actionError.value = "Cannot delete a coupon that has been used. Deactivate it instead.";
      } else {
        actionError.value = getProblemMessage(requestError, "Unable to delete coupon.");
      }
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  // Wire totalItems to fetched data
  watch(() => data.value?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  // 9. Return statement
  return {
    actionError,
    actionPending,
    actionTargetId,
    items,
    totalItems: totalCoupons,
    pending,
    error,
    loadErrorMessage,
    refresh,
    canRemoveCoupon,
    cancelRemove,
    confirmCoupon,
    confirmDetail,
    confirmTitle,
    localFilters,
    appliedFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    removeCoupon,
    requestRemove,
    ...pagination,
  };
};

export type CouponIndexPageState = Awaited<ReturnType<typeof useCouponIndexPage>>;
