// ============================================================
// Shopping Cart - Local Storage
// ============================================================

import type {
  Brand,
  Category,
  FeatureValue,
  GalleryImage,
  Inventory,
  PricingTier,
  ProductDetail,
  ProductDiscount,
  ProductFeature,
  ProductSale,
  ProductVariant,
  SaleType,
  Unit,
  VariantFeature,
} from "./productDetail";

// ============================================================
// Constants
// ============================================================

const CART_STORAGE_KEY = "aramis_shop_cart";

const CART_UPDATED_EVENT = "aramis:cart-updated";

// ============================================================
// Snapshot Types
// ============================================================

export interface CartProductSnapshot {
  id: number;

  title: string;

  slug: string;

  status: string;

  cover_image: string | null;

  brand: Brand | null;

  categories: Category[];

  features: ProductFeature[];

  gallery: GalleryImage[];

  pdf: string | null;

  video_file: string | null;

  video_url: string | null;

  discounts: ProductDiscount[];
}

export interface CartVariantSnapshot {
  id: number;

  title: string;

  sku: string;

  barcode: string | null;

  features: VariantFeature[];

  is_available: boolean;

  price: string | null;

  min_price: string | null;

  max_price: string | null;
}

export interface CartSaleSnapshot {
  id: number;

  sale_type: SaleType;

  unit: Unit;

  selling_price: string;

  purchase_step: number;

  minimum_quantity: number;

  maximum_quantity: number | null;

  inventory: Inventory | null;

  is_available: boolean;

  pricing_tiers: PricingTier[];
}

// ============================================================
// Cart Item
// ============================================================

export interface CartItem {
  /**
   * شناسه یکتا برای همین ترکیب:
   *
   * product + variant + sale + selected features
   */
  key: string;

  /**
   * زمان اضافه شدن به سبد
   */
  added_at: string;

  /**
   * اطلاعات اصلی محصول
   */
  product: CartProductSnapshot;

  /**
   * آیا محصول Variant دارد؟
   */
  has_variants: boolean;

  /**
   * Variant انتخاب شده
   */
  variant: CartVariantSnapshot | null;

  /**
   * ویژگی‌هایی که کاربر انتخاب کرده
   *
   * مثال:
   * {
   *   1: [10],
   *   2: [20]
   * }
   */
  selected_variant_features: Record<number, number[]>;

  /**
   * نوع فروش انتخاب شده
   */
  sale: CartSaleSnapshot;

  /**
   * تعداد
   */
  quantity: number;

  /**
   * قیمت واحد نهایی در لحظه آخر محاسبه
   */
  unit_price: string;

  /**
   * قیمت کل نهایی
   */
  total_price: string;
}

