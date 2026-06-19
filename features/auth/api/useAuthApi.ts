import type {
  CompletePasswordResetRequest,
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RequestPasswordResetRequest,
  VerifyPasswordResetOtpRequest,
  VerifyPasswordResetOtpResponse,
} from "~/features/auth/types";
import type {
  RegisterRequest,
  RegisterResponse,
  ResendRegistrationOtpRequest,
  VerifyRegistrationRequest,
} from "~/features/auth/types/registration";

const authRoute = (path = "") => `/Authentication${path}`;

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
