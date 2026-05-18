import type { PaginatedResponse } from "~/Shared/types/api";
import type { CouponResponse, CreateCouponRequest, UpdateCouponRequest } from "~/features/coupons/types";

const couponRoute = (path = "") => `/Coupons${path}`;

export const useCouponsAdminApi = () => {
  const api = useApiClient();

  return {
    getCouponById: (id: string) =>
      api.request<CouponResponse>(couponRoute(`/${id}`)),

    searchCoupons: (params: Record<string, string | number | boolean | undefined | null>) =>
      api.request<PaginatedResponse<CouponResponse>>(
        `${couponRoute("/search")}${toSearchParams(params)}`,
      ),

    createCoupon: (payload: CreateCouponRequest) =>
      api.request<CouponResponse>(couponRoute(), {
        method: "POST",
        body: payload,
      }),

    updateCoupon: (id: string, payload: UpdateCouponRequest) =>
      api.request<CouponResponse>(couponRoute(`/${id}`), {
        method: "PUT",
        body: payload,
      }),

    activateCoupon: (id: string) =>
      api.request<CouponResponse>(couponRoute(`/${id}/activate`), {
        method: "POST",
      }),

    deactivateCoupon: (id: string) =>
      api.request<CouponResponse>(couponRoute(`/${id}/deactivate`), {
        method: "POST",
      }),

    deleteCoupon: (id: string) =>
      api.request<void>(couponRoute(`/${id}`), {
        method: "DELETE",
      }),
  };
};
