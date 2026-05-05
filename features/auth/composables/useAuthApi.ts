import type {
  ChangePasswordRequest,
  CompletePasswordResetRequest,
  ConfirmEmailChangeRequest,
  ConfirmPhoneChangeRequest,
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RequestEmailChangeRequest,
  RequestPhoneChangeRequest,
  RequestPasswordResetRequest,
  UpdateProfileRequest,
  VerifyPasswordResetOtpRequest,
  VerifyPasswordResetOtpResponse,
  VerifyEmailOtpRequest,
  VerifyPhoneOtpRequest,
} from "~/features/auth/types";
import type { UserResponse } from "~/features/users/types";

export const useAuthApi = () => {
  const api = useApiClient();

  return {
    adminLogin: (payload: LoginRequest, headers: Record<string, string>) =>
      api.request<LoginResponse>("/Authentication/admin-login", {
        method: "POST",
        body: payload,
        headers,
      }),

    login: (payload: LoginRequest, headers: Record<string, string>) =>
      api.request<LoginResponse>("/Authentication/login", {
        method: "POST",
        body: payload,
        headers,
      }),

    logout: (deviceId: string) =>
      api.request<void>("/Authentication/logout", {
        method: "POST",
        headers: {
          "X-Device-Id": deviceId,
        },
      }),

    refreshAccessToken: (deviceId: string) =>
      api.request<LoginResponse>("/Authentication/refresh-access-token", {
        method: "POST",
        headers: {
          "X-Device-Id": deviceId,
        },
      }),

    register: (payload: RegisterRequest) =>
      api.request<RegisterResponse>("/Authentication/register", {
        method: "POST",
        body: payload,
      }),

    getMe: (options?: { skipAuthRefresh?: boolean }) =>
      api.request<CurrentUserResponse>("/Authentication/me", options),

    verifyEmailOtp: (payload: VerifyEmailOtpRequest) =>
      api.request<void>("/Users/current/email-verification/verify", {
        method: "POST",
        body: payload,
      }),

    resendEmailOtp: () =>
      api.request<void>("/Users/current/email-verification/resend", {
        method: "POST",
      }),

    verifyPhoneOtp: (payload: VerifyPhoneOtpRequest) =>
      api.request<void>("/Users/current/phone-verification/verify", {
        method: "POST",
        body: payload,
      }),

    resendPhoneOtp: () =>
      api.request<void>("/Users/current/phone-verification/resend", {
        method: "POST",
      }),

    requestPasswordReset: (payload: RequestPasswordResetRequest) =>
      api.request<void>("/Authentication/request-password-reset", {
        method: "POST",
        body: payload,
      }),

    verifyPasswordResetOtp: (payload: VerifyPasswordResetOtpRequest) =>
      api.request<VerifyPasswordResetOtpResponse>("/Authentication/verify-password-reset-otp", {
        method: "POST",
        body: payload,
      }),

    completePasswordReset: (payload: CompletePasswordResetRequest) =>
      api.request<void>("/Authentication/complete-password-reset", {
        method: "POST",
        body: payload,
      }),

    getCurrentUser: () => api.request<UserResponse>("/Users/current"),

    updateProfile: (payload: UpdateProfileRequest) =>
      api.request<UserResponse>("/Users/current/profile", {
        method: "PUT",
        body: payload,
      }),

    changePassword: (payload: ChangePasswordRequest) =>
      api.request<void>("/Users/current/change-password", {
        method: "POST",
        body: payload,
      }),

    requestCurrentEmailVerification: () =>
      api.request<void>("/Users/current/email-change/request-current-verification", {
        method: "POST",
      }),

    confirmCurrentEmailVerification: (payload: ConfirmEmailChangeRequest) =>
      api.request<void>("/Users/current/email-change/confirm-current-verification", {
        method: "POST",
        body: payload,
      }),

    requestNewEmailVerification: (payload: RequestEmailChangeRequest) =>
      api.request<void>("/Users/current/email-change/request-new-verification", {
        method: "POST",
        body: payload,
      }),

    completeEmailChange: (payload: ConfirmEmailChangeRequest) =>
      api.request<void>("/Users/current/email-change/confirm", {
        method: "POST",
        body: payload,
      }),

    requestCurrentPhoneVerification: () =>
      api.request<void>("/Users/current/phone-change/request-current-verification", {
        method: "POST",
      }),

    confirmCurrentPhoneVerification: (payload: ConfirmPhoneChangeRequest) =>
      api.request<void>("/Users/current/phone-change/confirm-current-verification", {
        method: "POST",
        body: payload,
      }),

    requestNewPhoneVerification: (payload: RequestPhoneChangeRequest) =>
      api.request<void>("/Users/current/phone-change/request-new-verification", {
        method: "POST",
        body: payload,
      }),

    completePhoneChange: (payload: ConfirmPhoneChangeRequest) =>
      api.request<void>("/Users/current/phone-change/confirm", {
        method: "POST",
        body: payload,
      }),
  };
};
