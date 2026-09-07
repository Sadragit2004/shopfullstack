import { apiGet } from "../client";

export interface Category {
  title: string;
  image: string | null;
  slug: string;
}

interface PopularCategoriesResponse {
  success: boolean;
  data: Category[];
}

export async function getPopularCategories(): Promise<Category[]> {
  const response =
    await apiGet<PopularCategoriesResponse>(
      "/api/v1/categories/popular/",
    );

  if (!response.success) {
    throw new Error(
      "دریافت دسته‌بندی‌های محبوب ناموفق بود.",
    );
  }

  return response.data;
}