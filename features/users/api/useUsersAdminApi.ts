import type { PaginatedResponse } from "~/Shared/types/api";
import type { PasswordRequest } from "~/features/users/types/users";
import type {
  AddRoleRequest,
  CreateUserRequest,
  SyncUserRolesRequest,
  UpdateUserRequest,
  UserAddressRequest,
  UserAddressResponse,
  UserResponse,
  UserRoleResponse,
} from "~/features/users/types/users";

const userRoute = (path = "") => `/Users${path}`;
const userChildRoute = (userId: string, childPath = "") =>
  `/Users/${userId}${childPath}`;

export const useUsersAdminApi = () => {
  const api = useApiClient();

  return {
    getUsers: (page = 1, size = 20) =>
      api.request<PaginatedResponse<UserResponse>>(
        `${userRoute()}${toSearchParams({ page, size })}`,
      ),

    searchUsers: (params: Record<string, string | number | undefined | null>) =>
      api.request<PaginatedResponse<UserResponse>>(
        `${userRoute("/search")}${toSearchParams(params)}`,
      ),

    getUserById: (id: string) =>
      api.request<UserResponse>(userChildRoute(id)),

    getUserRoles: (id: string) =>
      api.request<UserRoleResponse[]>(userChildRoute(id, "/roles")),

    getUserAddresses: (id: string) =>
      api.request<UserAddressResponse[]>(userChildRoute(id, "/addresses")),

    createUser: (payload: CreateUserRequest) =>
      api.request<UserResponse>(userRoute(), {
        method: "POST",
        body: payload,
      }),

    updateUser: (id: string, payload: UpdateUserRequest) =>
      api.request<UserResponse>(userChildRoute(id), {
        method: "PUT",
        body: payload,
      }),

    deleteUser: (id: string) =>
      api.request<void>(userChildRoute(id), {
        method: "DELETE",
      }),

    adminSetPassword: (id: string, payload: PasswordRequest) =>
      api.request<void>(userChildRoute(id, "/admin-set-password"), {
        method: "POST",
        body: payload,
      }),

    forceLogoutUser: (id: string) =>
      api.request<void>(userChildRoute(id, "/force-logout"), {
        method: "POST",
      }),

    addRoleToUser: (id: string, payload: AddRoleRequest) =>
      api.request<UserRoleResponse>(userChildRoute(id, "/roles"), {
        method: "POST",
        body: payload,
      }),

    removeRoleFromUser: (id: string, userRoleId: string) =>
      api.request<void>(
        userChildRoute(id, `/roles/${userRoleId}`),
        {
          method: "DELETE",
        },
      ),

    syncUserRoles: (id: string, payload: SyncUserRolesRequest) =>
      api.request<UserRoleResponse[]>(
        userChildRoute(id, "/roles/sync"),
        {
          method: "POST",
          body: payload,
        },
      ),

    addAddressToUser: (id: string, payload: UserAddressRequest) =>
      api.request<UserAddressResponse>(
        userChildRoute(id, "/addresses"),
        {
          method: "POST",
          body: payload,
        },
      ),

    updateUserAddress: (id: string, addressId: string, payload: UserAddressRequest) =>
      api.request<void>(
        userChildRoute(id, `/addresses/${addressId}`),
        {
          method: "PUT",
          body: payload,
        },
      ),

    deleteUserAddress: (id: string, addressId: string) =>
      api.request<void>(
        userChildRoute(id, `/addresses/${addressId}`),
        {
          method: "DELETE",
        },
      ),
  };
};
