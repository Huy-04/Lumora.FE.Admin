export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordRequest {
  password: string;
}

export interface VerifyEmailOtpRequest {
  otp: string;
}

export interface VerifyPhoneOtpRequest {
  otp: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  userName: string;
  gender: string;
  img: string;
}

export interface RequestEmailChangeRequest {
  newEmail: string;
}

export interface ConfirmEmailChangeRequest {
  token: string;
}

export interface RequestPhoneChangeRequest {
  newPhone: string;
  phoneRegion: string;
}

export interface ConfirmPhoneChangeRequest {
  token: string;
}
