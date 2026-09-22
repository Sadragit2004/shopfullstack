import { apiGet, apiPostWithAuth } from "@/lib/api/client";

export interface PaymentType {
  id: number;
  title: string;
  is_active?: boolean;
}

export interface PaymentTypeListResponse {
  success: boolean;
  data: PaymentType[];
  error?: {
    code: string;
    message: string;
    fields?: Record<string, unknown>;
    details?: unknown;
  };
}

export interface SetOrderPaymentTypeResponse {
  success: boolean;
  data: {
    order_id: number;
    payment_type: PaymentType;
  };
  error?: {
    code: string;
    message: string;
    fields?: Record<string, unknown>;
    details?: unknown;
  };
}

export async function getPaymentTypes(): Promise<PaymentType[]> {
  const response =
    await apiGet<PaymentTypeListResponse>(
      "/api/v1/order/payment-types/",
    );

  if (!response.success) {
    throw new Error(
      response.error?.message ||
        "دریافت روش‌های پرداخت انجام نشد.",
    );
  }

  return response.data;
}

export async function setOrderPaymentType(
  orderId: number,
  paymentTypeId: number,
) {
  const response =
    await apiPostWithAuth<SetOrderPaymentTypeResponse>(
      `/api/v1/order/${orderId}/payment-type/`,
      {
        payment_type_id: paymentTypeId,
      },
    );

  if (!response.success) {
    throw new Error(
      response.error?.message ||
        "انتخاب روش پرداخت انجام نشد.",
    );
  }

  return response.data;
}