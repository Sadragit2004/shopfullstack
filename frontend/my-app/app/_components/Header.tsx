"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { NAV_LINKS, CATEGORY_ICON_MAP } from "./data";
import { useTheme } from "./ThemeProvider";

import {
  getMegaMenuCategories,
  type MegaMenuCategory,
} from "@/lib/api/categories";

/* ============================================================
   Theme Toggle
============================================================ */

function ThemeToggleButton({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={
        theme === "light"
          ? "فعال‌سازی حالت شب"
          : "فعال‌سازی حالت روز"
      }
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 ${className}`}
    >
      {theme === "light" ? (
        <Icon.Moon className="h-[18px] w-[18px]" />
      ) : (
        <Icon.Sun className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}

/* ============================================================
   Search
============================================================ */

function SearchInput({
  placeholder = "دنبال چی می‌گردی؟",
}: {
  placeholder?: string;
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 transition-colors focus-within:border-teal-600 focus-within:bg-white dark:border-stone-700 dark:bg-stone-800/60 dark:focus-within:border-teal-500 dark:focus-within:bg-stone-800"
    >
      <Icon.Search className="h-[18px] w-[18px] shrink-0 text-stone-400" />

      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent text-[15px] text-stone-800 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
      />

      <button
        type="submit"
        className="shrink-0 rounded-lg bg-teal-700 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
      >
        جستجو
      </button>
    </form>
  );
}

/* ============================================================
   Mega Menu Column
============================================================ */

function MegaMenuColumn({
  items,
  activeId,
  onHover,
  level,
}: {
  items: MegaMenuCategory[];
  activeId?: string;
  onHover: (id: string) => void;
  level: number;
}) {
  return (
    <ul
      className={`min-w-[190px] shrink-0 ${
        level > 0
          ? "border-e border-stone-100 pe-4 dark:border-stone-800"
          : ""
      }`}
    >
      {items.map((item) => {
        const hasChildren = !!item.children?.length;
        const isActive = item.slug === activeId;

        return (
          <li key={item.slug}>
            <Link
              href={`/${item.slug}`}
              onMouseEnter={() => onHover(item.slug)}
              onFocus={() => onHover(item.slug)}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[14px] transition-colors ${
                isActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200"
                  : "text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800/70"
              }`}
            >
              <span className="flex items-center gap-2">
                {level === 0 &&
                  CATEGORY_ICON_MAP[item.slug] && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-700/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                      {React.createElement(
                        CATEGORY_ICON_MAP[item.slug],
                        {
                          className: "h-3.5 w-3.5",
                        }
                      )}
                    </span>
                  )}

                {item.title}
              </span>

              {hasChildren && (
                <Icon.ChevronBack className="h-3.5 w-3.5 shrink-0 opacity-60" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ============================================================
   Mega Menu
============================================================ */

function MegaMenu({ open }: { open: boolean }) {
  const [categories, setCategories] = useState<
    MegaMenuCategory[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [path, setPath] = useState<string[]>([]);

  /* ----------------------------------------------------------
     Reset path when menu closes
  ---------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      setPath([]);
    }
  }, [open]);

  /* ----------------------------------------------------------
     Get categories from API
     فقط اولین بار که Mega Menu باز شود
  ---------------------------------------------------------- */

  useEffect(() => {
    if (!open || loaded) {
      return;
    }

    let cancelled = false;

    async function loadCategories() {
      setLoading(true);

      try {
        const data = await getMegaMenuCategories();

        if (cancelled) {
          return;
        }

        setCategories(data);
        setLoaded(true);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "خطا در دریافت دسته‌بندی‌های مگامنو:",
            error
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [open, loaded]);

  /* ----------------------------------------------------------
     Closed
  ---------------------------------------------------------- */

  if (!open) {
    return null;
  }

  /* ----------------------------------------------------------
     Loading
  ---------------------------------------------------------- */

  if (loading && categories.length === 0) {
    return (
      <div
        className="absolute inset-x-0 top-full z-40 hidden border-t border-stone-100 bg-white shadow-xl shadow-stone-900/5 duration-150 animate-in fade-in slide-in-from-top-1 md:block dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[190px] shrink-0 space-y-2"
            >
              <div className="h-9 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />

              {Array.from({ length: 5 }).map(
                (_, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="h-9 animate-pulse rounded-lg bg-stone-50 dark:bg-stone-800/60"
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------
     Build columns

     Level 0
     Level 1
     Level 2
     Level 3
     Level 4

     Maximum = 5 levels
  ---------------------------------------------------------- */

  const columns: MegaMenuCategory[][] = [categories];

  let cursor = categories;

  for (let level = 0; level < 4; level++) {
    const selectedSlug = path[level];

    if (!selectedSlug) {
      break;
    }

    const found = cursor.find(
      (category) => category.slug === selectedSlug
    );

    if (!found?.children?.length) {
      break;
    }

    columns.push(found.children);

    cursor = found.children;
  }

  /* ----------------------------------------------------------
     Set selected level
  ---------------------------------------------------------- */

  const setLevel = (level: number, slug: string) => {
    setPath((prev) => {
      /*
       * فقط مسیر قبل از این level را نگه می‌داریم.
       *
       * مثال:
       * [osh, mrdnh, non]
       *
       * اگر level = 1 شود:
       * [osh, newSlug]
       *
       * سطوح بعدی حذف می‌شوند.
       */

      const next = prev.slice(0, level);

      next[level] = slug;

      /*
       * حداکثر 5 سطح
       */
      return next.slice(0, 5);
    });
  };

  return (
    <div
      className="absolute inset-x-0 top-full z-40 hidden border-t border-stone-100 bg-white shadow-xl shadow-stone-900/5 duration-150 animate-in fade-in slide-in-from-top-1 md:block dark:border-stone-800 dark:bg-stone-900"
      onMouseLeave={() => setPath([])}
    >
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        {columns.map((col, level) => (
          <MegaMenuColumn
            key={level}
            items={col}
            activeId={path[level]}
            onHover={(slug) =>
              setLevel(level, slug)
            }
            level={level}
          />
        ))}

        {/* ----------------------------------------------------
            Promo
        ---------------------------------------------------- */}

        <div className="mr-auto hidden w-64 shrink-0 self-stretch rounded-xl bg-gradient-to-b from-amber-50 to-amber-100/40 p-5 lg:flex lg:flex-col lg:justify-between dark:from-amber-500/10 dark:to-amber-500/5">
          <div>
            <Icon.Tag className="h-6 w-6 text-amber-700 dark:text-amber-400" />

            <p className="mt-3 text-[15px] font-medium text-stone-800 dark:text-stone-100">
              محصولات شگفت‌انگیز امروز رو از دست نده
            </p>
          </div>

          <Link
            href="/deals"
            className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-amber-800 hover:underline dark:text-amber-300"
          >
            مشاهده پیشنهادها

            <Icon.ArrowMore className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Header
============================================================ */

export default function Header({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [megaOpen, setMegaOpen] = useState(false);

  const closeTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const openMega = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setMegaOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => {
      setMegaOpen(false);
    }, 150);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-100 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        {/* ==================================================
            Mobile Menu
        ================================================== */}

        <button
          onClick={onMenuClick}
          aria-label="باز کردن منو"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 md:hidden dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <Icon.Menu className="h-5 w-5" />
        </button>

        {/* ==================================================
            Logo
        ================================================== */}

        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white dark:bg-teal-600">
            <Icon.Shield className="h-5 w-5" />
          </span>

          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-stone-900 dark:text-white">
              آرامیس
            </span>

            <span className="hidden text-[11px] text-stone-400 sm:block dark:text-stone-500">
              خرید آسوده، خیال راحت
            </span>
          </span>
        </Link>

        {/* ==================================================
            Desktop Navigation
        ================================================== */}

        <nav className="mr-2 hidden items-center gap-1 md:flex">
          {/* ------------------------------------------------
              Categories
          ------------------------------------------------ */}

          <div
            onMouseEnter={openMega}
            onMouseLeave={scheduleClose}
          >
            <button
              onClick={() =>
                setMegaOpen((v) => !v)
              }
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-colors ${
                megaOpen
                  ? "bg-stone-100 text-teal-800 dark:bg-stone-800 dark:text-teal-300"
                  : "text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/70"
              }`}
              aria-expanded={megaOpen}
            >
              دسته‌بندی

              <Icon.ChevronDown
                className={`h-4 w-4 transition-transform ${
                  megaOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <MegaMenu open={megaOpen} />
          </div>

          {/* ------------------------------------------------
              IMPORTANT:
              NAV_LINKS کاملاً دست نخورده

              ارتباط با ما
              درباره ما
              فروشگاه
              و...

              همچنان از data.ts می‌آیند.
          ------------------------------------------------ */}

          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2.5 text-[15px] font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/70"
            >
              {l.title}
            </Link>
          ))}
        </nav>

        {/* ==================================================
            Desktop Search
        ================================================== */}

        <div className="mx-auto hidden max-w-md flex-1 md:block">
          <SearchInput />
        </div>

        {/* ==================================================
            Actions
        ================================================== */}

        <div className="mr-auto flex items-center gap-1.5 md:mr-0">
          <ThemeToggleButton className="hidden sm:flex" />

          <button
            aria-label="علاقه‌مندی‌ها"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 sm:flex dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Icon.Heart className="h-[18px] w-[18px]" />
          </button>

          <button
            aria-label="حساب کاربری"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 sm:flex dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Icon.User className="h-[18px] w-[18px]" />
          </button>

          <button
            aria-label="سبد خرید"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Icon.Cart className="h-[18px] w-[18px]" />

            <span className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              ۲
            </span>
          </button>
        </div>
      </div>

      {/* ====================================================
          Mobile Search
      ==================================================== */}

      <div className="border-t border-stone-100 px-4 py-2.5 md:hidden dark:border-stone-800">
        <SearchInput />
      </div>
    </header>
  );
}