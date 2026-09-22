import { apiPost } from "@/lib/api/client";

export interface ValidateCouponRequest {
  code: string;
  order_id?: number;
}

export interface ValidateCouponData {
  valid: boolean;
  code?: string;
  title?: string;
  discount?: number;
  discount_amount?: number;
  message?: string;
  [key: string]: unknown;
}

export interface ValidateCouponResponse {
  success: boolean;
  data: ValidateCouponData;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, unknown>;
    details?: unknown;
  };
}

export async function validateCoupon(
  payload: ValidateCouponRequest,
): Promise<ValidateCouponData> {
  const response = await apiPost<ValidateCouponResponse>(
    "/api/v1/order/coupons/validate/",
    payload,
  );

  if (!response.success) {
    throw new Error(
      response.error?.message || "اعتبارسنجی کد تخفیف انجام نشد.",
    );
  }

  return response.data;
}