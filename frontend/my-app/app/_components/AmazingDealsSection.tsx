"use client";

import Link from "next/link";
import { Icon } from "./icons";
import { AMAZING_PRODUCTS } from "./data";
import { ProductRail } from "./ProductCard";

export default function AmazingDealsSection() {
  return (
    <section className="bg-gradient-to-b from-amber-50/70 to-transparent py-8 dark:from-amber-500/[0.06]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Icon.Sparkles className="h-[22px] w-[22px]" />
            </span>
            <div>
              <h2 className="text-[19px] font-bold text-stone-900 sm:text-[21px] dark:text-white">محصولات شگفت‌انگیز</h2>
              <p className="mt-0.5 text-[13.5px] text-stone-500 dark:text-stone-400">پیشنهادهای ویژه‌ی امروز، تا تمام نشده</p>
            </div>
          </div>
          <Link
            href="/deals"
            className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-amber-800 hover:underline dark:text-amber-400"
          >
            مشاهده همه
            <Icon.ArrowMore className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
        <ProductRail products={AMAZING_PRODUCTS} />
      </div>
    </section>
  );
}