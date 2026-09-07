"use client";

import { Icon } from "./icons";
import { CATEGORY_ICON_MAP } from "./icons";
import { Product, fmtPrice } from "./data";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon.Star key={n} filled={n <= Math.round(rating)} className="h-3.5 w-3.5" />
      ))}
    </div>
  );
}

function ProductImagePlaceholder({ icon, hue, badge }: { icon: string; hue: string; badge?: string }) {
  const IconComp = CATEGORY_ICON_MAP[icon] ?? Icon.Grid;
  return (
    <div className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${hue}`}>
      <IconComp className="h-9 w-9 opacity-70" />
      {badge && (
        <span className="absolute right-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-rose-600 shadow-sm dark:bg-stone-900/90">
          {badge}
        </span>
      )}
      <button
        aria-label="افزودن به علاقه‌مندی‌ها"
        className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow-sm transition-colors hover:text-rose-600 dark:bg-stone-900/90 dark:text-stone-300"
      >
        <Icon.Heart className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(100 - (product.price / product.oldPrice) * 100)
      : undefined;

  return (
    <div className="group flex w-full shrink-0 flex-col rounded-2xl border border-stone-100 bg-white p-2.5 transition-shadow hover:shadow-lg hover:shadow-stone-900/5 sm:w-auto dark:border-stone-800 dark:bg-stone-900">
      <div className="relative">
        <ProductImagePlaceholder icon={product.icon} hue={product.hue} badge={discount ? `٪${discount.toLocaleString("fa-IR")}−` : undefined} />
        {typeof rank === "number" && (
          <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/85 text-[13px] font-bold text-white dark:bg-white/90 dark:text-stone-900">
            {rank.toLocaleString("fa-IR")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pt-3">
        <h3 className="line-clamp-2 min-h-[2.6em] text-[13.5px] leading-snug text-stone-800 dark:text-stone-100">{product.title}</h3>
        {product.rating && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Stars rating={product.rating} />
            {product.ratingCount && <span className="text-[11.5px] text-stone-400">({product.ratingCount.toLocaleString("fa-IR")})</span>}
          </div>
        )}
        {product.sold && (
          <p className="mt-1.5 text-[12px] text-stone-400">{product.sold.toLocaleString("fa-IR")}+ فروش</p>
        )}
        <div className="mt-auto flex items-end justify-between pt-2.5">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-[11.5px] text-stone-400 line-through">{fmtPrice(product.oldPrice)}</span>
            )}
            <span className="text-[15px] font-bold text-stone-900 dark:text-white">
              {fmtPrice(product.price)} <span className="text-[11px] font-normal text-stone-500">تومان</span>
            </span>
          </div>
          <button
            aria-label="افزودن به سبد خرید"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white transition-colors hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            <Icon.Cart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductRail({ products, ranked = false }: { products: Product[]; ranked?: boolean }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-5">
      {products.map((p, i) => (
        <div key={p.id} className="w-[46%] shrink-0 sm:w-auto">
          <ProductCard product={p} rank={ranked ? i + 1 : undefined} />
        </div>
      ))}
    </div>
  );
}