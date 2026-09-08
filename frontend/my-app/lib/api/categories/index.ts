// lib/api/categories/index.ts
export {
  getPopularCategories,
} from "./popular";

export {
  getMegaMenuCategories,
} from "./megaMenu";

export {
  getCategoryProducts,
  buildFeatureParams,
} from "./productFilter";

export type {
  Category,
} from "./popular";

export type {
  MegaMenuCategory,
} from "./megaMenu";

export type {
  Product,
  BrandFilter,
  FeatureFilter,
  FeatureValue,
  PriceRange,
  CategoryFilter,
  FilterOptions,
  PaginationInfo,
  CategoryInfo,
  ProductFilterParams,
  ProductFilterData,
} from "./productFilter";