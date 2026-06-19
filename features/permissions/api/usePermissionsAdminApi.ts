import type {
  PermissionRequest,
  PermissionResponse,
} from "~/features/permissions/types/permissions";
import type { PaginatedResponse } from "~/Shared/types/api";

const permissionRoute = (path = "") => `/Permissions${path}`;

const normalizePaginatedPermissions = (payload: unknown): PaginatedResponse<PermissionResponse> => {
  let currentPayload = payload;

  for (let attempt = 0; attempt < 3 && typeof currentPayload === "string"; attempt += 1) {
    const normalizedText = currentPayload.trim();

    if (!normalizedText) {
      break;
    }

    try {
      currentPayload = JSON.parse(normalizedText);
    } catch {
      break;
    }
  }

  return currentPayload as PaginatedResponse<PermissionResponse>;
};

export const usePermissionsAdminApi = () => {
  const api = useApiClient();

  return {
    getPermissions: async (page = 1, size = 50) =>
      normalizePaginatedPermissions(await api.request<PaginatedResponse<PermissionResponse> | string>(
        `${permissionRoute()}${toSearchParams({ page, size })}`,
      )),

    getPermissionById: (id: string) =>
      api.request<PermissionResponse>(permissionRoute(`/${id}`)),

    getPermissionsByModule: async (module: string, page = 1, size = 50) =>
      normalizePaginatedPermissions(await api.request<PaginatedResponse<PermissionResponse> | string>(
        `${permissionRoute(`/module/${module}`)}${toSearchParams({ page, size })}`,
      )),

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
