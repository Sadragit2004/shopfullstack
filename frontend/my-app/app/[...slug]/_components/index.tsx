// app/[locale]/categories/[...slug]/_components/index.tsx
'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryProducts, Product, PaginationInfo, FilterOptions, ProductFilterParams } from '@/lib/api/categories/productFilter';
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

// ============================================================
// ProductBox Component
// ============================================================
function ProductBox({ product }: { product: Product }) {
  // قیمت نمایشی - اولویت با price هست
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

          {/* ============================================================
              نمایش قیمت - با price
              ============================================================ */}
          <div className="mt-2">
            {displayPrice ? (
              <div>
                {hasPriceRange ? (
                  // اگر محدوده قیمت داشت (مثلاً برای محصولات با واریانت)
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
                  // اگر یک قیمت داشت
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('fa-IR').format(Number(displayPrice))} تومان
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-slate-400">قیمت نامشخص</span>
            )}
          </div>

          {product.category_names.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.category_names.slice(0, 2).map((cat) => (
                <span key={cat} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                  {cat}
                </span>
              ))}
              {product.category_names.length > 2 && (
                <span className="text-xs text-slate-400">+{product.category_names.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ============================================================
// FilterBox Component
// ============================================================
function FilterBox({ filters, currentParams }: { filters: FilterOptions; currentParams: ProductFilterParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceMin, setPriceMin] = useState(currentParams.min_price || '');
  const [priceMax, setPriceMax] = useState(currentParams.max_price || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentParams.brands || []);
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({});
  const [hasInventory, setHasInventory] = useState(currentParams.has_inventory || false);
  const [isOpen, setIsOpen] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (priceMin) params.set('min_price', String(priceMin));
    else params.delete('min_price');

    if (priceMax) params.set('max_price', String(priceMax));
    else params.delete('max_price');

    params.delete('brands[]');
    selectedBrands.forEach(brand => params.append('brands[]', brand));

    Object.keys(selectedFeatures).forEach(key => {
      const values = selectedFeatures[key];
      if (values && values.length > 0) {
        params.set(`feature_${key}`, values.join(','));
      } else {
        params.delete(`feature_${key}`);
      }
    });

    if (hasInventory) params.set('has_inventory', 'true');
    else params.delete('has_inventory');

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('page_size', String(currentParams.page_size || 20));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 border border-slate-200/70 dark:border-slate-800/60 text-right">
      <button
        className="lg:hidden w-full bg-blue-600 text-white py-2 rounded-lg mb-4 hover:bg-blue-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'بستن فیلترها' : 'نمایش فیلترها'}
      </button>

      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">محدوده قیمت</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="از"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-1/2 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
            <input
              type="number"
              placeholder="تا"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-1/2 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {filters.price_range.min} - {filters.price_range.max} تومان
          </div>
        </div>

        {filters.brands && filters.brands.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">برندها</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filters.brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands(prev => [...prev, brand.slug]);
                      } else {
                        setSelectedBrands(prev => prev.filter(b => b !== brand.slug));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {filters.features && filters.features.length > 0 ? (
          filters.features.map((feature) => (
            <div key={feature.id} className="mb-6">
              <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">
                {feature.name}
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {feature.values && feature.values.length > 0 ? (
                  feature.values.map((value) => (
                    <label key={value.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(selectedFeatures[feature.key] || []).includes(value.value)}
                        onChange={(e) => {
                          setSelectedFeatures(prev => {
                            const current = prev[feature.key] || [];
                            if (e.target.checked) {
                              return { ...prev, [feature.key]: [...current, value.value] };
                            } else {
                              return { ...prev, [feature.key]: current.filter(v => v !== value.value) };
                            }
                          });
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                      />
                      <span>{value.value}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">مقداری برای این ویژگی وجود ندارد</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="mb-6 text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
            <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>هیچ ویژگی‌ای برای این دسته‌بندی ثبت نشده است</p>
          </div>
        )}

        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasInventory}
              onChange={(e) => setHasInventory(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
            />
            <span>فقط محصولات موجود</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition active:scale-[0.98]"
          >
            اعمال فیلتر
          </button>
          <button
            onClick={clearFilters}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-[0.98]"
          >
            پاک کردن
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ProductList Component
// ============================================================
function ProductList({ products, pagination }: { products: Product[]; pagination: PaginationInfo }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('ordering', value);
    else params.delete('ordering');
    params.set('page', '1');
    setIsLoading(true);
    router.push(`${pathname}?${params.toString()}`);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    setIsLoading(true);
    router.push(`${pathname}?${params.toString()}`);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page_size', value);
    params.set('page', '1');
    setIsLoading(true);
    router.push(`${pathname}?${params.toString()}`);
    setTimeout(() => setIsLoading(false), 300);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 text-center border border-slate-200/70 dark:border-slate-800/60">
        <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-4">محصولی یافت نشد</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">با فیلترهای دیگر امتحان کنید</p>
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

          <select
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={searchParams.get('ordering') || 'newest'}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="price_asc">ارزان‌ترین</option>
            <option value="price_desc">گران‌ترین</option>
            <option value="popular">محبوب‌ترین</option>
          </select>
        </div>
      </div>

      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : ''}`}>
        {products.map((product) => (
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

export default function CategoryPage({ params, searchParams }: PageProps) {
  const unwrappedParams = use(params);
  const unwrappedSearchParams = use(searchParams);

  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [category, setCategory] = useState<{ id: number; title: string; slug: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categorySlug = unwrappedParams.slug[unwrappedParams.slug.length - 1];

  const getFilterParams = useCallback((): ProductFilterParams => {
    const paramsObj: ProductFilterParams = {
      page: unwrappedSearchParams.page ? parseInt(unwrappedSearchParams.page) : 1,
      page_size: unwrappedSearchParams.page_size ? parseInt(unwrappedSearchParams.page_size) : 20,
      min_price: unwrappedSearchParams.min_price,
      max_price: unwrappedSearchParams.max_price,
      search: unwrappedSearchParams.search,
      ordering: unwrappedSearchParams.ordering as ProductFilterParams['ordering'],
      include_filters: true,
    };

    if (unwrappedSearchParams.brands) {
      paramsObj.brands = Array.isArray(unwrappedSearchParams.brands)
        ? unwrappedSearchParams.brands
        : [unwrappedSearchParams.brands];
    }

    if (unwrappedSearchParams.has_inventory === 'true') {
      paramsObj.has_inventory = true;
    }

    Object.keys(unwrappedSearchParams).forEach(key => {
      if (key.startsWith('feature_') && unwrappedSearchParams[key]) {
        paramsObj[key] = unwrappedSearchParams[key];
      }
    });

    return paramsObj;
  }, [unwrappedSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const filterParams = getFilterParams();
        const data = await getCategoryProducts(categorySlug, filterParams);

        setProducts(data.products);
        setFilters(data.filters);
        setPagination(data.pagination);

        const categoryData = {
          id: data.category.id,
          title: data.category.title,
          slug: data.category.slug,
          description: data.category.description || '',
        };

        setCategory(categoryData);
      } catch (err) {
        setError('خطا در دریافت محصولات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, getFilterParams]);

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

  if (error || !category) {
    return (
      <>
        <Header onMenuClick={handleMenuClick} />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl">
            {error || 'دسته‌بندی یافت نشد'}
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
          <div className="mb-8 text-right">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              {category.title}
            </h1>

            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                {category.description || 'هیچ توضیحاتی وجود ندارد'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 order-2 lg:order-1">
              {filters && (
                <FilterBox
                  filters={filters}
                  currentParams={getFilterParams()}
                />
              )}
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2">
              {pagination && (
                <ProductList
                  products={products}
                  pagination={pagination}
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