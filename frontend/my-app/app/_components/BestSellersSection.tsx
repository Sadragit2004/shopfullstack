"use client";

import Link from "next/link";
import { Icon } from "./icons";
import { BEST_SELLERS } from "./data";
import { ProductRail } from "./ProductCard";

export default function BestSellersSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon.TrendUp className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          <h2 className="text-[19px] font-bold text-stone-900 sm:text-[21px] dark:text-white">پرفروش‌ترین محصولات</h2>
        </div>
        <Link href="/best-sellers" className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-teal-800 hover:underline dark:text-teal-400">
          مشاهده همه
          <Icon.ArrowMore className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>
      <ProductRail products={BEST_SELLERS} ranked />
    </section>
  );
}