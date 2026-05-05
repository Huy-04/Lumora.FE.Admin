export interface RequestPasswordResetRequest {
  email: string;
}

export interface VerifyPasswordResetOtpRequest {
  email: string;
  resetCode: string;
}

export interface VerifyPasswordResetOtpResponse {
  resetToken: string;
}

export interface CompletePasswordResetRequest {
  resetToken: string;
  newPassword: string;
}
