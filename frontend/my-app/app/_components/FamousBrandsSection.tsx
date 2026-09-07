"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "./icons";

interface Brand {
  id: string;
  name: string;
  logo: string;
  href: string;
  color: string;
}

const BRANDS: Brand[] = [
  {
    id: "apple",
    name: "اپل",
    logo: "🍎",
    href: "/brands/apple",
    color: "from-gray-600 to-gray-800",
  },
  {
    id: "samsung",
    name: "سامسونگ",
    logo: "📱",
    href: "/brands/samsung",
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "xiaomi",
    name: "شیائومی",
    logo: "⚡",
    href: "/brands/xiaomi",
    color: "from-orange-500 to-orange-700",
  },
  {
    id: "asus",
    name: "ایسوس",
    logo: "💻",
    href: "/brands/asus",
    color: "from-indigo-600 to-indigo-800",
  },
  {
    id: "lenovo",
    name: "لنوو",
    logo: "🖥️",
    href: "/brands/lenovo",
    color: "from-red-600 to-red-800",
  },
  {
    id: "sony",
    name: "سونی",
    logo: "🎮",
    href: "/brands/sony",
    color: "from-emerald-600 to-emerald-800",
  },
  {
    id: "nike",
    name: "نایکی",
    logo: "👟",
    href: "/brands/nike",
    color: "from-rose-600 to-rose-800",
  },
  {
    id: "adidas",
    name: "آدیداس",
    logo: "👕",
    href: "/brands/adidas",
    color: "from-zinc-700 to-zinc-900",
  },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[19px] font-bold text-stone-900 sm:text-[21px] dark:text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-[13.5px] text-stone-500 dark:text-stone-400">{subtitle}</p>}
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
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <SectionHeader title="برندهای معروف" subtitle="محصولات اصل از بهترین برندها" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-8">
        {BRANDS.map((brand) => (
          <Link
            key={brand.id}
            href={brand.href}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-stone-100 bg-white px-4 py-5 text-center transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-md hover:shadow-teal-900/5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-800"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${brand.color} text-2xl text-white shadow-lg transition-transform group-hover:scale-110`}
            >
              {brand.logo}
            </span>
            <span className="text-[13px] font-medium text-stone-700 dark:text-stone-200">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}