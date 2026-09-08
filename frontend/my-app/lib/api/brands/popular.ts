import { apiGet } from "../client";

export interface Brand {
  title: string;
  image: string | null;
  created_at: string;
  slug: string;
}

interface PopularBrandsResponse {
  success: boolean;
  data: Brand[];
}

export async function getPopularBrands(): Promise<Brand[]> {
  const response =
    await apiGet<PopularBrandsResponse>(
      "/api/v1/popular_brand/"
    );

  if (!response.success) {
    throw new Error(
      "دریافت برندهای محبوب ناموفق بود."
    );
  }

  return response.data;
}