// ============================================================
// Helpers
// ============================================================

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeNumber(
  value: unknown,
  fallback = 0
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function sortNumbers(values: number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

function normalizeFeatureSelection(
  selection: Record<number, number[]>
): Record<number, number[]> {
  const result: Record<number, number[]> = {};

  Object.keys(selection)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((featureId) => {
      result[featureId] = sortNumbers(
        selection[featureId] ?? []
      );
    });

  return result;
}

// ============================================================
// Discount
// ============================================================

/**
 * از بین تخفیف‌های فعال محصول، بیشترین درصد را انتخاب می‌کند.
 *
 * تخفیف‌ها از API فقط در صورتی ارسال می‌شوند که فعال باشند.
 * برای جلوگیری از تخفیف اشتباه، تخفیف‌ها با هم جمع نمی‌شوند.
 */
export function getProductDiscountPercentage(
  discounts: ProductDiscount[] | null | undefined
): number {
  if (!discounts || discounts.length === 0) {
    return 0;
  }

  let maximumPercentage = 0;

  for (const discount of discounts) {
    const percentage = normalizeNumber(
      discount.percentage,
      0
    );

    if (
      Number.isFinite(percentage) &&
      percentage > maximumPercentage &&
      percentage > 0 &&
      percentage <= 100
    ) {
      maximumPercentage = percentage;
    }
  }

  return maximumPercentage;
}

/**
 * اعمال درصد تخفیف روی قیمت.
 */
export function applyProductDiscount(
  price: number,
  discounts: ProductDiscount[] | null | undefined
): number {
  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return price;
  }

  const percentage =
    getProductDiscountPercentage(discounts);

  if (percentage <= 0) {
    return price;
  }

  const discountedPrice =
    price * (1 - percentage / 100);

  return Math.max(0, discountedPrice);
}

// ============================================================
// Price
// ============================================================

export function getCartPriceForQuantity(
  sale: ProductSale,
  quantity: number,
  discounts: ProductDiscount[] = []
): number {
  const basePrice = normalizeNumber(
    sale.selling_price
  );

  let price = basePrice;

  if (sale.pricing_tiers?.length) {
    const tiers = [...sale.pricing_tiers].sort(
      (a, b) =>
        a.min_quantity - b.min_quantity
    );

    let matchedPrice = basePrice;

    for (const tier of tiers) {
      const min = normalizeNumber(
        tier.min_quantity
      );

      const max =
        tier.max_quantity === null
          ? null
          : normalizeNumber(
              tier.max_quantity
            );

      if (quantity < min) {
        break;
      }

      if (
        max === null ||
        quantity <= max
      ) {
        const tierPrice = normalizeNumber(
          tier.price,
          NaN
        );

        if (Number.isFinite(tierPrice)) {
          matchedPrice = tierPrice;
        }
      }
    }

    price = matchedPrice;
  }

  // ----------------------------------------------------------
  // اعمال تخفیف محصول بعد از تعیین قیمت Tier
  // ----------------------------------------------------------

  return applyProductDiscount(
    price,
    discounts
  );
}

// ============================================================
// Inventory / Maximum
// ============================================================

export function getCartMaximumQuantity(
  sale: ProductSale
): number | null {
  const saleMaximum =
    sale.maximum_quantity;

  const inventoryQuantity =
    sale.inventory?.quantity !== undefined &&
    sale.inventory?.quantity !== null
      ? normalizeNumber(
          sale.inventory.quantity,
          NaN
        )
      : null;

  const hasInventoryLimit =
    inventoryQuantity !== null &&
    Number.isFinite(inventoryQuantity);

  if (
    saleMaximum === null &&
    !hasInventoryLimit
  ) {
    return null;
  }

  if (saleMaximum === null) {
    return inventoryQuantity;
  }

  if (!hasInventoryLimit) {
    return saleMaximum;
  }

  return Math.min(
    saleMaximum,
    inventoryQuantity
  );
}

// ============================================================
// Cart Key
// ============================================================

export function createCartItemKey(params: {
  productId: number;

  variantId: number | null;

  saleId: number;

  selectedVariantFeatures: Record<
    number,
    number[]
  >;
}): string {
  const normalizedFeatures =
    normalizeFeatureSelection(
      params.selectedVariantFeatures
    );

  return JSON.stringify({
    product: params.productId,
    variant: params.variantId,
    sale: params.saleId,
    features: normalizedFeatures,
  });
}

// ============================================================
// Product Snapshot
// ============================================================

function createProductSnapshot(
  product: ProductDetail
): CartProductSnapshot {
  return {
    id: product.id,

    title: product.title,

    slug: product.slug,

    status: product.status,

    cover_image: product.cover_image,

    brand: product.brand,

    categories: product.categories ?? [],

    features: product.features ?? [],

    gallery: product.gallery ?? [],

    pdf: product.pdf,

    video_file: product.video_file,

    video_url: product.video_url,

    discounts: product.discounts ?? [],
  };
}

// ============================================================
// Variant Snapshot
// ============================================================

function createVariantSnapshot(
  variant: ProductVariant | null
): CartVariantSnapshot | null {
  if (!variant) {
    return null;
  }

  return {
    id: variant.id,

    title: variant.title,

    sku: variant.sku,

    barcode: variant.barcode,

    features: variant.features ?? [],

    is_available: variant.is_available,

    price: variant.price,

    min_price: variant.min_price,

    max_price: variant.max_price,
  };
}

// ============================================================
// Sale Snapshot
// ============================================================

function createSaleSnapshot(
  sale: ProductSale
): CartSaleSnapshot {
  return {
    id: sale.id,

    sale_type: sale.sale_type,

    unit: sale.unit,

    selling_price: sale.selling_price,

    purchase_step: sale.purchase_step,

    minimum_quantity:
      sale.minimum_quantity,

    maximum_quantity:
      sale.maximum_quantity,

    inventory: sale.inventory,

    is_available: !!sale.is_available,

    pricing_tiers:
      sale.pricing_tiers ?? [],
  };
}

// ============================================================
// Read Cart
// ============================================================

export function getCart(): CartItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        CART_STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as CartItem[];
  } catch (error) {
    console.error(
      "خطا در خواندن سبد خرید:",
      error
    );

    return [];
  }
}

// ============================================================
// Save Cart
// ============================================================

function saveCart(
  cart: CartItem[]
): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new CustomEvent(
        CART_UPDATED_EVENT,
        {
          detail: cart,
        }
      )
    );
  } catch (error) {
    console.error(
      "خطا در ذخیره سبد خرید:",
      error
    );
  }
}

