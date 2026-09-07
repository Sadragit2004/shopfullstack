"use client";

import Link from "next/link";
import { Icon } from "./icons";
import { CATEGORIES } from "./data";

export default function Footer() {
  const columns = [
    {
      title: "درباره آرامیس",
      links: [
        { title: "درباره ما", href: "/about" },
        { title: "فرصت‌های شغلی", href: "/careers" },
        { title: "وبلاگ", href: "/blog" },
        { title: "قوانین و مقررات", href: "/terms" },
      ],
    },
    {
      title: "خدمات مشتریان",
      links: [
        { title: "پیگیری سفارش", href: "/orders" },
        { title: "راهنمای بازگشت کالا", href: "/returns" },
        { title: "سوالات متداول", href: "/faq" },
        { title: "ارتباط با ما", href: "/contact" },
      ],
    },
    {
      title: "دسته‌بندی‌های محبوب",
      links: CATEGORIES.slice(0, 4).map((c) => ({ title: c.title, href: c.href })),
    },
  ];

  return (
    <footer className="border-t border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white dark:bg-teal-600">
                <Icon.Shield className="h-[18px] w-[18px]" />
              </span>
              <span className="font-bold text-stone-900 dark:text-white">آرامیس</span>
            </div>
            <p className="mt-3 max-w-[220px] text-[13px] leading-relaxed text-stone-500 dark:text-stone-400">
              خرید مطمئن با خیال راحت؛ از انتخاب تا تحویل درِ خانه.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {[Icon.Phone, Icon.Mail, Icon.Pin].map((I, idx) => (
                <span
                  key={idx}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-500 dark:bg-stone-900 dark:text-stone-400"
                >
                  <I className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13.5px] font-bold text-stone-800 dark:text-stone-100">{col.title}</h4>
              <ul className="mt-3 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] text-stone-500 hover:text-teal-700 dark:text-stone-400 dark:hover:text-teal-300">
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-5 sm:flex-row dark:border-stone-800">
          <p className="text-[12.5px] text-stone-400">© تمامی حقوق برای فروشگاه آرامیس محفوظ است، ۱۴۰۴.</p>
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <Icon.Shield className="h-3.5 w-3.5" />
            پرداخت امن و رمزنگاری‌شده
          </div>
        </div>
      </div>
    </footer>
  );
}