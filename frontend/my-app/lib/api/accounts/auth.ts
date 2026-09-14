// lib/api/accounts/auth.ts
import { apiPost } from "../client";

// ============================================================
// Types
// ============================================================
export interface LoginRequest {
  mobile_number: string;
}

export interface LoginData {
  mobile_number: string;
  code: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: LoginData;
}

export interface VerifyRequest {
  mobile_number: string;
  code: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile_number: string;
}

export interface VerifyData {
  authenticated: boolean;
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface VerifyResponse {
  success: boolean;
  data: VerifyData;
}

// ============================================================
// Login
// ============================================================
export async function login(
  mobileNumber: string
): Promise<LoginData> {
  const url = `/api/v1/login/`;

  console.log('🔥 Login URL:', url);

  const response = await apiPost<LoginResponse>(url, {
    mobile_number: mobileNumber,
  });

  console.log('🔥 Login Response:', response);

  if (!response.success) {
    throw new Error('ارسال کد تایید ناموفق بود.');
  }

  return response.data;
}

// ============================================================
// Verify
// ============================================================
export async function verify(
  mobileNumber: string,
  code: string
): Promise<VerifyData> {
  const url = `/api/v1/verify/`;

  console.log('🔥 Verify URL:', url);

  const response = await apiPost<VerifyResponse>(url, {
    mobile_number: mobileNumber,
    code: code,
  });

  console.log('🔥 Verify Response:', response);

  if (!response.success) {
    throw new Error('کد تایید نامعتبر است.');
  }

  // ذخیره توکن‌ها در localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
}

// ============================================================
// Logout
// ============================================================
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

// ============================================================
// Get Current User
// ============================================================
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

// ============================================================
// Check Authenticated
// ============================================================
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
}