import type {
  RevokeRefreshTokenRequest,
  RevokeUserDeviceRequest,
  SessionResponse,
} from "~/features/sessions/types";

const sessionRoute = (path = "") => `/refresh-tokens${path}`;

export const useSessionsAdminApi = () => {
  const api = useApiClient();

  return {
    getSessions: () => api.request<SessionResponse[]>(sessionRoute()),

    getSessionsByUserId: (id: string) => api.request<SessionResponse[]>(sessionRoute(`/user/${id}`)),

    /**
     * Revokes a specific refresh token by its raw value.
     *
     * Only usable when the caller possesses the raw refresh token
     * (e.g., revoking your own session). This is NOT suitable for the
     * session list UI because session list entries do not expose raw tokens.
     *
     * For revoking sessions from the session list UI, use {@link revokeUserDevice}
     * which accepts `userId` + `deviceId` available from {@link SessionResponse}.
     */
    revokeRefreshToken: (payload: RevokeRefreshTokenRequest) =>
      api.request<void>(sessionRoute("/revoke"), {
        method: "POST",
        body: payload,
      }),

    revokeAllUserTokens: (id: string) =>
      api.request<void>(sessionRoute(`/revoke-all/user/${id}`), {
        method: "POST",
      }),

    revokeUserDevice: (payload: RevokeUserDeviceRequest) =>
      api.request<void>(
        sessionRoute(`/users/${payload.userId}/devices/${encodeURIComponent(payload.deviceId)}/revoke`),
        {
          method: "POST",
        }),

    /**
     * Force-logs out a user by revoking all their sessions AND blacklisting
     * their current access token, ensuring immediate invalidation.
     */
    forceLogoutUser: (userId: string) =>
      api.request<void>(`/Users/${userId}/force-logout`, {
        method: "POST",
      }),
  };
};
