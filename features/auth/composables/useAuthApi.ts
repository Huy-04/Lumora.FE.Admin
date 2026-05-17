import type {
  ChangePasswordRequest,
  CompletePasswordResetRequest,
  ConfirmEmailChangeRequest,
  ConfirmPhoneChangeRequest,
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RequestEmailChangeRequest,
  RequestPhoneChangeRequest,
  RequestPasswordResetRequest,
  UpdateProfileRequest,
  VerifyPasswordResetOtpRequest,
  VerifyPasswordResetOtpResponse,
  VerifyEmailOtpRequest,
  VerifyPhoneOtpRequest,
} from "~/features/auth/types";
import type {
  RegisterRequest,
  RegisterResponse,
  ResendRegistrationOtpRequest,
  VerifyRegistrationRequest,
} from "~/features/auth/types/registration";
import type { UserAddressRequest, UserAddressResponse, UserResponse } from "~/features/users/types";

const authRoute = (path = "") => `/Authentication${path}`;
const userCurrentRoute = (path = "") => `/Users/current${path}`;
const userCurrentAddressRoute = (addressId: string, path = "") => `/Users/current/addresses/${encodeURIComponent(addressId)}${path}`;

export const useAuthApi = () => {
  const api = useApiClient();

  return {
    adminLogin: (payload: LoginRequest, headers: Record<string, string>) =>
      api.request<LoginResponse>(authRoute("/admin-login"), {
        method: "POST",
        body: payload,
        headers,
      }),

    login: (payload: LoginRequest, headers: Record<string, string>) =>
      api.request<LoginResponse>(authRoute("/login"), {
        method: "POST",
        body: payload,
        headers,
      }),

    logout: (deviceId: string) =>
      api.request<void>(authRoute("/logout"), {
        method: "POST",
        headers: {
          "X-Device-Id": deviceId,
        },
      }),

    refreshAccessToken: (deviceId: string) =>
      api.request<LoginResponse>(authRoute("/refresh-access-token"), {
        method: "POST",
        skipAuthRefresh: true,
        headers: {
          "X-Device-Id": deviceId,
        },
      }),

    getMe: (options?: { skipAuthRefresh?: boolean }) =>
      api.request<CurrentUserResponse>(authRoute("/me"), options),

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

    requestPasswordReset: (payload: RequestPasswordResetRequest) =>
      api.request<void>(authRoute("/request-password-reset"), {
        method: "POST",
        body: payload,
      }),

    resendPasswordResetOtp: (payload: RequestPasswordResetRequest) =>
      api.request<void>(authRoute("/resend-password-reset-otp"), {
        method: "POST",
        body: payload,
      }),

    verifyPasswordResetOtp: (payload: VerifyPasswordResetOtpRequest) =>
      api.request<VerifyPasswordResetOtpResponse>(authRoute("/verify-password-reset-otp"), {
        method: "POST",
        body: payload,
      }),

    completePasswordReset: (payload: CompletePasswordResetRequest) =>
      api.request<void>(authRoute("/complete-password-reset"), {
        method: "POST",
        body: payload,
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

    startRegistration: (payload: RegisterRequest) =>
      api.request<RegisterResponse>(authRoute("/register/start"), {
        method: "POST",
        body: payload,
      }),

    resendRegistrationOtp: (payload: ResendRegistrationOtpRequest) =>
      api.request<RegisterResponse>(authRoute("/register/resend-otp"), {
        method: "POST",
        body: payload,
      }),

    verifyRegistration: (payload: VerifyRegistrationRequest) =>
      api.request<RegisterResponse>(authRoute("/register/verify"), {
        method: "POST",
        body: payload,
      }),
  };
};
