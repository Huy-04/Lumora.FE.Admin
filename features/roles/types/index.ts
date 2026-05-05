export interface RoleResponse {
  id: string;
  roleName: string;
  description?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleRequest {
  roleName: string;
  description?: string | null;
}

export interface RolePermissionResponse {
  id: string;
  permissionId: string;
  permissionName: string;
  module: string;
  subModule: string;
  operation: string;
  description?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddPermissionRequest {
  permissionId: string;
}

export interface SyncRolePermissionsRequest {
  addPermissionIds: string[];
  removeRolePermissionIds: string[];
}
