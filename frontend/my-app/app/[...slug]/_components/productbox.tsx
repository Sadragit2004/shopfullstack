// app/[locale]/categories/[...slug]/_components/productbox.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/api/categories/productFilter';

interface ProductBoxProps {
  product: Product;
}

export default function ProductBox({ product }: ProductBoxProps) {
  return (
    <Link href={`/product/${product.slug}`} className="block">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-slate-200/70 dark:border-slate-800/60">
        {/* تصویر */}
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

        {/* اطلاعات */}
        <div className="p-4">
          {product.brand_name && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {product.brand_name}
            </span>
          )}

          <h3 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {product.title}
          </h3>

          <div className="mt-2">
            {product.min_price ? (
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {new Intl.NumberFormat('fa-IR').format(Number(product.min_price))} تومان
              </span>
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