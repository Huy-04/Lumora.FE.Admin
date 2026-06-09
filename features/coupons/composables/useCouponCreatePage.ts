import { getProblemMessage, getProblemStatus } from "~/Shared/api/apiErrors";
import type { CreateCouponRequest } from "~/features/coupons/types";
import { getCouponFieldErrors } from "~/features/coupons/utils/problemMapping";
import { hasAtMostDecimalPlaces, isAtLeastHoursApart, toUtcIsoFromDateTimeLocal } from "~/features/coupons/utils/dateTime";

export const useCouponCreatePage = async () => {
  // 1. Dependency injection
  const { createCoupon } = useCouponsAdminApi();

  // 2. Form state
  const form = reactive<CreateCouponRequest>({
    code: "",
    percent: 0,
    maxDiscountAmount: 0,
    maxRedemptions: 0,
    startsAt: "",
    expiresAt: "",
    isActive: true,
  });

  // 3. Submission state
  const errors = ref<Record<string, string>>({});
  const errorMessage = ref("");
  const pending = ref(false);

  // 4. Computed / derived state

  // 5. Actions
  const validate = (): Record<string, string> => {
    const result: Record<string, string> = {};

    if (!form.code.trim()) {
      result.code = "Code is required.";
    } else if (form.code !== form.code.trim()) {
      result.code = "Code must not include leading or trailing whitespace.";
    } else if (!/^[A-Za-z0-9-]+$/.test(form.code)) {
      result.code = "Code may contain only letters, numbers, and dashes.";
    }

    if (form.percent <= 0 || form.percent > 100) {
      result.percent = "Percent must be between 0 (exclusive) and 100.";
    } else if (!hasAtMostDecimalPlaces(form.percent, 2)) {
      result.percent = "Percent supports at most 2 decimal places.";
    }

    if (form.maxDiscountAmount <= 0) {
      result.maxDiscountAmount = "Max discount must be positive.";
    } else if (!hasAtMostDecimalPlaces(form.maxDiscountAmount, 2)) {
      result.maxDiscountAmount = "Max discount supports at most 2 decimal places.";
    }

    if (!Number.isInteger(form.maxRedemptions) || form.maxRedemptions <= 0) {
      result.maxRedemptions = "Max redemptions must be a positive integer.";
    }

    if (!form.startsAt) {
      result.startsAt = "Start date is required.";
    }

    if (!form.expiresAt) {
      result.expiresAt = "Expiry date is required.";
    }

    if (form.startsAt && form.expiresAt && new Date(form.expiresAt) <= new Date(form.startsAt)) {
      result.expiresAt = "Expiry must be after start date.";
    } else if (form.startsAt && form.expiresAt && !isAtLeastHoursApart(form.startsAt, form.expiresAt, 1)) {
      result.expiresAt = "Expiry must be at least 1 hour after start date.";
    }

    return result;
  };

  const submit = async () => {
    errors.value = validate();

    if (Object.keys(errors.value).length > 0) {
      return;
    }

    pending.value = true;
    errorMessage.value = "";

    try {
      const created = await createCoupon({
        code: form.code,
        percent: form.percent,
        maxDiscountAmount: form.maxDiscountAmount,
        maxRedemptions: form.maxRedemptions,
        startsAt: toUtcIsoFromDateTimeLocal(form.startsAt),
        expiresAt: toUtcIsoFromDateTimeLocal(form.expiresAt),
        isActive: form.isActive,
      });

      await navigateTo(`/coupons/${created.id}`);
    } catch (requestError) {
      const fieldErrors = getCouponFieldErrors(requestError);
      const status = getProblemStatus(requestError);

      if (Object.keys(fieldErrors).length > 0) {
        errors.value = fieldErrors;
      } else if (status === 409) {
        errorMessage.value = "A coupon with this code already exists.";
      } else {
        errorMessage.value = getProblemMessage(requestError, "We couldn't create the coupon right now. Please try again.");
      }
    } finally {
      pending.value = false;
    }
  };

  // 6. Return statement
  return {
    form,
    errors,
    errorMessage,
    pending,
    submit,
  };
};

export type CouponCreatePage = Awaited<ReturnType<typeof useCouponCreatePage>>;