// ============================================================
// Cart Count
// ============================================================

export function getCartItemCount(): number {
  return getCart().reduce(
    (total, item) =>
      total +
      normalizeNumber(item.quantity),
    0
  );
}

export function getCartUniqueItemCount(): number {
  return getCart().length;
}

// ============================================================
// Add To Cart
// ============================================================

export interface AddToCartParams {
  product: ProductDetail;

  variant: ProductVariant | null;

  selectedVariantFeatures: Record<
    number,
    number[]
  >;

  sale: ProductSale;

  quantity: number;
}

export interface AddToCartResult {
  success: boolean;

  item: CartItem | null;

  message: string;
}

export function addToCart(
  params: AddToCartParams
): AddToCartResult {
  const {
    product,
    variant,
    selectedVariantFeatures,
    sale,
  } = params;

  let quantity = normalizeNumber(
    params.quantity,
    0
  );

  const minimumQuantity =
    Math.max(
      1,
      normalizeNumber(
        sale.minimum_quantity,
        1
      )
    );

  const purchaseStep =
    Math.max(
      1,
      normalizeNumber(
        sale.purchase_step,
        1
      )
    );

  if (!sale.is_available) {
    return {
      success: false,
      item: null,
      message:
        "این گزینه در حال حاضر موجود نیست.",
    };
  }

  if (
    variant &&
    !variant.is_available
  ) {
    return {
      success: false,
      item: null,
      message:
        "این مدل محصول در حال حاضر موجود نیست.",
    };
  }

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return {
      success: false,
      item: null,
      message:
        "تعداد انتخاب‌شده معتبر نیست.",
    };
  }

  if (
    quantity < minimumQuantity
  ) {
    quantity = minimumQuantity;
  }

  // ==========================================================
  // هماهنگ کردن تعداد با purchase_step
  // ==========================================================

  const remainder =
    (quantity - minimumQuantity) %
    purchaseStep;

  if (remainder !== 0) {
    quantity =
      minimumQuantity +
      Math.ceil(
        (quantity -
          minimumQuantity) /
          purchaseStep
      ) *
        purchaseStep;
  }

  const maximumQuantity =
    getCartMaximumQuantity(sale);

  if (
    maximumQuantity !== null &&
    quantity > maximumQuantity
  ) {
    return {
      success: false,
      item: null,
      message: `حداکثر تعداد قابل خرید ${maximumQuantity} است.`,
    };
  }

  const key = createCartItemKey({
    productId: product.id,

    variantId:
      variant?.id ?? null,

    saleId: sale.id,

    selectedVariantFeatures,
  });

  const cart = getCart();

  const existingIndex =
    cart.findIndex(
      (item) => item.key === key
    );

  // ==========================================================
  // Discount
  // ==========================================================

  const discounts =
    product.discounts ?? [];

  // ==========================================================
  // Existing Item
  // ==========================================================

  if (existingIndex !== -1) {
    const existing =
      cart[existingIndex];

    const newQuantity =
      existing.quantity + quantity;

    if (
      maximumQuantity !== null &&
      newQuantity > maximumQuantity
    ) {
      return {
        success: false,
        item: existing,
        message: `حداکثر تعداد قابل خرید ${maximumQuantity} است.`,
      };
    }

    const unitPrice =
      getCartPriceForQuantity(
        sale,
        newQuantity,
        discounts
      );

    const updatedItem: CartItem = {
      ...existing,

      quantity: newQuantity,

      unit_price:
        String(unitPrice),

      total_price:
        String(
          unitPrice *
            newQuantity
        ),

      // اطلاعات تخفیف را در صورت تغییر
      // محصول به‌روز نگه می‌داریم.
      product: {
        ...existing.product,

        discounts,
      },
    };

    cart[existingIndex] =
      updatedItem;

    saveCart(cart);

    return {
      success: true,

      item: updatedItem,

      message:
        "تعداد محصول در سبد خرید افزایش یافت.",
    };
  }

  // ==========================================================
  // New Item
  // ==========================================================

  const unitPrice =
    getCartPriceForQuantity(
      sale,
      quantity,
      discounts
    );

  const item: CartItem = {
    key,

    added_at:
      new Date().toISOString(),

    product:
      createProductSnapshot(
        product
      ),

    has_variants:
      product.has_variants &&
      product.variants.length > 0,

    variant:
      createVariantSnapshot(
        variant
      ),

    selected_variant_features:
      normalizeFeatureSelection(
        selectedVariantFeatures
      ),

    sale:
      createSaleSnapshot(
        sale
      ),

    quantity,

    unit_price:
      String(unitPrice),

    total_price:
      String(
        unitPrice *
          quantity
      ),
  };

  cart.push(item);

  saveCart(cart);

  return {
    success: true,

    item,

    message:
      "محصول به سبد خرید اضافه شد.",
  };
}

