// app/[locale]/brand/[slug]/page.tsx
import BrandPage from './_components/index';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<{
    category?: string;
    page?: string;
    page_size?: string;
  }>;
}

export default function Page(props: PageProps) {
  return <BrandPage {...props} />;
}

// متادیتا برای SEO
export async function generateMetadata({ params }: PageProps) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;

  try {
    const { getBrandDetail } = await import('@/lib/api/brands/brandDetail');
    const data = await getBrandDetail(slug, { page: 1, page_size: 1 });

    return {
      title: data.brand.name,
      description: data.brand.description || `محصولات برند ${data.brand.name}`,
    };
  } catch {
    return {
      title: 'برند',
      description: 'محصولات این برند',
    };
  }
}