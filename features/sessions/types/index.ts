export interface SessionResponse {
  id: string;
  userId: string;
  fullName?: string | null;
  userName?: string | null;
  email?: string | null;
  deviceId: string;
  deviceName?: string | null;
  ipAddress: string;
  issuedAt: string;
  expiresAt: string;
  tokenStatus: string;
}

export interface RevokeRefreshTokenRequest {
  refreshToken: string;
}

export interface RevokeUserDeviceRequest {
  userId: string;
  deviceId: string;
}
