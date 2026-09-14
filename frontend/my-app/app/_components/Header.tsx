
"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import { Icon } from "./icons";

import {
  NAV_LINKS,
  CATEGORY_ICON_MAP,
} from "./data";

import { useTheme } from "./ThemeProvider";

import {
  getMegaMenuCategories,
  type MegaMenuCategory,
} from "@/lib/api/categories";

import {
  getCurrentUser,
  isAuthenticated,
  logout,
  type User,
} from "@/lib/api/accounts";

import {
  getCart,
  removeFromCart,
  subscribeToCart,
  type CartItem,
  getProductDiscountPercentage,
} from "@/lib/api/products/shopcart";

/* ============================================================
   Theme Toggle
============================================================ */

function ThemeToggleButton({
  className = "",
}: {
  className?: string;
}) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "light"
          ? "فعال‌سازی حالت شب"
          : "فعال‌سازی حالت روز"
      }
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition-all duration-300 hover:scale-105 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 ${className}`}
    >
      <div className="relative">
        {theme === "light" ? (
          <Icon.Moon className="h-[18px] w-[18px]" />
        ) : (
          <Icon.Sun className="h-[18px] w-[18px] rotate-180" />
        )}
      </div>
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
      className="flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 transition-all duration-300 focus-within:border-teal-600 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-teal-600/5 dark:border-stone-700 dark:bg-stone-800/60 dark:focus-within:border-teal-500 dark:focus-within:bg-stone-800"
    >
      <Icon.Search className="h-[18px] w-[18px] shrink-0 text-stone-400" />

      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent text-[15px] text-stone-800 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
      />

      <button
        type="submit"
        className="shrink-0 rounded-lg bg-teal-700 px-3.5 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 dark:bg-teal-600 dark:hover:bg-teal-500"
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
        const hasChildren =
          !!item.children?.length;

        const isActive =
          item.slug === activeId;

        return (
          <li key={item.slug}>
            <Link
              href={`/${item.slug}`}
              onMouseEnter={() =>
                onHover(item.slug)
              }
              onFocus={() =>
                onHover(item.slug)
              }
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[14px] transition-all duration-200 ${
                isActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200"
                  : "text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800/70"
              }`}
            >
              <span className="flex items-center gap-2">
                {level === 0 &&
                  CATEGORY_ICON_MAP[
                    item.slug
                  ] && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-700/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                      {React.createElement(
                        CATEGORY_ICON_MAP[
                          item.slug
                        ],
                        {
                          className:
                            "h-3.5 w-3.5",
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

function MegaMenu({
  open,
}: {
  open: boolean;
}) {
  const [categories, setCategories] =
    useState<MegaMenuCategory[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  const [path, setPath] =
    useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setPath([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || loaded) {
      return;
    }

    let cancelled = false;

    async function loadCategories() {
      setLoading(true);

      try {
        const data =
          await getMegaMenuCategories();

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

  if (!open) {
    return null;
  }

  if (
    loading &&
    categories.length === 0
  ) {
    return (
      <div className="absolute inset-x-0 top-full z-40 hidden border-t border-stone-100 bg-white shadow-xl shadow-stone-900/5 md:block dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="min-w-[190px] shrink-0 space-y-2"
            >
              <div className="h-9 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />

              {Array.from({
                length: 5,
              }).map(
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

  const columns: MegaMenuCategory[][] = [
    categories,
  ];

  let cursor = categories;

  for (
    let level = 0;
    level < 4;
    level++
  ) {
    const selectedSlug =
      path[level];

    if (!selectedSlug) {
      break;
    }

    const found = cursor.find(
      (category) =>
        category.slug ===
        selectedSlug
    );

    if (
      !found?.children?.length
    ) {
      break;
    }

    columns.push(found.children);

    cursor = found.children;
  }

  const setLevel = (
    level: number,
    slug: string
  ) => {
    setPath((prev) => {
      const next = prev.slice(
        0,
        level
      );

      next[level] = slug;

      return next.slice(0, 5);
    });
  };

  return (
    <div
      className="absolute inset-x-0 top-full z-40 hidden border-t border-stone-100 bg-white shadow-xl shadow-stone-900/5 md:block dark:border-stone-800 dark:bg-stone-900"
      onMouseLeave={() =>
        setPath([])
      }
    >
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        {columns.map(
          (col, level) => (
            <MegaMenuColumn
              key={level}
              items={col}
              activeId={
                path[level]
              }
              onHover={(slug) =>
                setLevel(
                  level,
                  slug
                )
              }
              level={level}
            />
          )
        )}

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
   User Button
============================================================ */

function UserButton() {
  const [user, setUser] =
    useState<User | null>(null);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    if (isAuthenticated()) {
      setUser(
        getCurrentUser()
      );
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (
      e: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

      return () =>
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );
    }
  }, [menuOpen]);

  const handleLogout = () => {
    logout();

    setUser(null);

    setMenuOpen(false);

    window.location.href = "/";
  };

  const getDisplayName = () => {
    if (!user) {
      return "";
    }

    const fullName =
      `${user.first_name || ""} ${
        user.last_name || ""
      }`.trim();

    return (
      fullName ||
      user.mobile_number
    );
  };

  if (!mounted) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/accounts/login"
        aria-label="ورود / ثبت‌نام"
        className="group flex h-10 items-center gap-2 rounded-full border border-stone-200 px-4 text-stone-600 transition-all duration-200 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:border-stone-700 dark:text-stone-300 dark:hover:border-teal-500 dark:hover:bg-teal-900/20 dark:hover:text-teal-400"
      >
        <Icon.User className="h-[18px] w-[18px]" />

        <span className="hidden text-sm font-medium sm:block">
          ورود | ثبت‌نام
        </span>
      </Link>
    );
  }

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <button
        type="button"
        onClick={() =>
          setMenuOpen(!menuOpen)
        }
        className="flex h-10 items-center gap-2 rounded-full px-2 text-stone-600 transition-all duration-200 hover:bg-stone-100 active:scale-95 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        <div className="relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-sm font-bold text-white shadow-md shadow-teal-700/20">
            {getDisplayName().charAt(
              0
            )}
          </div>

          <span className="absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />
        </div>

        <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">
          {getDisplayName()}
        </span>

        <svg
          className={`hidden h-3.5 w-3.5 transition-transform duration-200 sm:block ${
            menuOpen
              ? "rotate-180"
              : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-stone-200/70 bg-white py-2 shadow-xl shadow-stone-900/10 dark:border-stone-800/60 dark:bg-slate-900 dark:shadow-black/30">
          <div className="border-b border-stone-100 px-4 py-3 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-lg font-bold text-white shadow-md">
                {getDisplayName().charAt(
                  0
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-200">
                  {getDisplayName()}
                </p>

                <p
                  dir="ltr"
                  className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400"
                >
                  {user.mobile_number}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800/70"
            >
              <Icon.User className="h-4 w-4 text-stone-400" />

              <span>
                پروفایل من
              </span>
            </Link>

            <Link
              href="/orders"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800/70"
            >
              <svg
                className="h-4 w-4 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>

              <span>
                سفارش‌های من
              </span>
            </Link>

            <Link
              href="/favorites"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800/70"
            >
              <Icon.Heart className="h-4 w-4 text-stone-400" />

              <span>
                علاقه‌مندی‌ها
              </span>
            </Link>

            <Link
              href="/addresses"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800/70"
            >
              <svg
                className="h-4 w-4 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a8 8 0 1111.314 0z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>

              <span>
                آدرس‌های من
              </span>
            </Link>
          </div>

          <div className="border-t border-stone-100 pt-1 dark:border-stone-800">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>

              <span>
                خروج از حساب
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Cart Dropdown
============================================================ */

function CartDropdown() {
  const [count, setCount] =
    useState(0);

  const [items, setItems] =
    useState<CartItem[]>([]);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const refreshCart = () => {
    const cart = getCart();

    setItems(cart);

    setCount(
      cart.reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity || 0
          ),
        0
      )
    );
  };

  useEffect(() => {
    setMounted(true);

    refreshCart();

    return subscribeToCart(
      () => refreshCart()
    );
  }, []);

  useEffect(() => {
    const handleClickOutside = (
      e: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

      return () =>
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );
    }
  }, [menuOpen]);

  const handleRemove = (
    key: string
  ) => {
    removeFromCart(key);

    refreshCart();
  };

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(
        item.total_price || 0
      ),
    0
  );

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <button
        type="button"
        onClick={() =>
          setMenuOpen(
            (v) => !v
          )
        }
        aria-label="سبد خرید"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        <Icon.Cart className="h-[18px] w-[18px]" />

        {mounted &&
          count > 0 && (
            <span className="absolute -left-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white">
              {count > 99
                ? "۹۹+"
                : count.toLocaleString(
                    "fa-IR"
                  )}
            </span>
          )}
      </button>

      {menuOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-stone-200/70 bg-white shadow-xl shadow-stone-900/10 dark:border-stone-800/60 dark:bg-slate-900 dark:shadow-black/30">
          <div className="border-b border-stone-100 px-4 py-3 dark:border-stone-800">
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
              سبد خرید شما

              {items.length > 0 && (
                <span className="mr-1 text-stone-400">
                  (
                  {items.length.toLocaleString(
                    "fa-IR"
                  )}{" "}
                  کالا)
                </span>
              )}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Icon.Cart className="h-8 w-8 text-stone-300 dark:text-stone-600" />

              <p className="text-sm text-stone-500 dark:text-stone-400">
                سبد خرید شما خالی است.
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {items.map((item) => {
                const discountPercentage =
                  getProductDiscountPercentage(
                    item.product
                      .discounts
                  );

                const finalUnitPrice =
                  Number(
                    item.unit_price ||
                      0
                  );

                /**
                 * قیمت قبل از تخفیف
                 *
                 * unit_price در shopcart
                 * قیمت نهایی بعد از تخفیف است.
                 */
                const originalUnitPrice =
                  discountPercentage >
                    0 &&
                  discountPercentage <
                    100
                    ? finalUnitPrice /
                      (1 -
                        discountPercentage /
                          100)
                    : finalUnitPrice;

                const hasDiscount =
                  discountPercentage >
                    0 &&
                  discountPercentage <
                    100 &&
                  originalUnitPrice >
                    finalUnitPrice;

                return (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800/70"
                  >
                    {item.product
                      .cover_image ? (
                      <img
                        src={
                          item.product
                            .cover_image
                        }
                        alt={
                          item.product
                            .title
                        }
                        className="h-12 w-12 shrink-0 rounded-lg border border-stone-100 object-cover dark:border-stone-800"
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-stone-100 dark:bg-stone-800" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-stone-700 dark:text-stone-200">
                        {
                          item.product
                            .title
                        }
                      </p>

                      <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                        <span className="text-stone-400">
                          {item.quantity.toLocaleString(
                            "fa-IR"
                          )}{" "}
                          ×
                        </span>

                        {hasDiscount ? (
                          <>
                            <span className="text-stone-400 line-through">
                              {Math.round(
                                originalUnitPrice
                              ).toLocaleString(
                                "fa-IR"
                              )}
                            </span>

                            <span className="font-semibold text-teal-700 dark:text-teal-400">
                              {finalUnitPrice.toLocaleString(
                                "fa-IR"
                              )}
                            </span>

                            <span className="rounded-md bg-red-50 px-1 py-0.5 text-[9px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                              {discountPercentage.toLocaleString(
                                "fa-IR"
                              )}
                              ٪
                            </span>
                          </>
                        ) : (
                          <span className="font-medium text-stone-500 dark:text-stone-400">
                            {finalUnitPrice.toLocaleString(
                              "fa-IR"
                            )}
                          </span>
                        )}

                        <span className="text-stone-400">
                          تومان
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          item.key
                        )
                      }
                      aria-label="حذف از سبد خرید"
                      className="shrink-0 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {items.length > 0 && (
            <div className="border-t border-stone-100 px-4 py-3 dark:border-stone-800">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">
                  جمع کل
                </span>

                <span className="font-bold text-stone-800 dark:text-stone-100">
                  {subtotal.toLocaleString(
                    "fa-IR"
                  )}{" "}
                  تومان
                </span>
              </div>

              <Link
                href="/shopcart"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
              >
                مشاهده سبد خرید و تسویه حساب
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Header
============================================================ */

export default function Header({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const [megaOpen, setMegaOpen] =
    useState(false);

  const closeTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const openMega = () => {
    if (closeTimer.current) {
      clearTimeout(
        closeTimer.current
      );
    }

    setMegaOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current =
      setTimeout(() => {
        setMegaOpen(false);
      }, 150);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-100 bg-white/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        {/* Mobile Menu */}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="باز کردن منو"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-100 md:hidden dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <Icon.Menu className="h-5 w-5" />
        </button>

        {/* Logo */}

        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-md shadow-teal-700/20 transition-transform group-hover:scale-105">
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

        {/* Desktop Navigation */}

        <nav className="mr-2 hidden items-center gap-1 md:flex">
          <div
            onMouseEnter={openMega}
            onMouseLeave={
              scheduleClose
            }
          >
            <button
              type="button"
              onClick={() =>
                setMegaOpen(
                  (v) => !v
                )
              }
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-colors ${
                megaOpen
                  ? "bg-stone-100 text-teal-800 dark:bg-stone-800 dark:text-teal-300"
                  : "text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/70"
              }`}
              aria-expanded={
                megaOpen
              }
            >
              دسته‌بندی

              <Icon.ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  megaOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            <MegaMenu
              open={megaOpen}
            />
          </div>

          {NAV_LINKS.map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2.5 text-[15px] font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/70"
              >
                {link.title}
              </Link>
            )
          )}
        </nav>

        {/* Desktop Search */}

        <div className="mx-auto hidden max-w-md flex-1 md:block">
          <SearchInput />
        </div>

        {/* Actions */}

        <div className="mr-auto flex items-center gap-1.5 md:mr-0">
          <ThemeToggleButton className="hidden sm:flex" />

          <button
            type="button"
            aria-label="علاقه‌مندی‌ها"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 sm:flex dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Icon.Heart className="h-[18px] w-[18px]" />
          </button>

          {/* User */}

          <div className="hidden sm:block">
            <UserButton />
          </div>

          {/* Cart */}

          <CartDropdown />
        </div>
      </div>

      {/* Mobile Search */}

      <div className="border-t border-stone-100 px-4 py-2.5 md:hidden dark:border-stone-800">
        <SearchInput />
      </div>
    </header>
  );
}
