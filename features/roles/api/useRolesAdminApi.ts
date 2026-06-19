import type {
  AddPermissionRequest,
  RolePermissionResponse,
  RoleRequest,
  RoleResponse,
  SyncRolePermissionsRequest,
} from "~/features/roles/types/roles";
import type { PaginatedResponse } from "~/Shared/types/api";

const roleRoute = (path = "") => `/Roles${path}`;
const roleChildRoute = (roleId: string, childPath = "") =>
  `/Roles/${roleId}${childPath}`;

export const useRolesAdminApi = () => {
  const api = useApiClient();

  return {
    getRoles: (page = 1, size = 20) =>
      api.request<PaginatedResponse<RoleResponse>>(
        `${roleRoute()}${toSearchParams({ page, size })}`,
      ),

    getRoleById: (id: string) => api.request<RoleResponse>(roleChildRoute(id)),

    getRolePermissions: (id: string) =>
      api.request<RolePermissionResponse[]>(
        roleChildRoute(id, "/permissions"),
      ),

    createRole: (payload: RoleRequest) =>
      api.request<RoleResponse>(roleRoute(), {
        method: "POST",
        body: payload,
      }),

    updateRole: (id: string, payload: RoleRequest) =>
      api.request<RoleResponse>(roleChildRoute(id), {
        method: "PUT",
        body: payload,
      }),

    deleteRole: (id: string) =>
      api.request<void>(roleChildRoute(id), {
        method: "DELETE",
      }),

    addPermissionToRole: (id: string, payload: AddPermissionRequest) =>
      api.request<RolePermissionResponse>(
        roleChildRoute(id, "/permissions"),
        {
          method: "POST",
          body: payload,
        },
      ),

    removePermissionFromRole: (id: string, rolePermissionId: string) =>
      api.request<void>(
        roleChildRoute(id, `/permissions/${rolePermissionId}`),
        {
          method: "DELETE",
        },
      ),

    syncRolePermissions: (id: string, payload: SyncRolePermissionsRequest) =>
      api.request<RolePermissionResponse[]>(
        roleChildRoute(id, "/permissions/sync"),
        {
          method: "POST",
          body: payload,
        },
      ),
  };
};
