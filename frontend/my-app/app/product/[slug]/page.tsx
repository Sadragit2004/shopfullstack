// app/[locale]/product/[slug]/page.tsx
import ProductDetailPage from './_components/index';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default function Page(props: PageProps) {
  return <ProductDetailPage {...props} />;
}

// متادیتا برای SEO
export async function generateMetadata({ params }: PageProps) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;

  try {
    const { getProductDetail } = await import('@/lib/api/products/productDetail');
    const product = await getProductDetail(slug);

    return {
      title: product.title,
      description: product.description || `محصول ${product.title}`,
    };
  } catch {
    return {
      title: 'محصول',
      description: 'جزئیات محصول',
    };
  }
}