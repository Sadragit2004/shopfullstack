"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "./icons";

import {
  getPopularBrands,
  type Brand,
} from "@/lib/api/brands";

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[19px] font-bold text-stone-900 sm:text-[21px] dark:text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-[13.5px] text-stone-500 dark:text-stone-400">
            {subtitle}
          </p>
        )}
      </div>

      <Link
        href="/brands"
        className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-teal-800 hover:underline dark:text-teal-400"
      >
        مشاهده همه

        <Icon.ArrowMore className="h-3.5 w-3.5 rtl:rotate-180" />
      </Link>
    </div>
  );
}

export default function FamousBrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadBrands = async () => {
      try {
        const data = await getPopularBrands();

        if (!cancelled) {
          setBrands(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load popular brands:",
            error
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBrands();

    return () => {
      cancelled = true;
    };
  }, []);

  const shown = brands.slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <SectionHeader
        title="برندهای معروف"
        subtitle="محصولات اصل از بهترین برندها"
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[145px] animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-900"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-8">
          {shown.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-stone-100 bg-white px-4 py-5 text-center transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-md hover:shadow-teal-900/5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-800"
            >
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-stone-100 shadow-lg transition-transform group-hover:scale-110 dark:bg-stone-800">
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={brand.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xl font-bold text-stone-400 dark:text-stone-500">
                    {brand.title.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>

              <span className="text-[13px] font-medium text-stone-700 dark:text-stone-200">
                {brand.title}
              </span>
            </Link>
          ))}
        </div>
      )}

      {!loading && brands.length === 0 && (
        <div className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">
          برندی برای نمایش وجود ندارد.
        </div>
      )}
    </section>
  );
}