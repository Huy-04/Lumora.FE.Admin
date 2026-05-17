import type {
  PermissionRequest,
  PermissionResponse,
} from "~/features/permissions/types";
import type { PaginatedResponse } from "~/Shared/types/api";

const permissionRoute = (path = "") => `/Permissions${path}`;

export const usePermissionsAdminApi = () => {
  const api = useApiClient();

  return {
    getPermissions: (page = 1, size = 50) =>
      api.request<PaginatedResponse<PermissionResponse>>(
        `${permissionRoute()}${toSearchParams({ page, size })}`,
      ),

    getPermissionById: (id: string) =>
      api.request<PermissionResponse>(permissionRoute(`/${id}`)),

    getPermissionsByModule: (module: string, page = 1, size = 50) =>
      api.request<PaginatedResponse<PermissionResponse>>(
        `${permissionRoute(`/module/${module}`)}${toSearchParams({ page, size })}`,
      ),

    createPermission: (payload: PermissionRequest) =>
      api.request<PermissionResponse>(permissionRoute(), {
        method: "POST",
        body: payload,
      }),

    updatePermission: (id: string, payload: PermissionRequest) =>
      api.request<PermissionResponse>(permissionRoute(`/${id}`), {
        method: "PUT",
        body: payload,
      }),

    deletePermission: (id: string) =>
      api.request<void>(permissionRoute(`/${id}`), {
        method: "DELETE",
      }),
  };
};
