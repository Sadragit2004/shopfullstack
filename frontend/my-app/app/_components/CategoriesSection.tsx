
import Link from "next/link";

import { Icon } from "./icons";
import { CATEGORY_ICON_MAP } from "./data";

import { getPopularCategories } from "@/lib/api/categories";

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
        href="/categories"
        className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-teal-800 hover:underline dark:text-teal-400"
      >
        مشاهده همه

        <Icon.ArrowMore className="h-3.5 w-3.5 rtl:rotate-180" />
      </Link>
    </div>
  );
}

export default async function CategoriesSection() {
  const categories = await getPopularCategories();

  const shown = categories.slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <SectionHeader
        title="دسته‌بندی محصولات"
        subtitle="هرچی نیاز داری، یک‌جا پیدا می‌کنی"
      />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
        {shown.map((category) => {
          const CatIcon =
            CATEGORY_ICON_MAP[category.slug] || Icon.Grid;

          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-stone-100 bg-white px-2 py-5 text-center transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md hover:shadow-teal-900/5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-800"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700/10 text-teal-700 transition-colors group-hover:bg-teal-700 group-hover:text-white dark:bg-teal-400/10 dark:text-teal-300">
                <CatIcon className="h-7 w-7" />
              </span>

              <span className="text-[12.5px] font-medium leading-tight text-stone-700 dark:text-stone-200">
                {category.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
