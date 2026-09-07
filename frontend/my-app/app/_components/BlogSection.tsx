"use client";

import Link from "next/link";
import { Icon } from "./icons";
import { BLOG_POSTS } from "./data";

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[19px] font-bold text-stone-900 sm:text-[21px] dark:text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-[13.5px] text-stone-500 dark:text-stone-400">{subtitle}</p>}
      </div>
      <Link
        href="/blog"
        className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-teal-800 hover:underline dark:text-teal-400"
      >
        مشاهده همه
        <Icon.ArrowMore className="h-3.5 w-3.5 rtl:rotate-180" />
      </Link>
    </div>
  );
}

export default function BlogSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <SectionHeader title="از وبلاگ آرامیس" subtitle="راهنمای خرید و نکات کاربردی" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="group flex flex-col rounded-2xl border border-stone-100 bg-white p-4 transition-shadow hover:shadow-lg hover:shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 text-stone-300 dark:from-stone-800 dark:to-stone-800/50 dark:text-stone-600">
              <Icon.Book className="h-8 w-8" />
            </div>
            <h3 className="mt-3.5 text-[15px] font-bold leading-snug text-stone-900 group-hover:text-teal-800 dark:text-white dark:group-hover:text-teal-300">
              {post.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-stone-500 dark:text-stone-400">{post.excerpt}</p>
            <div className="mt-3 flex items-center gap-2 text-[11.5px] text-stone-400">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}