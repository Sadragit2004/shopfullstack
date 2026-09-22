import { apiPostWithAuth } from "@/lib/api/client";

export interface CreateOrderItem {
  product_sale_id: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
}

export interface CreateOrderData {
  id: number;
  uuid?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: CreateOrderData;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, unknown>;
    details?: unknown;
  };
}

export async function createOrder(
  payload: CreateOrderRequest,
): Promise<CreateOrderData> {
  const response = await apiPostWithAuth<CreateOrderResponse>(
    "/api/v1/order/create/",
    payload,
  );

  console.log("CREATE ORDER RESPONSE:", response);
  console.log("CREATE ORDER PAYLOAD:", payload);

  if (!response.success) {
    throw new Error(
      response.error?.message ||
        response.error?.code ||
        "ثبت سفارش انجام نشد.",
    );
  }

  return response.data;
}