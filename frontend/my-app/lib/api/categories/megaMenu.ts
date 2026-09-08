import { apiGet } from "../client";

export interface MegaMenuCategory {
  title: string;
  image: string | null;
  slug: string;
  children: MegaMenuCategory[];
}

interface MegaMenuResponse {
  success: boolean;
  data: MegaMenuCategory[];
}

export async function getMegaMenuCategories(): Promise<
  MegaMenuCategory[]
> {
  const response =
    await apiGet<MegaMenuResponse>(
      "/api/v1/categories/mega-menu/"
    );

  if (!response.success) {
    throw new Error(
      "دریافت مگامنو ناموفق بود."
    );
  }

  return response.data;
}