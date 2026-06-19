export interface PermissionResponse {
  id: string;
  permissionName: string;
  module: string;
  subModule: string;
  operation: string;
  scope: string;
  description?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionRequest {
  module: string;
  subModule: string;
  operation: string;
  scope: string;
  description?: string | null;
}
