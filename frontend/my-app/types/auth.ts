// src/types/auth.ts

export interface LoginRequest {
  mobile_number: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    mobile_number: string;
    code: string;
    created_at: string;
    expires_at: string;
    is_active: boolean;
  };
}

export interface VerifyRequest {
  mobile_number: string;
  code: string;
}

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile_number: string;
}

export interface VerifyResponse {
  success: boolean;
  data: {
    authenticated: boolean;
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: AuthUser;
  };
}

export interface ApiErrorResponse {
  success: false;
  error?: {
    code?: string;
    message?: string;
    fields?: Record<
      string,
      {
        code?: string;
        message?: string;
      }
    >;
  };
}