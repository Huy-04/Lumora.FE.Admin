import { toSearchParams } from "~/Shared/api/queryParams";
import type {
  PermissionRequest,
  PermissionResponse,
} from "~/features/permissions/types";
import type { PaginatedResponse } from "~/Shared/types/api";

export const usePermissionsAdminApi = () => {
  const api = useApiClient();

  return {
    getPermissions: (page = 1, size = 50) =>
      api.request<PaginatedResponse<PermissionResponse>>(`/Permissions${toSearchParams({ page, size })}`),

    getPermissionById: (id: string) => api.request<PermissionResponse>(`/Permissions/${id}`),

    getPermissionsByModule: (module: string, page = 1, size = 50) =>
      api.request<PaginatedResponse<PermissionResponse>>(
        `/Permissions/module/${module}${toSearchParams({ page, size })}`,
      ),

    createPermission: (payload: PermissionRequest) =>
      api.request<PermissionResponse>("/Permissions", {
        method: "POST",
        body: payload,
      }),

    updatePermission: (id: string, payload: PermissionRequest) =>
      api.request<PermissionResponse>(`/Permissions/${id}`, {
        method: "PUT",
        body: payload,
      }),

    deletePermission: (id: string) =>
      api.request<void>(`/Permissions/${id}`, {
        method: "DELETE",
      }),
  };
};
