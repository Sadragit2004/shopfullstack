import { apiPostWithAuth } from "@/lib/api/client";

export interface SetOrderAddressRequest {
  user_address_id: number;
}

export interface SetOrderAddressData {
  order_id: number;
  address: {
    id: number;
    province?: string;
    city?: string;
    address?: string;
    postal_code?: string | null;
    lat?: string | null;
    lon?: string | null;
  };
}

export interface SetOrderAddressResponse {
  success: boolean;
  data: SetOrderAddressData;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, unknown>;
    details?: unknown;
  };
}

export async function setOrderAddress(
  orderId: number,
  userAddressId: number,
): Promise<SetOrderAddressData> {
  const response =
    await apiPostWithAuth<SetOrderAddressResponse>(
      `/api/v1/order/${orderId}/address/`,
      {
        user_address_id: userAddressId,
      },
    );

  if (!response.success) {
    throw new Error(
      response.error?.message ||
        "ذخیره آدرس سفارش انجام نشد.",
    );
  }

  return response.data;
}