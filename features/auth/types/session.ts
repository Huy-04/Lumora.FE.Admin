import type { UserResponse } from "~/features/users/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  userName: string;
  roles: string[];
  expiresAt: string;
  permissions?: string[] | null;
}

export interface CurrentUserResponse {
  user: UserResponse;
  permissions: string[];
}
