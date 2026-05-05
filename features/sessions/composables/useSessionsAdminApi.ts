import type {
  RevokeRefreshTokenRequest,
  RevokeUserDeviceRequest,
  SessionResponse,
} from "~/features/sessions/types";

export const useSessionsAdminApi = () => {
  const api = useApiClient();

  return {
    getSessions: () => api.request<SessionResponse[]>("/refresh-tokens"),

    getSessionsByUserId: (id: string) => api.request<SessionResponse[]>(`/refresh-tokens/user/${id}`),

    revokeRefreshToken: (payload: RevokeRefreshTokenRequest) =>
      api.request<void>("/refresh-tokens/revoke", {
        method: "POST",
        body: payload,
      }),

    revokeAllUserTokens: (id: string) =>
      api.request<void>(`/refresh-tokens/revoke-all/user/${id}`, {
        method: "POST",
      }),

    revokeUserDevice: (payload: RevokeUserDeviceRequest) =>
      api.request<void>(
        `/refresh-tokens/users/${payload.userId}/devices/${encodeURIComponent(payload.deviceId)}/revoke`,
        {
          method: "POST",
        }),
  };
};
