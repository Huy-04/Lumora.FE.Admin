import type { CouponResponse, UpdateCouponRequest } from "~/features/coupons/types/coupons";
import { getCouponFieldErrors } from "~/features/coupons/utils/problemMapping";
import { hasAtMostDecimalPlaces, isAtLeastHoursApart, toDateTimeLocalValue, toUtcIsoFromDateTimeLocal } from "~/features/coupons/utils/dateTime";

export const useCouponDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const couponApi = useCouponsAdminApi();
  const authz = useAdminAuthorization();

  type CouponTab = "overview" | "edit";

  const couponId = computed(() => String(route.params.id ?? ""));
  const actionPending = ref("");
  const actionError = ref("");
  const editErrors = ref<Record<string, string>>({});
  const activeTab = ref<CouponTab>("overview");
  // 2. Permissions
  const canModifyCoupon = computed(() => authz.can(ADMIN_PERMISSION.couponModifyAll));

  // 3. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `coupon-detail:${couponId.value}`,
    () => couponApi.getCouponById(couponId.value),
  );

  // 4. Computed derivations
  const coupon = computed<CouponResponse | null>(() => data.value ?? null);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This coupon is not available right now."));
  const isNotFound = computed(() => getProblemStatus(error.value) === 404);

  const couponTabs = computed<Array<{ label: string; value: CouponTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Edit", value: "edit" },
  ]);

  const normalizeTab = (value: unknown): CouponTab => {
    const resolved = value === "edit" ? "edit" : "overview";
    return couponTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  // 5. Watchers (if any)
  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
    { immediate: true },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  // 6. Actions/mutations
  const selectTab = async (tab: CouponTab) => {
    const nextTab = normalizeTab(tab);
    activeTab.value = nextTab;
    await navigateTo(
      {
        path: `/coupons/${couponId.value}`,
        query: nextTab === "overview" ? {} : { tab: nextTab },
      },
      { replace: true },
    );
  };

  // Edit form pre-populated with UpdateCouponRequest fields
  const editForm = reactive<UpdateCouponRequest>({
    code: "",
    percent: 0,
    maxDiscountAmount: 0,
    maxRedemptions: 0,
    startsAt: "",
    expiresAt: "",
  });

  const populateEditForm = (source: CouponResponse | null) => {
    if (!source) return;
    editForm.code = source.code;
    editForm.percent = source.percent;
    editForm.maxDiscountAmount = source.maxDiscountAmount;
    editForm.maxRedemptions = source.maxRedemptions;
    editForm.startsAt = toDateTimeLocalValue(source.startsAt);
    editForm.expiresAt = toDateTimeLocalValue(source.expiresAt);
  };

  // Populate form when data is available
  watch(coupon, (value) => populateEditForm(value), { immediate: true });

  const validateEditForm = (): Record<string, string> => {
    const result: Record<string, string> = {};

    if (!editForm.code.trim()) {
      result.code = "Code is required.";
    } else if (editForm.code !== editForm.code.trim()) {
      result.code = "Code must not include leading or trailing whitespace.";
    } else if (!/^[A-Za-z0-9-]+$/.test(editForm.code)) {
      result.code = "Code may contain only letters, numbers, and dashes.";
    }

    if (editForm.percent <= 0 || editForm.percent > 100) {
      result.percent = "Percent must be between 0 (exclusive) and 100.";
    } else if (!hasAtMostDecimalPlaces(editForm.percent, 2)) {
      result.percent = "Percent supports at most 2 decimal places.";
    }

    if (editForm.maxDiscountAmount <= 0) {
      result.maxDiscountAmount = "Max discount must be positive.";
    } else if (!hasAtMostDecimalPlaces(editForm.maxDiscountAmount, 2)) {
      result.maxDiscountAmount = "Max discount supports at most 2 decimal places.";
    }

    if (!Number.isInteger(editForm.maxRedemptions) || editForm.maxRedemptions <= 0) {
      result.maxRedemptions = "Max redemptions must be a positive integer.";
    } else if (coupon.value && editForm.maxRedemptions < coupon.value.usedCount) {
      result.maxRedemptions = "Max redemptions cannot be lower than used count.";
    }

    if (!editForm.startsAt) {
      result.startsAt = "Start date is required.";
    }

    if (!editForm.expiresAt) {
      result.expiresAt = "Expiry date is required.";
    }

    if (editForm.startsAt && editForm.expiresAt && new Date(editForm.expiresAt) <= new Date(editForm.startsAt)) {
      result.expiresAt = "Expiry must be after start date.";
    } else if (editForm.startsAt && editForm.expiresAt && !isAtLeastHoursApart(editForm.startsAt, editForm.expiresAt, 1)) {
      result.expiresAt = "Expiry must be at least 1 hour after start date.";
    }

    return result;
  };

  const updateCoupon = async () => {
    if (!coupon.value || !canModifyCoupon.value) return;

    editErrors.value = validateEditForm();
    if (Object.keys(editErrors.value).length > 0) return;

    actionPending.value = "update";
    actionError.value = "";

    try {
      const payload: UpdateCouponRequest = {
        code: editForm.code,
        percent: editForm.percent,
        maxDiscountAmount: editForm.maxDiscountAmount,
        maxRedemptions: editForm.maxRedemptions,
        startsAt: toUtcIsoFromDateTimeLocal(editForm.startsAt),
        expiresAt: toUtcIsoFromDateTimeLocal(editForm.expiresAt),
      };

      data.value = await couponApi.updateCoupon(couponId.value, payload);
      await refresh();
    } catch (requestError) {
      const fieldErrors = getCouponFieldErrors(requestError);
      const status = getProblemStatus(requestError);

      if (Object.keys(fieldErrors).length > 0) {
        editErrors.value = fieldErrors;
      } else if (status === 404) {
        actionError.value = "Coupon not found.";
      } else if (status === 409) {
        actionError.value = "A coupon with this code already exists.";
      } else {
        actionError.value = getProblemMessage(requestError, "We couldn't update this coupon right now. Please try again.");
      }
    } finally {
      actionPending.value = "";
    }
  };

  const activateCoupon = async () => {
    if (!coupon.value || !canModifyCoupon.value) return;

    actionPending.value = "activate";
    actionError.value = "";

    try {
      data.value = await couponApi.activateCoupon(couponId.value);
      await refresh();
    } catch (requestError) {
      const status = getProblemStatus(requestError);
      if (status === 404) {
        actionError.value = "Coupon not found.";
      } else {
        actionError.value = getProblemMessage(requestError, "Unable to update coupon status.");
      }
    } finally {
      actionPending.value = "";
    }
  };

  const deactivateCoupon = async () => {
    if (!coupon.value || !canModifyCoupon.value) return;

    actionPending.value = "deactivate";
    actionError.value = "";

    try {
      data.value = await couponApi.deactivateCoupon(couponId.value);
      await refresh();
    } catch (requestError) {
      const status = getProblemStatus(requestError);
      if (status === 404) {
        actionError.value = "Coupon not found.";
      } else {
        actionError.value = getProblemMessage(requestError, "Unable to update coupon status.");
      }
    } finally {
      actionPending.value = "";
    }
  };

  // 7. Return statement
  return {
    actionError,
    actionPending,
    activeTab,
    canModifyCoupon,
    coupon,
    couponId,
    couponTabs,
    data,
    editForm,
    editErrors,
    error,
    isNotFound,
    loadErrorMessage,
    pending,
    refresh,
    selectTab,
    activateCoupon,
    deactivateCoupon,
    updateCoupon,
  };
};

export type CouponDetailPageState = Awaited<ReturnType<typeof useCouponDetailPage>>;
