// lib/api/categories/productFilter.ts
import { apiGet } from "../client";

// ============================================================
// Types
// ============================================================
export interface Product {
  id: number;
  title: string;
  slug: string;
  cover_image_url: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  price: string | null;
  min_price: string | null;
  max_price: string | null;      
  category_names: string[];
  status: string;
}

export interface BrandFilter {
  id: number;
  name: string;
  slug: string;
}

export interface FeatureValue {
  id: number;
  value: string;
}

export interface FeatureFilter {
  id: number;
  key: string;
  name: string;
  type: string;
  values: FeatureValue[];
}

export interface PriceRange {
  min: string;
  max: string;
}

export interface CategoryFilter {
  id: number;
  title: string;
  slug: string;
}

export interface FilterOptions {
  brands: BrandFilter[];
  features: FeatureFilter[];
  price_range: PriceRange;
  categories: CategoryFilter[];
}

export interface PaginationInfo {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CategoryInfo {
  id: number;
  title: string;
  slug: string;
  description: string;
  image?: string | null;
}

export interface ProductFilterData {
  products: Product[];
  filters: FilterOptions;
  pagination: PaginationInfo;
  category: CategoryInfo;
}

interface ProductFilterResponse {
  success: boolean;
  data: ProductFilterData;
}

export interface ProductFilterParams {
  page?: number;
  page_size?: number;
  min_price?: string | number;
  max_price?: string | number;
  brands?: string[];
  search?: string;
  ordering?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular';
  has_inventory?: boolean;
  include_filters?: boolean;
  [key: string]: any;
}

// ============================================================
// Main Function - اصلاح شده
// ============================================================
export async function getCategoryProducts(
  categorySlug: string,
  params: ProductFilterParams = {}
): Promise<ProductFilterData> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', String(params.page));
  if (params.page_size) queryParams.append('page_size', String(params.page_size));
  if (params.min_price) queryParams.append('min_price', String(params.min_price));
  if (params.max_price) queryParams.append('max_price', String(params.max_price));
  if (params.search) queryParams.append('search', params.search);
  if (params.ordering) queryParams.append('ordering', params.ordering);
  if (params.has_inventory !== undefined) {
    queryParams.append('has_inventory', String(params.has_inventory));
  }
  if (params.include_filters !== undefined) {
    queryParams.append('include_filters', String(params.include_filters));
  }

  if (params.brands && params.brands.length > 0) {
    params.brands.forEach(brand => {
      queryParams.append('brands[]', brand);
    });
  }

  Object.keys(params).forEach(key => {
    if (key.startsWith('feature_') && params[key]) {
      queryParams.append(key, String(params[key]));
    }
  });

  const queryString = queryParams.toString();
  const url = `/api/v1/categories/${categorySlug}/?${queryString}`;

  console.log('🔥 Fetching URL:', url);

  const response = await apiGet<ProductFilterResponse>(url);

  console.log('🔥 Full API Response:', response);

  if (!response.success) {
    console.error('🔥 Response not success:', response);
    throw new Error('دریافت محصولات ناموفق بود.');
  }

  // چک کن که response.data وجود داره
  if (!response.data) {
    console.error('🔥 Response data is null:', response);
    throw new Error('داده‌ای دریافت نشد.');
  }

  console.log('🔥 Response data:', response.data);
  console.log('🔥 Response data.filters:', response.data.filters);
  console.log('🔥 Response data.filters.features:', response.data.filters?.features);

  // اگر filters null بود، یه مقدار پیش‌فرض بده
  if (!response.data.filters) {
    console.warn('🔥 Filters is null, setting default');
    response.data.filters = {
      brands: [],
      features: [],
      price_range: { min: '0', max: '0' },
      categories: []
    };
  }

  return response.data;
}

export function buildFeatureParams(features: Record<string, string | string[]>): Record<string, string> {
  const params: Record<string, string> = {};

  Object.keys(features).forEach(key => {
    const value = features[key];
    if (Array.isArray(value)) {
      params[`feature_${key}`] = value.join(',');
    } else if (value) {
      params[`feature_${key}`] = value;
    }
  });

  return params;
}