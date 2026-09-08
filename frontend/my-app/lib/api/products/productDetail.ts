// lib/api/products/productDetail.ts
import { apiGet } from "../client";

// ============================================================
// Types
// ============================================================
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  parent: number | null;
}

export interface FeatureValue {
  id: number;
  value: string;
  sort_order: number;
}

export interface ProductFeature {
  id: number;
  feature: {
    id: number;
    name: string;
    key: string;
    type: string;
  };
  feature_values: FeatureValue[];
  custom_value: string | null;
  sort_order: number;
}

export interface GalleryImage {
  id: number;
  image: string;
  sort_order: number;
}

// ============================================================
// Sale Types
// ============================================================
export interface SaleType {
  id: number;
  name: string;
  description: string;
}

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  description: string;
}

export interface Inventory {
  quantity: string;
  is_available: boolean;
}

export interface PricingTier {
  id: number;
  min_quantity: number;
  max_quantity: number | null;
  price: string;
}

export interface ProductSale {
  id: number;
  sale_type: SaleType;
  unit: Unit;
  selling_price: string;
  purchase_step: number;           // <-- اضافه شد
  minimum_quantity: number;
  maximum_quantity: number | null;
  inventory: Inventory | null;
  pricing_tiers: PricingTier[];
}

// ============================================================
// Related Product
// ============================================================
export interface RelatedProduct {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  brand: Brand | null;
  categories: Category[];
  features: ProductFeature[];
  price: string | null;
  min_price: string | null;
  max_price: string | null;
}

// ============================================================
// Product Detail
// ============================================================
export interface ProductDetail {
  id: number;
  title: string;
  slug: string;
  status: string;
  description: string;
  brand: Brand | null;
  categories: Category[];
  cover_image: string | null;
  gallery: GalleryImage[];
  pdf: string | null;
  video_file: string | null;
  video_url: string | null;
  features: ProductFeature[];
  has_variants: boolean;
  variants: any[];
  sales: ProductSale[];
  related_products: RelatedProduct[];
  price: string | null;
  min_price: string | null;
  max_price: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductDetailResponse {
  success: boolean;
  data: ProductDetail;
}

export interface ProductDetailParams {
  slug: string;
}

// ============================================================
// Main Function
// ============================================================
export async function getProductDetail(
  slug: string
): Promise<ProductDetail> {
  const url = `/api/v1/products/detail/?slug=${slug}`;

  console.log('🔥 Fetching Product Detail URL:', url);

  const response = await apiGet<ProductDetailResponse>(url);

  console.log('🔥 Product Detail Response:', response);

  if (!response.success) {
    console.error('🔥 Response not success:', response);
    throw new Error('دریافت محصول ناموفق بود.');
  }

  if (!response.data) {
    console.error('🔥 Response data is null:', response);
    throw new Error('داده‌ای دریافت نشد.');
  }

  console.log('🔥 Product Detail Data:', response.data);

  return response.data;
}