import { toSearchParams } from "~/Shared/api/queryParams";
import type { PaginatedResponse } from "~/Shared/types/api";
import type { PasswordRequest } from "~/features/auth/types";
import type {
  AddRoleRequest,
  CreateUserRequest,
  SyncUserRolesRequest,
  UpdateUserRequest,
  UserAddressRequest,
  UserAddressResponse,
  UserResponse,
  UserRoleResponse,
} from "~/features/users/types";

export const useUsersAdminApi = () => {
  const api = useApiClient();

  return {
    getUsers: (page = 1, size = 20) =>
      api.request<PaginatedResponse<UserResponse>>(`/Users${toSearchParams({ page, size })}`),

    searchUsers: (params: Record<string, string | number | undefined | null>) =>
      api.request<PaginatedResponse<UserResponse>>(`/Users/search${toSearchParams(params)}`),

    getUserById: (id: string) => api.request<UserResponse>(`/Users/${id}`),

    getUserRoles: (id: string) => api.request<UserRoleResponse[]>(`/Users/${id}/roles`),

    getUserAddresses: (id: string) => api.request<UserAddressResponse[]>(`/Users/${id}/addresses`),

    createUser: (payload: CreateUserRequest) =>
      api.request<UserResponse>("/Users", {
        method: "POST",
        body: payload,
      }),

    updateUser: (id: string, payload: UpdateUserRequest) =>
      api.request<UserResponse>(`/Users/${id}`, {
        method: "PUT",
        body: payload,
      }),

    deleteUser: (id: string) =>
      api.request<void>(`/Users/${id}`, {
        method: "DELETE",
      }),

    adminSetPassword: (id: string, payload: PasswordRequest) =>
      api.request<void>(`/Users/${id}/admin-set-password`, {
        method: "POST",
        body: payload,
      }),

    forceLogoutUser: (id: string) =>
      api.request<void>(`/Users/${id}/force-logout`, {
        method: "POST",
      }),

    addRoleToUser: (id: string, payload: AddRoleRequest) =>
      api.request<UserRoleResponse>(`/Users/${id}/roles`, {
        method: "POST",
        body: payload,
      }),

    removeRoleFromUser: (id: string, userRoleId: string) =>
      api.request<void>(`/Users/${id}/roles/${userRoleId}`, {
        method: "DELETE",
      }),

    syncUserRoles: (id: string, payload: SyncUserRolesRequest) =>
      api.request<UserRoleResponse[]>(`/Users/${id}/roles/sync`, {
        method: "POST",
        body: payload,
      }),

    addAddressToUser: (id: string, payload: UserAddressRequest) =>
      api.request<UserAddressResponse>(`/Users/${id}/addresses`, {
        method: "POST",
        body: payload,
      }),

    updateUserAddress: (id: string, addressId: string, payload: UserAddressRequest) =>
      api.request<UserAddressResponse>(`/Users/${id}/addresses/${addressId}`, {
        method: "PUT",
        body: payload,
      }),

    deleteUserAddress: (id: string, addressId: string) =>
      api.request<void>(`/Users/${id}/addresses/${addressId}`, {
        method: "DELETE",
      }),
  };
};
