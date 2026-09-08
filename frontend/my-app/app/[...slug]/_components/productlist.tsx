// app/[locale]/categories/[...slug]/_components/productlist.tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductBox from './productbox';
import { Product, PaginationInfo } from '@/lib/api/categories/productFilter';

interface ProductListProps {
  products: Product[];
  pagination: PaginationInfo;
}

export default function ProductList({ products, pagination }: ProductListProps) {
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