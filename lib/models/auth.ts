export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profile_image: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  profile_image?: File | null;
}

export interface RegisterResponse {
  message: string;
  user: User;
} 