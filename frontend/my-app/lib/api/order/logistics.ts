
import {
  apiGet,
  apiPostWithAuth,
} from "@/lib/api/client";

export type LogisticsType =
  | "freight"
  | "cash_on_delivery";

export interface Logistics {
  id: number;
  title: string;
  type: LogisticsType;
  is_active?: boolean;
  price?: number | string;
}

export interface LogisticsListResponse {
  success: boolean;
  data: Logistics[];
  error?: {
    code: string;
    message: string;
    fields?: Record<string, unknown>;
    details?: unknown;
  };
}

export interface SetOrderLogisticsResponse {
  success: boolean;
  data: {
    order_id: number;
    logistics: Logistics;
  };
  error?: {
    code: string;
    message: string;
    fields?: Record<string, unknown>;
    details?: unknown;
  };
}

export async function getLogistics(): Promise<Logistics[]> {
  const response =
    await apiGet<LogisticsListResponse>(
      "/api/v1/order/logistics/",
    );

  if (!response.success) {
    throw new Error(
      response.error?.message ||
        "دریافت روش ارسال انجام نشد.",
    );
  }

  return response.data;
}

/**
 * ثبت روش ارسال برای سفارش
 *
 * مهم:
 * انتخاب Logistics بر اساس ID انجام می‌شود،
 * نه type.
 *
 * چون ممکن است چند Logistics با type یکسان
 * مثل freight وجود داشته باشند.
 */
export async function setOrderLogistics(
  orderId: number,
  logisticsId: number,
) {
  const response =
    await apiPostWithAuth<SetOrderLogisticsResponse>(
      `/api/v1/order/${orderId}/logistics/`,
      {
        logistics_id: logisticsId,
      },
    );

  if (!response.success) {
    throw new Error(
      response.error?.message ||
        "انتخاب روش ارسال انجام نشد.",
    );
  }

  return response.data;
}

