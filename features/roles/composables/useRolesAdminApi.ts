import { toSearchParams } from "~/Shared/api/queryParams";
import type {
  AddPermissionRequest,
  RolePermissionResponse,
  RoleRequest,
  RoleResponse,
  SyncRolePermissionsRequest,
} from "~/features/roles/types";
import type { PaginatedResponse } from "~/Shared/types/api";

export const useRolesAdminApi = () => {
  const api = useApiClient();

  return {
    getRoles: (page = 1, size = 20) =>
      api.request<PaginatedResponse<RoleResponse>>(`/Roles${toSearchParams({ page, size })}`),

    getRoleById: (id: string) => api.request<RoleResponse>(`/Roles/${id}`),

    getRolePermissions: (id: string) =>
      api.request<RolePermissionResponse[]>(`/Roles/${id}/permissions`),

    createRole: (payload: RoleRequest) =>
      api.request<RoleResponse>("/Roles", {
        method: "POST",
        body: payload,
      }),

    updateRole: (id: string, payload: RoleRequest) =>
      api.request<RoleResponse>(`/Roles/${id}`, {
        method: "PUT",
        body: payload,
      }),

    deleteRole: (id: string) =>
      api.request<void>(`/Roles/${id}`, {
        method: "DELETE",
      }),

    addPermissionToRole: (id: string, payload: AddPermissionRequest) =>
      api.request<RolePermissionResponse>(`/Roles/${id}/permissions`, {
        method: "POST",
        body: payload,
      }),

    removePermissionFromRole: (id: string, rolePermissionId: string) =>
      api.request<void>(`/Roles/${id}/permissions/${rolePermissionId}`, {
        method: "DELETE",
      }),

    syncRolePermissions: (id: string, payload: SyncRolePermissionsRequest) =>
      api.request<RolePermissionResponse[]>(`/Roles/${id}/permissions/sync`, {
        method: "POST",
        body: payload,
      }),
  };
};