// ============================================================
// Update Quantity
// ============================================================

export function updateCartItemQuantity(
  key: string,
  quantity: number
): CartItem | null {
  const cart = getCart();

  const index =
    cart.findIndex(
      (item) =>
        item.key === key
    );

  if (index === -1) {
    return null;
  }

  const item = cart[index];

  const minimum =
    Math.max(
      1,
      normalizeNumber(
        item.sale.minimum_quantity,
        1
      )
    );

  const step =
    Math.max(
      1,
      normalizeNumber(
        item.sale.purchase_step,
        1
      )
    );

  let nextQuantity =
    normalizeNumber(
      quantity,
      minimum
    );

  if (
    nextQuantity < minimum
  ) {
    nextQuantity = minimum;
  }

  const maximum =
    item.sale.maximum_quantity !==
    null
      ? normalizeNumber(
          item.sale.maximum_quantity,
          Infinity
        )
      : Infinity;

  const inventoryMaximum =
    item.sale.inventory
      ?.quantity !== undefined &&
    item.sale.inventory
      ?.quantity !== null
      ? normalizeNumber(
          item.sale.inventory
            .quantity,
          Infinity
        )
      : Infinity;

  const finalMaximum =
    Math.min(
      maximum,
      inventoryMaximum
    );

  if (
    Number.isFinite(
      finalMaximum
    )
  ) {
    nextQuantity =
      Math.min(
        nextQuantity,
        finalMaximum
      );
  }

  // ==========================================================
  // هماهنگ کردن تعداد با purchase_step
  // ==========================================================

  const remainder =
    (nextQuantity -
      minimum) %
    step;

  if (remainder !== 0) {
    nextQuantity =
      minimum +
      Math.floor(
        (nextQuantity -
          minimum) /
          step
      ) *
        step;
  }

  // ==========================================================
  // تخفیف محصول
  // ==========================================================

  const discounts =
    item.product.discounts ??
    [];

  // ==========================================================
  // قیمت نهایی بر اساس تعداد + Tier + Discount
  // ==========================================================

  const unitPrice =
    getCartPriceForQuantity(
      item.sale as ProductSale,
      nextQuantity,
      discounts
    );

  const updatedItem: CartItem = {
    ...item,

    quantity: nextQuantity,

    unit_price:
      String(unitPrice),

    total_price:
      String(
        unitPrice *
          nextQuantity
      ),
  };

  cart[index] =
    updatedItem;

  saveCart(cart);

  return updatedItem;
}

// ============================================================
// Remove
// ============================================================

export function removeFromCart(
  key: string
): boolean {
  const cart = getCart();

  const nextCart =
    cart.filter(
      (item) =>
        item.key !== key
    );

  if (
    nextCart.length ===
    cart.length
  ) {
    return false;
  }

  saveCart(nextCart);

  return true;
}

// ============================================================
// Clear
// ============================================================

export function clearCart(): void {
  saveCart([]);
}

// ============================================================
// Totals
// ============================================================

export interface CartTotals {
  unique_items: number;

  total_quantity: number;

  subtotal: number;
}

export function getCartTotals(): CartTotals {
  const cart = getCart();

  return cart.reduce<CartTotals>(
    (totals, item) => {
      totals.unique_items += 1;

      totals.total_quantity +=
        normalizeNumber(
          item.quantity
        );

      totals.subtotal +=
        normalizeNumber(
          item.total_price
        );

      return totals;
    },
    {
      unique_items: 0,

      total_quantity: 0,

      subtotal: 0,
    }
  );
}

// ============================================================
// Subscription
// ============================================================

export function subscribeToCart(
  callback: (
    cart: CartItem[]
  ) => void
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const handleStorage = (
    event: StorageEvent
  ) => {
    if (
      event.key ===
      CART_STORAGE_KEY
    ) {
      callback(getCart());
    }
  };

  const handleCartUpdated =
    () => {
      callback(getCart());
    };

  window.addEventListener(
    "storage",
    handleStorage
  );

  window.addEventListener(
    CART_UPDATED_EVENT,
    handleCartUpdated
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage
    );

    window.removeEventListener(
      CART_UPDATED_EVENT,
      handleCartUpdated
    );
  };
}

// ============================================================
// Storage Key
// ============================================================

export {
  CART_STORAGE_KEY,
};