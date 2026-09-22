
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Truck,
  Tag,
} from "lucide-react";

import {
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  subscribeToCart,
  type CartItem,
} from "@/lib/api/products/shopcart";

import { createOrder } from "@/lib/api/order/create";
import { isAuthenticated } from "@/lib/api/accounts/auth";

function formatPrice(value: number | string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "۰";
  }

  return new Intl.NumberFormat("fa-IR").format(
    Math.round(number),
  );
}

function getItemImage(item: CartItem) {
  return (
    item.product.cover_image ||
    item.product.gallery?.[0]?.image ||
    null
  );
}

function getQuantityText(quantity: number | string) {
  return Number(quantity).toLocaleString("fa-IR", {
    maximumFractionDigits: 3,
  });
}

export default function ShopCart() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  /*
   * جلوگیری از ساخت چند سفارش در صورتی که
   * /cart?checkout=1 دوباره رندر شود.
   */
  const checkoutCreationStartedRef = useRef(false);

  /*
   * =========================================================
   * Cart
   * =========================================================
   */

  useEffect(() => {
    setMounted(true);
    setCart(getCart());

    const unsubscribe = subscribeToCart(() => {
      setCart(getCart());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /*
   * =========================================================
   * Totals
   * =========================================================
   */

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) =>
        sum + Number(item.total_price || 0),
      0,
    );

    const quantity = cart.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0,
    );

    return {
      subtotal,
      quantity,
      total: subtotal,
    };
  }, [cart]);

  /*
   * =========================================================
   * Quantity
   * =========================================================
   */

  const handleIncrease = (item: CartItem) => {
    const currentQuantity = Number(item.quantity);
    const step = Number(
      item.sale?.purchase_step || 1,
    );

    const maximum = item.sale?.maximum_quantity
      ? Number(item.sale.maximum_quantity)
      : null;

    let nextQuantity = currentQuantity + step;

    if (maximum !== null) {
      nextQuantity = Math.min(
        nextQuantity,
        maximum,
      );
    }

    updateQuantity(
      item.key,
      nextQuantity,
    );
  };

  const handleDecrease = (item: CartItem) => {
    const currentQuantity = Number(item.quantity);

    const step = Number(
      item.sale?.purchase_step || 1,
    );

    const minimum = Number(
      item.sale?.minimum_quantity ||
        step ||
        1,
    );

    const nextQuantity =
      currentQuantity - step;

    if (nextQuantity < minimum) {
      removeFromCart(item.key);
      return;
    }

    updateQuantity(
      item.key,
      nextQuantity,
    );
  };

  const handleRemove = (key: string) => {
    setRemovingKey(key);

    window.setTimeout(() => {
      removeFromCart(key);
      setRemovingKey(null);
    }, 180);
  };

  const handleClear = () => {
    clearCart();
  };

  /*
   * =========================================================
   * Create Initial Order
   *
   * فقط:
   * - product_sale_id
   * - quantity
   *
   * آدرس / ارسال / پرداخت / کوپن
   * اینجا ارسال نمی‌شوند.
   * =========================================================
   */

  const createCurrentOrder = useCallback(async () => {
    if (
      creatingOrder ||
      cart.length === 0
    ) {
      return;
    }

    setCreatingOrder(true);
    setCheckoutError(null);

    try {
      const order = await createOrder({
        items: cart.map((item) => ({
          product_sale_id: Number(
            item.sale.id,
          ),
          quantity: Number(
            item.quantity,
          ),
        })),
      });

      /*
       * بسیار مهم:
       *
       * Checkout endpoint های فعلی با
       * <int:order_id>
       * کار می‌کنند.
       *
       * بنابراین فقط order.id معتبر است.
       *
       * هرگز از order.uuid استفاده نکن.
       */

      const orderId = Number(order.id);

      if (
        !Number.isInteger(orderId) ||
        orderId <= 0
      ) {
        throw new Error(
          "شناسه عددی سفارش از سرور دریافت نشد.",
        );
      }

      /*
       * نتیجه نهایی:
       *
       * /order/checkout/123
       *
       * نه:
       *
       * /order/checkout/uuid
       */

      router.push(
        `/order/checkout/${orderId}`,
      );

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ثبت سفارش انجام نشد. دوباره تلاش کنید.";

      setCheckoutError(message);
      setCreatingOrder(false);
    }
  }, [
    cart,
    creatingOrder,
    router,
  ]);

  /*
   * =========================================================
   * Auto Create After Login
   * =========================================================
   *
   * /cart
   *   ↓
   * login
   *   ↓
   * verify
   *   ↓
   * /cart?checkout=1
   *   ↓
   * create order
   *   ↓
   * /order/checkout/[id]
   */

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (
      checkoutCreationStartedRef.current
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search,
      );

    if (
      params.get("checkout") !== "1"
    ) {
      return;
    }

    if (!isAuthenticated()) {
      return;
    }

    if (cart.length === 0) {
      return;
    }

    checkoutCreationStartedRef.current =
      true;

    /*
     * پارامتر checkout فقط برای شروع
     * فرایند است.
     *
     * قبل از ساخت سفارش از URL حذف می‌شود
     * تا refresh باعث ساخت سفارش دوباره نشود.
     */

    params.delete("checkout");

    const cleanQuery =
      params.toString();

    const cleanUrl =
      window.location.pathname +
      (cleanQuery
        ? `?${cleanQuery}`
        : "");

    window.history.replaceState(
      window.history.state,
      "",
      cleanUrl,
    );

    void createCurrentOrder();
  }, [
    mounted,
    cart.length,
    createCurrentOrder,
  ]);

  /*
   * =========================================================
   * Continue Order
   * =========================================================
   */

  const handleContinueOrder = () => {
    if (
      creatingOrder ||
      cart.length === 0
    ) {
      return;
    }

    setCheckoutError(null);

    /*
     * کاربر لاگین نیست.
     * بعد از Verify دوباره به Cart برمی‌گردد.
     */

    if (!isAuthenticated()) {
      const params =
        new URLSearchParams(
          window.location.search,
        );

      params.set("checkout", "1");

      const nextUrl =
        window.location.pathname +
        `?${params.toString()}`;

      router.push(
        `/accounts/login?next=${encodeURIComponent(
          nextUrl,
        )}`,
      );

      return;
    }

    /*
     * کاربر لاگین است:
     * همین الان Order اولیه ساخته می‌شود.
     */

    void createCurrentOrder();
  };

  /*
   * =========================================================
   * Initial Loading
   * =========================================================
   */

  if (!mounted) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#f7f7f8]"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded-xl bg-zinc-200" />

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px]">
            <div className="h-[420px] animate-pulse rounded-3xl bg-white" />
            <div className="h-[320px] animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * Empty Cart
   * =========================================================
   */

  if (cart.length === 0) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#f7f7f8]"
      >
        <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
              <ShoppingBag
                size={32}
                strokeWidth={1.7}
                className="text-zinc-700"
              />
            </div>

            <h1 className="mt-7 text-2xl font-black tracking-tight text-zinc-900">
              سبد خرید خالی است
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
              هنوز محصولی به سبد خرید اضافه
              نکرده‌اید. محصولات موردنظرتان را
              انتخاب کنید تا اینجا نمایش داده شوند.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-zinc-900 px-6 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              ادامه خرید
              <ArrowLeft size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * Render
   * =========================================================
   */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f7f8] text-zinc-900"
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-32 pt-5 sm:px-6 lg:px-8">

        {/* Header */}

        <header className="mb-7">
          <div className="flex items-center justify-between gap-4">

            <Link
              href="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100"
              aria-label="ادامه خرید"
            >
              <ArrowRight size={19} />
            </Link>

            <div className="flex-1 text-center">
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                سبد خرید
              </h1>

              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                {totals.quantity.toLocaleString(
                  "fa-IR",
                )}{" "}
                کالا در سبد خرید شما
              </p>
            </div>

            <button
              type="button"
              onClick={handleClear}
              disabled={creatingOrder}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium text-zinc-500 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={15} />

              <span className="hidden sm:inline">
                پاک کردن
              </span>
            </button>
          </div>
        </header>

        {/* Error */}

        {checkoutError && (
          <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {checkoutError}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px]">

          {/* Products */}

          <section className="min-w-0 rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold sm:text-lg">
                  محصولات
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  محصولات انتخاب‌شده برای خرید
                </p>
              </div>

              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600">
                {cart.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                مورد
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {cart.map((item) => {
                const image =
                  getItemImage(item);

                const isRemoving =
                  removingKey === item.key;

                const unitPrice =
                  Number(
                    item.unit_price ||
                      item.sale?.selling_price ||
                      0,
                  );

                const itemTotal =
                  Number(
                    item.total_price || 0,
                  );

                return (
                  <article
                    key={item.key}
                    className={`py-5 first:pt-0 last:pb-0 transition-all duration-200 ${
                      isRemoving
                        ? "translate-x-3 opacity-0"
                        : "translate-x-0 opacity-100"
                    }`}
                  >
                    <div className="flex gap-3 sm:gap-5">

                      <Link
                        href={`/product/${item.product.slug}`}
                        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 sm:h-32 sm:w-32"
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt={
                              item.product.title
                            }
                            fill
                            className="object-cover transition duration-500 hover:scale-105"
                            sizes="(max-width: 640px) 96px, 128px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400">
                            <ShoppingBag size={25} />
                          </div>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <Link
                              href={`/product/${item.product.slug}`}
                              className="line-clamp-2 text-sm font-bold leading-6 text-zinc-900 transition hover:text-zinc-600 sm:text-base"
                            >
                              {item.product.title}
                            </Link>

                            {item.product.brand?.name && (
                              <p className="mt-1 text-xs text-zinc-500">
                                {
                                  item.product.brand
                                    .name
                                }
                              </p>
                            )}

                            {item.variant?.title && (
                              <div className="mt-2 inline-flex max-w-full rounded-lg bg-zinc-100 px-2.5 py-1">
                                <span className="truncate text-[11px] font-medium text-zinc-600">
                                  {
                                    item.variant
                                      .title
                                  }
                                </span>
                              </div>
                            )}

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(
                                item.key,
                              )
                            }
                            disabled={
                              creatingOrder
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="حذف محصول"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                        <div className="mt-auto pt-4">

                          <div className="flex flex-wrap items-end justify-between gap-3">

                            <div className="flex h-10 items-center rounded-xl bg-zinc-100 p-1">

                              <button
                                type="button"
                                onClick={() =>
                                  handleIncrease(
                                    item,
                                  )
                                }
                                disabled={
                                  creatingOrder
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-white disabled:opacity-40"
                                aria-label="افزایش تعداد"
                              >
                                <Plus size={16} />
                              </button>

                              <span className="min-w-10 text-center text-xs font-bold">
                                {getQuantityText(
                                  item.quantity,
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDecrease(
                                    item,
                                  )
                                }
                                disabled={
                                  creatingOrder
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-white disabled:opacity-40"
                                aria-label="کاهش تعداد"
                              >
                                <Minus size={16} />
                              </button>

                            </div>

                            <div className="text-left">

                              {item.sale?.unit
                                ?.name && (
                                <p className="mb-1 text-[10px] text-zinc-400">
                                  {formatPrice(
                                    unitPrice,
                                  )}{" "}
                                  تومان /{" "}
                                  {
                                    item.sale
                                      .unit
                                      .name
                                  }
                                </p>
                              )}

                              <p className="text-base font-black tracking-tight sm:text-lg">
                                {formatPrice(
                                  itemTotal,
                                )}

                                <span className="mr-1 text-[10px] font-normal text-zinc-500">
                                  تومان
                                </span>
                              </p>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Summary */}

          <aside className="lg:sticky lg:top-6 lg:h-fit">

            <section className="overflow-hidden rounded-3xl bg-zinc-900 text-white shadow-[0_15px_50px_rgba(0,0,0,0.12)]">

              <div className="p-5 sm:p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <ShoppingBag size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold">
                      خلاصه سفارش
                    </h2>

                    <p className="mt-1 text-[11px] text-zinc-400">
                      قبل از ادامه، سفارش خود را بررسی کنید.
                    </p>
                  </div>

                </div>

                <div className="mt-7 space-y-4">

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">
                      تعداد کالا
                    </span>

                    <span className="font-semibold">
                      {totals.quantity.toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">
                      جمع محصولات
                    </span>

                    <span className="font-semibold">
                      {formatPrice(
                        totals.subtotal,
                      )}{" "}
                      تومان
                    </span>
                  </div>

                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="flex items-end justify-between gap-4">

                  <div>
                    <p className="text-xs text-zinc-400">
                      مبلغ سفارش
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-tight">
                      {formatPrice(
                        totals.total,
                      )}
                    </p>
                  </div>

                  <span className="mb-1 text-xs text-zinc-400">
                    تومان
                  </span>

                </div>

                <button
                  type="button"
                  onClick={handleContinueOrder}
                  disabled={creatingOrder}
                  className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creatingOrder ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      در حال آماده‌سازی سفارش...
                    </>
                  ) : (
                    <>
                      ادامه و تکمیل سفارش
                      <ArrowLeft size={18} />
                    </>
                  )}
                </button>

                <div className="mt-5 grid grid-cols-2 gap-2">

                  <div className="rounded-2xl bg-white/5 p-3">
                    <Truck
                      size={16}
                      className="mb-2 text-zinc-300"
                    />

                    <p className="text-[10px] leading-4 text-zinc-400">
                      انتخاب روش ارسال
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-3">
                    <ShieldCheck
                      size={16}
                      className="mb-2 text-zinc-300"
                    />

                    <p className="text-[10px] leading-4 text-zinc-400">
                      پرداخت امن
                    </p>
                  </div>

                </div>
              </div>
            </section>

            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-xs text-zinc-500 shadow-[0_5px_20px_rgba(0,0,0,0.03)]">
              <Tag
                size={16}
                className="shrink-0 text-zinc-400"
              />

              <span>
                کد تخفیف را در مرحله تکمیل سفارش وارد کنید.
              </span>
            </div>

          </aside>
        </div>
      </div>

      {/* Mobile Bottom Checkout */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">

          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-zinc-500">
              مبلغ سفارش
            </p>

            <p className="truncate text-lg font-black">
              {formatPrice(
                totals.total,
              )}

              <span className="mr-1 text-[10px] font-normal text-zinc-500">
                تومان
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleContinueOrder}
            disabled={creatingOrder}
            className="flex h-12 shrink-0 items-center gap-1.5 rounded-2xl bg-zinc-900 px-5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {creatingOrder ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                در حال آماده‌سازی
              </>
            ) : (
              <>
                تکمیل سفارش
                <ArrowLeft size={16} />
              </>
            )}
          </button>

        </div>
      </div>
    </main>
  );
}
