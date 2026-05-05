export interface RegisterRequest {
  email: string;
  phone: string;
  phoneRegion: string;
  fullName: string;
  userName: string;
  password: string;
  gender?: string | null;
  img?: string | null;
}

export interface RegisterResponse {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  createdAt: string;
}
