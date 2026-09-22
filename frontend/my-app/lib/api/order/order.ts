import {
  apiGetWithAuth,
} from "@/lib/api/client";

// ============================================================
// Order Status
// ============================================================

export interface OrderStatus {
  id: number;
  value: string | null;
  name: string;
}

// ============================================================
// Order Logistics
// ============================================================

export interface OrderLogistics {
  id: number;
  title: string;
  type: string;
  price: number | string;
}

// ============================================================
// Order Payment Type
// ============================================================

export interface OrderPaymentType {
  id: number;
  value: string | null;
  name: string;
}

// ============================================================
// Order Pricing
// ============================================================

export interface OrderPricing {
  subtotal_price: number | string;
  product_discount_amount: number | string;
  coupon_discount_amount: number | string;
  total_discount_amount: number | string;
  shipping_price: number | string;
  discount_percent: number | string;
  total_price: number | string;
}

// ============================================================
// Order Detail Discount
// ============================================================

export interface OrderDetailDiscount {
  id?: number;
  percentage?: number | string;
  amount?: number | string;
  [key: string]: unknown;
}

// ============================================================
// Order Detail
// ============================================================

export interface OrderDetail {
  id: number;
  product: number;
  product_title: string;
  product_slug: string;
  product_image: string;
  brand_name: string;

  variant: number | null;
  variant_title: string;
  variant_sku: string;
  variant_barcode: string;

  product_sale: number;
  pricing_tier: number | null;

  sale_type_name: string;
  unit_name: string;
  unit_symbol: string;

  feature_snapshot: unknown[];

  quantity: number | string;

  unit_price: number | string;
  subtotal_price: number | string;

  product_discount_percent: number | string;
  product_discount_amount: number | string;

  final_unit_price: number | string;
  total_price: number | string;

  cost_price: number | string | null;

  discount: OrderDetailDiscount | null;

  created_at: string;
}

// ============================================================
// Order
// ============================================================

export interface Order {
  id: number;
  uuid: string;

  status: OrderStatus | null;

  logistics: OrderLogistics | null;

  payment_type: OrderPaymentType | null;

  pricing: OrderPricing;

  details: OrderDetail[];

  created_at: string;
  updated_at: string;
}

// ============================================================
// API Response
// ============================================================

export interface GetOrderResponse {
  success: boolean;

  data: Order;

  error?: {
    code: string;
    message: string;
    fields?: Record<string, unknown>;
    details?: unknown;
  };
}

// ============================================================
// Get Order
// ============================================================

export async function getOrder(
  orderId: number | string,
): Promise<Order> {
  const numericOrderId = Number(
    orderId,
  );

  if (
    !Number.isInteger(numericOrderId) ||
    numericOrderId <= 0
  ) {
    throw new Error(
      "شناسه سفارش معتبر نیست.",
    );
  }

  const response =
    await apiGetWithAuth<GetOrderResponse>(
      `/api/v1/order/${numericOrderId}/`,
    );

  if (!response.success) {
    throw new Error(
      response.error?.message ||
        "دریافت اطلاعات سفارش انجام نشد.",
    );
  }

  return response.data;
}