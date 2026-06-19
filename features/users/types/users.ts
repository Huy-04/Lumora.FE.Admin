export interface UserResponse {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  userName: string;
  img: string;
  gender: string;
  userStatus: string;
  emailStatus: string;
  phoneStatus: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  phone: string;
  phoneRegion: string;
  fullName: string;
  userName: string;
  password: string;
  gender?: string | null;
  img?: string | null;
}

export interface UpdateUserRequest {
  email: string;
  phone: string;
  phoneRegion: string;
  fullName: string;
  userName: string;
  gender: string;
  img: string;
  userStatus: string;
  emailStatus: string;
  phoneStatus: string;
}

export interface UserRoleResponse {
  id: string;
  roleId: string;
  roleName: string;
  description?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddRoleRequest {
  roleId: string;
}

export interface SyncUserRolesRequest {
  addRoleIds: string[];
  removeUserRoleIds: string[];
}

export interface UserAddressResponse {
  id: string;
  phone: string;
  fullName: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  addressType: string;
  ghnDistrictId: number;
  ghnWardCode: string;
}

export interface UserAddressRequest {
  phone: string;
  fullName: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  addressType: string;
  ghnDistrictId: number;
  ghnWardCode: string;
}


export interface PasswordRequest {
  password: string;
}
