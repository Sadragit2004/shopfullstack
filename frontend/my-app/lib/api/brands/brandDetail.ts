// lib/api/brands/brandDetail.ts
import { apiGet } from "../client";

// ============================================================
// Types
// ============================================================
export interface BrandCategory {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  product_count: number;
}

export interface BrandProduct {
  id: number;
  title: string;
  slug: string;
  cover_image_url: string | null;
  brand_name: string;
  brand_slug: string;
  categories: {
    id: number;
    title: string;
    slug: string;
  }[];
  price: string | null;
  min_price: string | null;
  max_price: string | null;
  status: string;
  created_at: string;
}

export interface BrandDetail {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string;
  product_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandDetailResponse {
  success: boolean;
  data: {
    brand: BrandDetail;
    categories: BrandCategory[];
    products: BrandProduct[];
    pagination: {
      total_count: number;
      page: number;
      page_size: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
    total_products: number;
  };
}

export interface BrandFilterParams {
  category?: string;
  page?: number;
  page_size?: number;
}

// ============================================================
// Main Function
// ============================================================
export async function getBrandDetail(
  brandSlug: string,
  params: BrandFilterParams = {}
): Promise<BrandDetailResponse['data']> {
  const queryParams = new URLSearchParams();

  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', String(params.page));
  if (params.page_size) queryParams.append('page_size', String(params.page_size));

  const queryString = queryParams.toString();
  const url = `/api/v1/brand_detail/${brandSlug}/?${queryString}`;

  console.log('🔥 Fetching Brand URL:', url);

  const response = await apiGet<BrandDetailResponse>(url);

  if (!response.success) {
    throw new Error('دریافت برند ناموفق بود.');
  }

  return response.data;
}

export async function getBrandList(params?: { limit?: number; search?: string }) {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `/api/v1/brand_detail/?${queryString}`;

  const response = await apiGet<{ success: boolean; data: BrandDetail[] }>(url);

  if (!response.success) {
    throw new Error('دریافت برندها ناموفق بود.');
  }

  return response.data;
}