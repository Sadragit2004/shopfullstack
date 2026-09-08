// app/[locale]/categories/[...slug]/page.tsx
import CategoryPage from './_components/index';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
  searchParams: Promise<{
    page?: string;
    page_size?: string;
    min_price?: string;
    max_price?: string;
    brands?: string | string[];
    search?: string;
    ordering?: string;
    has_inventory?: string;
    include_filters?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default function Page(props: PageProps) {
  return <CategoryPage {...props} />;
}