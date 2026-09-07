"use client";

import Link from "next/link";
import { Icon } from "./icons";
import { NEWEST_PRODUCTS } from "./data";
import { ProductRail } from "./ProductCard";

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[19px] font-bold text-stone-900 sm:text-[21px] dark:text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-[13.5px] text-stone-500 dark:text-stone-400">{subtitle}</p>}
      </div>
      <Link
        href="/newest"
        className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-teal-800 hover:underline dark:text-teal-400"
      >
        مشاهده همه
        <Icon.ArrowMore className="h-3.5 w-3.5 rtl:rotate-180" />
      </Link>
    </div>
  );
}

export default function NewestSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <SectionHeader title="جدیدترین محصولات" subtitle="تازه به فروشگاه اضافه شده" />
      <ProductRail products={NEWEST_PRODUCTS} />
    </section>
  );
}