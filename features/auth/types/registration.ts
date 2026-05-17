export interface RegisterRequest {
  email: string;
  phone: string;
  phoneRegion: string;
  fullName: string;
  userName: string;
  password: string;
  gender?: string | null;
  img?: string | null;
}

export interface RegisterResponse {
  status: "PendingVerification" | "Completed";
  registrationToken: string | null;
  id: string | null;
  email: string | null;
  userName: string | null;
  fullName: string | null;
  createdAt: string | null;
}

export interface ResendRegistrationOtpRequest {
  registrationToken: string;
}

export interface VerifyRegistrationRequest {
  registrationToken: string;
  otp: string;
}
