import { apiGet } from "../client";

// ============================================================
// Brand
// ============================================================

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
}

// ============================================================
// Category
// ============================================================

export interface Category {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  parent: number | null;
}

// ============================================================
// Feature Value
// ============================================================

export interface FeatureValue {
  id: number;
  value: string;
  sort_order: number;
}

// ============================================================
// Feature
// ============================================================

export interface FeatureInfo {
  id: number;
  name: string;
  key: string;
  type: string;
}

// ============================================================
// Product Feature
// ============================================================

export interface ProductFeature {
  id: number;
  feature: FeatureInfo;
  feature_values: FeatureValue[];
  custom_value: string | null;
  sort_order: number;
}

// ============================================================
// Variant Feature
// ============================================================

export interface VariantFeature {
  id: number;
  feature: FeatureInfo;
  feature_values: FeatureValue[];
}

// ============================================================
// Gallery
// ============================================================

export interface GalleryImage {
  id: number;
  image: string;
  sort_order: number;
}

// ============================================================
// Sale
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

// ============================================================
// Inventory
// ============================================================

export interface Inventory {
  quantity: string;
  is_available: boolean;
}

// ============================================================
// Pricing Tier
// ============================================================

export interface PricingTier {
  id: number;
  min_quantity: number;
  max_quantity: number | null;
  price: string;
}

// ============================================================
// Product Sale
// ============================================================

export interface ProductSale {
  id: number;

  sale_type: SaleType;

  unit: Unit;

  selling_price: string;

  purchase_step: number;

  minimum_quantity: number;

  maximum_quantity: number | null;

  inventory: Inventory | null;

  is_available?: boolean;

  pricing_tiers: PricingTier[];
}

// ============================================================
// Product Discount
// ============================================================

export interface ProductDiscount {
  id: number;

  name: string;

  percentage: string;

  starts_at: string;

  expires_at: string;
}

// ============================================================
// Product Variant
// ============================================================

export interface ProductVariant {
  id: number;

  title: string;

  sku: string;

  barcode: string | null;

  features: VariantFeature[];

  sales: ProductSale[];

  is_available: boolean;

  price: string | null;

  min_price: string | null;

  max_price: string | null;
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

  variants: ProductVariant[];

  sales: ProductSale[];

  discounts: ProductDiscount[];

  related_products: RelatedProduct[];

  price: string | null;

  min_price: string | null;

  max_price: string | null;

  created_at: string;

  updated_at: string;
}

// ============================================================
// Response
// ============================================================

interface ProductDetailResponse {
  success: boolean;
  data: ProductDetail;
}

// ============================================================
// Params
// ============================================================

export interface ProductDetailParams {
  slug: string;
}

// ============================================================
// API
// ============================================================

export async function getProductDetail(
  slug: string
): Promise<ProductDetail> {
  const url = `/api/v1/products/detail/?slug=${encodeURIComponent(slug)}`;

  const response = await apiGet<ProductDetailResponse>(url);

  if (!response.success) {
    throw new Error("دریافت محصول ناموفق بود.");
  }

  if (!response.data) {
    throw new Error("داده‌ای دریافت نشد.");
  }

  return response.data;
}