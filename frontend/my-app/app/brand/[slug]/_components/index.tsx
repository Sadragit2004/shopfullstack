// app/[locale]/brand/[slug]/_components/index.tsx
'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBrandDetail, BrandDetail, BrandCategory, BrandProduct } from '@/lib/api/brands/brandDetail';
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
// ============================================================
// ProductBox Component
// ============================================================
function ProductBox({ product }: { product: BrandProduct }) {
  const displayPrice = product.price || product.min_price;
  const hasPriceRange = product.min_price && product.max_price &&
                        product.min_price !== product.max_price;

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-slate-200/70 dark:border-slate-800/60">
        <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800">
          {product.cover_image_url ? (
            <Image
              src={product.cover_image_url}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-4 text-right">
          {product.brand_name && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {product.brand_name}
            </span>
          )}

          <h3 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {product.title}
          </h3>

          <div className="mt-2">
            {displayPrice ? (
              <div>
                {hasPriceRange ? (
                  <div>
                    <span className="text-xs text-slate-400 line-through">
                      {new Intl.NumberFormat('fa-IR').format(Number(product.min_price))} -
                      {new Intl.NumberFormat('fa-IR').format(Number(product.max_price))} تومان
                    </span>
                    <br />
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {new Intl.NumberFormat('fa-IR').format(Number(displayPrice))} تومان
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('fa-IR').format(Number(displayPrice))} تومان
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-slate-400">قیمت نامشخص</span>
            )}
          </div>

          {product.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.categories.slice(0, 2).map((cat) => (
                <span key={cat.id} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                  {cat.title}
                </span>
              ))}
              {product.categories.length > 2 && (
                <span className="text-xs text-slate-400">+{product.categories.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ============================================================
// CategoryFilter Component
// ============================================================
function CategoryFilter({
  categories,
  selectedCategory,
  onSelect
}: {
  categories: BrandCategory[];
  selectedCategory: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 border border-slate-200/70 dark:border-slate-800/60">
      <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200 text-right">
        دسته‌بندی‌ها
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelect('')}
          className={`w-full text-right px-3 py-2 rounded-lg text-sm transition ${
            !selectedCategory
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          همه محصولات
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.slug)}
            className={`w-full text-right px-3 py-2 rounded-lg text-sm transition flex justify-between items-center ${
              selectedCategory === category.slug
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>{category.title}</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
              {category.product_count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ProductList Component
// ============================================================
function ProductList({ products, pagination, onPageChange, onPageSizeChange }: any) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    onPageChange(page);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handlePageSizeChange = (value: string) => {
    setIsLoading(true);
    onPageSizeChange(value);
    setTimeout(() => setIsLoading(false), 300);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 text-center border border-slate-200/70 dark:border-slate-800/60">
        <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-4">محصولی یافت نشد</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">برای این دسته‌بندی محصولی وجود ندارد</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 mb-4 border border-slate-200/70 dark:border-slate-800/60">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-bold">{pagination.total_count}</span> محصول
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={pagination.page_size}
            onChange={(e) => handlePageSizeChange(e.target.value)}
          >
            <option value="12">۱۲ عدد</option>
            <option value="24">۲۴ عدد</option>
            <option value="48">۴۸ عدد</option>
            <option value="96">۹۶ عدد</option>
          </select>
        </div>
      </div>

      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : ''}`}>
        {products.map((product: BrandProduct) => (
          <ProductBox key={product.id} product={product} />
        ))}
      </div>

      {pagination.total_pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.has_previous}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
            >
              قبلی
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                let pageNum;
                if (pagination.total_pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.total_pages - 2) {
                  pageNum = pagination.total_pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 border rounded-lg transition ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.has_next}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
            >
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================
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

export default function BrandPage({ params, searchParams }: PageProps) {
  const unwrappedParams = use(params);
  const unwrappedSearchParams = use(searchParams);
  const router = useRouter();
  const pathname = usePathname();

  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [categories, setCategories] = useState<BrandCategory[]>([]);
  const [products, setProducts] = useState<BrandProduct[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const brandSlug = unwrappedParams.slug;
  const selectedCategory = unwrappedSearchParams.category || '';
  const currentPage = parseInt(unwrappedSearchParams.page || '1');
  const pageSize = parseInt(unwrappedSearchParams.page_size || '20');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getBrandDetail(brandSlug, {
        category: selectedCategory || undefined,
        page: currentPage,
        page_size: pageSize,
      });

      setBrand(data.brand);
      setCategories(data.categories);
      setProducts(data.products);
      setPagination(data.pagination);
      setTotalProducts(data.total_products);
    } catch (err) {
      setError('خطا در دریافت اطلاعات برند');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [brandSlug, selectedCategory, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    params.set('page', '1');
    params.set('page_size', String(pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(unwrappedSearchParams as any);
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(unwrappedSearchParams as any);
    params.set('page_size', value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  // تابع خالی برای onMenuClick
  const handleMenuClick = () => {};

  if (loading) {
    return (
      <>
        <Header onMenuClick={handleMenuClick} />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 h-96 animate-pulse border border-slate-200/70 dark:border-slate-800/60" />
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 h-64 animate-pulse border border-slate-200/70 dark:border-slate-800/60" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !brand) {
    return (
      <>
        <Header onMenuClick={handleMenuClick} />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl">
            {error || 'برند یافت نشد'}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header onMenuClick={handleMenuClick} />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* ============================================================
              Brand Header
              ============================================================ */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-8 border border-slate-200/70 dark:border-slate-800/60 text-right">
            <div className="flex items-center gap-4">
              {brand.logo_url && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                  {brand.name}
                </h1>
                {brand.description && (
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {brand.description}
                  </p>
                )}
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  <span>{totalProducts} محصول</span>
                  {categories.length > 0 && (
                    <span className="mr-3">• {categories.length} دسته‌بندی</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              Content
              ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Category Filter */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              {categories.length > 0 && (
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelect={handleCategorySelect}
                />
              )}
            </div>

            {/* Products */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {pagination && (
                <ProductList
                  products={products}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}