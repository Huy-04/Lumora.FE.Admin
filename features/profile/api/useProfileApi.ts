import type {
  ChangePasswordRequest,
  ConfirmEmailChangeRequest,
  ConfirmPhoneChangeRequest,
  RequestEmailChangeRequest,
  RequestPhoneChangeRequest,
  UpdateProfileRequest,
  VerifyEmailOtpRequest,
  VerifyPhoneOtpRequest,
} from "~/features/profile/types/profile";
import type { UserAddressRequest, UserAddressResponse, UserResponse } from "~/features/users/types/users";

const userCurrentRoute = (path = "") => `/Users/current${path}`;
const userCurrentAddressRoute = (addressId: string, path = "") => `/Users/current/addresses/${encodeURIComponent(addressId)}${path}`;

export const useProfileApi = () => {
  const api = useApiClient();

  return {
    verifyEmailOtp: (payload: VerifyEmailOtpRequest) =>
      api.request<void>(userCurrentRoute("/email-verification/verify"), {
        method: "POST",
        body: payload,
      }),

    resendEmailOtp: () =>
      api.request<void>(userCurrentRoute("/email-verification/resend"), {
        method: "POST",
      }),

    verifyPhoneOtp: (payload: VerifyPhoneOtpRequest) =>
      api.request<void>(userCurrentRoute("/phone-verification/verify"), {
        method: "POST",
        body: payload,
      }),

    resendPhoneOtp: () =>
      api.request<void>(userCurrentRoute("/phone-verification/resend"), {
        method: "POST",
      }),

    getCurrentUser: () => api.request<UserResponse>(userCurrentRoute()),

    updateProfile: (payload: UpdateProfileRequest) =>
      api.request<UserResponse>(userCurrentRoute("/profile"), {
        method: "PUT",
        body: payload,
      }),

    changePassword: (payload: ChangePasswordRequest) =>
      api.request<void>(userCurrentRoute("/change-password"), {
        method: "POST",
        body: payload,
      }),

    requestCurrentEmailVerification: () =>
      api.request<void>(userCurrentRoute("/email-change/request-current-verification"), {
        method: "POST",
      }),

    resendCurrentEmailVerification: () =>
      api.request<void>(userCurrentRoute("/email-change/resend-current-verification"), {
        method: "POST",
      }),

    confirmCurrentEmailVerification: (payload: ConfirmEmailChangeRequest) =>
      api.request<void>(userCurrentRoute("/email-change/confirm-current-verification"), {
        method: "POST",
        body: payload,
      }),

    requestNewEmailVerification: (payload: RequestEmailChangeRequest) =>
      api.request<void>(userCurrentRoute("/email-change/request-new-verification"), {
        method: "POST",
        body: payload,
      }),

    resendNewEmailVerification: () =>
      api.request<void>(userCurrentRoute("/email-change/resend-new-verification"), {
        method: "POST",
      }),

    completeEmailChange: (payload: ConfirmEmailChangeRequest) =>
      api.request<void>(userCurrentRoute("/email-change/confirm"), {
        method: "POST",
        body: payload,
      }),

    requestCurrentPhoneVerification: () =>
      api.request<void>(userCurrentRoute("/phone-change/request-current-verification"), {
        method: "POST",
      }),

    resendCurrentPhoneVerification: () =>
      api.request<void>(userCurrentRoute("/phone-change/resend-current-verification"), {
        method: "POST",
      }),

    confirmCurrentPhoneVerification: (payload: ConfirmPhoneChangeRequest) =>
      api.request<void>(userCurrentRoute("/phone-change/confirm-current-verification"), {
        method: "POST",
        body: payload,
      }),

    requestNewPhoneVerification: (payload: RequestPhoneChangeRequest) =>
      api.request<void>(userCurrentRoute("/phone-change/request-new-verification"), {
        method: "POST",
        body: payload,
      }),

    resendNewPhoneVerification: () =>
      api.request<void>(userCurrentRoute("/phone-change/resend-new-verification"), {
        method: "POST",
      }),

    completePhoneChange: (payload: ConfirmPhoneChangeRequest) =>
      api.request<void>(userCurrentRoute("/phone-change/confirm"), {
        method: "POST",
        body: payload,
      }),

    getCurrentUserAddresses: () => api.request<UserAddressResponse[]>(userCurrentRoute("/addresses")),

    addCurrentUserAddress: (payload: UserAddressRequest) =>
      api.request<UserAddressResponse>(userCurrentRoute("/addresses"), {
        method: "POST",
        body: payload,
      }),

    updateCurrentUserAddress: (addressId: string, payload: UserAddressRequest) =>
      api.request<void>(userCurrentAddressRoute(addressId), {
        method: "PUT",
        body: payload,
      }),

    deleteCurrentUserAddress: (addressId: string) =>
      api.request<void>(userCurrentAddressRoute(addressId), {
        method: "DELETE",
      }),
  };
};
