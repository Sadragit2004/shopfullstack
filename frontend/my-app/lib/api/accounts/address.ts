
import { apiGetWithAuth } from "@/lib/api/client";

export interface UserAddress {
  id: number;
  province?: string;
  city?: string;
  address?: string;
  postal_code?: string | null;
  lat?: string | null;
  lon?: string | null;
}

export interface UserAddressesResponse {
  success: boolean;
  data: UserAddress[];
  error?: {
    code: string;
    message: string;
    fields?: Record<string, unknown>;
    details?: unknown;
  };
}

/**
 * دریافت لیست آدرس‌های کاربر احراز هویت‌شده
 */
export async function getUserAddresses(): Promise<UserAddress[]> {
  const response =
    await apiGetWithAuth<UserAddressesResponse>(
      "/api/v1/addresses/",
    );

  if (!response.success) {
    throw new Error(
      response.error?.message ||
        "دریافت آدرس‌های کاربر انجام نشد.",
    );
  }

  return response.data;
}

