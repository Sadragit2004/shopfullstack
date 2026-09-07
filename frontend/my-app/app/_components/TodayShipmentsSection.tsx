"use client";

import Link from "next/link";
import { Icon } from "./icons";
import { TODAY_SHIP_PRODUCTS } from "./data";
import { ProductRail } from "./ProductCard";

export default function TodayShipmentsSection() {
  return (
    <section className="bg-teal-700/[0.04] py-8 dark:bg-teal-400/[0.04]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white dark:bg-teal-600">
              <Icon.Truck className="h-[22px] w-[22px]" />
            </span>
            <div>
              <h2 className="text-[19px] font-bold text-stone-900 sm:text-[21px] dark:text-white">ارسالی‌های امروز</h2>
              <p className="mt-0.5 text-[13.5px] text-stone-500 dark:text-stone-400">سفارش تا ظهر، تحویل همان روز</p>
            </div>
          </div>
          <Link href="/today-shipping" className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-teal-800 hover:underline dark:text-teal-400">
            مشاهده همه
            <Icon.ArrowMore className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
        <ProductRail products={TODAY_SHIP_PRODUCTS} />
      </div>
    </section>
  );
}