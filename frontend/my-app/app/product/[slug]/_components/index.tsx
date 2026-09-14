
"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

import {
  getProductDetail,
  type FeatureValue,
  type ProductDetail,
  type ProductSale,
  type ProductVariant,
} from "@/lib/api/products/productDetail";

import {
  addToCart,
  getCartMaximumQuantity,
} from "@/lib/api/products/shopcart";

import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

interface ProductPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

type SelectedVariantFeatures = Record<number, number[]>;

/* ============================================================
   Helpers
============================================================ */

function arraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) {
    return false;
  }

  const first = [...a].sort((x, y) => x - y);
  const second = [...b].sort((x, y) => x - y);

  return first.every((value, index) => value === second[index]);
}

function getVariantFeatureValueIds(
  variant: ProductVariant,
  featureId: number
) {
  const feature = variant.features.find(
    (item) => item.feature.id === featureId
  );

  return feature?.feature_values.map((item) => item.id) ?? [];
}

function getSelectionFromVariant(
  variant: ProductVariant
): SelectedVariantFeatures {
  const selection: SelectedVariantFeatures = {};

  for (const feature of variant.features) {
    selection[feature.feature.id] = feature.feature_values.map(
      (value) => value.id
    );
  }

  return selection;
}

function getPreferredSale(
  sales: ProductSale[] | undefined | null
): ProductSale | null {
  if (!sales || sales.length === 0) {
    return null;
  }

  return sales.find((sale) => sale.is_available) ?? sales[0] ?? null;
}

function getInitialQuantity(sale: ProductSale | null) {
  if (!sale) {
    return 1;
  }

  return Math.max(1, sale.minimum_quantity || 1);
}

function getStepsFromSale(sale: ProductSale): number[] {
  const minimum = Math.max(1, sale.minimum_quantity || 1);
  const step = Math.max(1, sale.purchase_step || 1);
  const maximum = sale.maximum_quantity;

  if (maximum === null) {
    return [];
  }

  const count = Math.floor((maximum - minimum) / step) + 1;

  if (count > 50) {
    return [];
  }

  const steps: number[] = [];

  for (
    let quantity = minimum;
    quantity <= maximum;
    quantity += step
  ) {
    steps.push(quantity);
  }

  return steps;
}

function getPriceForQuantity(
  sale: ProductSale | null,
  quantity: number
): number | null {
  if (!sale) {
    return null;
  }

  const basePrice = Number(sale.selling_price);

  if (!Number.isFinite(basePrice)) {
    return null;
  }

  if (!sale.pricing_tiers || sale.pricing_tiers.length === 0) {
    return basePrice;
  }

  const sortedTiers = [...sale.pricing_tiers].sort(
    (a, b) => a.min_quantity - b.min_quantity
  );

  let matchedPrice: number | null = null;

  for (const tier of sortedTiers) {
    const min = tier.min_quantity;
    const max = tier.max_quantity;

    if (quantity < min) {
      break;
    }

    if (max === null || quantity <= max) {
      const price = Number(tier.price);

      if (Number.isFinite(price)) {
        matchedPrice = price;
      }
    }
  }

  return matchedPrice ?? basePrice;
}

/* ============================================================
   Discount Helpers
============================================================ */

function getBestDiscount(
  discounts: ProductDetail["discounts"] | undefined | null
) {
  if (!discounts || discounts.length === 0) {
    return null;
  }

  return (
    [...discounts].sort(
      (a, b) => Number(b.percentage) - Number(a.percentage)
    )[0] ?? null
  );
}

function getDiscountedPrice(
  price: number | null,
  percentage: string | number | null | undefined
): number | null {
  if (
    price === null ||
    !Number.isFinite(price) ||
    percentage === null ||
    percentage === undefined
  ) {
    return price;
  }

  const discountPercentage = Number(percentage);

  if (
    !Number.isFinite(discountPercentage) ||
    discountPercentage <= 0
  ) {
    return price;
  }

  const safePercentage = Math.min(discountPercentage, 100);

  return price * (1 - safePercentage / 100);
}

function formatPrice(price: number | null) {
  if (price === null || !Number.isFinite(price)) {
    return "—";
  }

  return new Intl.NumberFormat("fa-IR").format(price);
}

/* ============================================================
   Component
============================================================ */

export default function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = use(params);

  const [product, setProduct] =
    useState<ProductDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  const [selectedVariantFeatures, setSelectedVariantFeatures] =
    useState<SelectedVariantFeatures>({});

  const [selectedSale, setSelectedSale] =
    useState<ProductSale | null>(null);

  const [quantity, setQuantity] = useState(1);

  const [cartMessage, setCartMessage] =
    useState<string | null>(null);

  const [cartMessageType, setCartMessageType] =
    useState<"success" | "error">("success");

  /* ============================================================
     Fetch Product
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const data = await getProductDetail(slug);

        if (!mounted) {
          return;
        }

        setProduct(data);

        const firstImage =
          data.cover_image ??
          data.gallery?.[0]?.image ??
          null;

        setSelectedImage(firstImage);

        if (
          data.has_variants &&
          data.variants.length > 0
        ) {
          const initialVariant =
            data.variants.find(
              (variant) => variant.is_available
            ) ?? data.variants[0];

          setSelectedVariant(initialVariant);

          setSelectedVariantFeatures(
            getSelectionFromVariant(initialVariant)
          );

          const initialSale = getPreferredSale(
            initialVariant.sales
          );

          setSelectedSale(initialSale);

          setQuantity(
            getInitialQuantity(initialSale)
          );
        } else {
          setSelectedVariant(null);
          setSelectedVariantFeatures({});

          const initialSale = getPreferredSale(
            data.sales
          );

          setSelectedSale(initialSale);

          setQuantity(
            getInitialQuantity(initialSale)
          );
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            "دریافت اطلاعات محصول ناموفق بود."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  /* ============================================================
     Variant Feature Groups
  ============================================================ */

  const variantFeatureGroups = useMemo(() => {
    if (
      !product?.has_variants ||
      product.variants.length === 0
    ) {
      return [];
    }

    const groups = new Map<
      number,
      {
        feature: {
          id: number;
          name: string;
          key: string;
          type: string;
        };
        values: Map<number, FeatureValue>;
      }
    >();

    for (const variant of product.variants) {
      for (const variantFeature of variant.features) {
        const featureId = variantFeature.feature.id;

        if (!groups.has(featureId)) {
          groups.set(featureId, {
            feature: variantFeature.feature,
            values: new Map(),
          });
        }

        const group = groups.get(featureId)!;

        for (const value of variantFeature.feature_values) {
          group.values.set(value.id, value);
        }
      }
    }

    const productFeatureOrder = new Map(
      product.features.map((item, index) => [
        item.feature.id,
        item.sort_order ?? index,
      ])
    );

    return Array.from(groups.values())
      .map((group) => ({
        feature: group.feature,
        values: Array.from(
          group.values.values()
        ).sort(
          (a, b) => a.sort_order - b.sort_order
        ),
      }))
      .sort(
        (a, b) =>
          (productFeatureOrder.get(
            a.feature.id
          ) ?? 999999) -
          (productFeatureOrder.get(
            b.feature.id
          ) ?? 999999)
      );
  }, [product]);

  /* ============================================================
     Variant Selection Complete
  ============================================================ */

  const isVariantSelectionComplete = useMemo(() => {
    if (variantFeatureGroups.length === 0) {
      return true;
    }

    return variantFeatureGroups.every((group) => {
      const selected =
        selectedVariantFeatures[
          group.feature.id
        ] ?? [];

      return selected.length > 0;
    });
  }, [
    variantFeatureGroups,
    selectedVariantFeatures,
  ]);

  /* ============================================================
     Find Exact Variant
  ============================================================ */

  const matchingVariant = useMemo(() => {
    if (
      !product?.has_variants ||
      product.variants.length === 0
    ) {
      return null;
    }

    if (!isVariantSelectionComplete) {
      return null;
    }

    return (
      product.variants.find((variant) => {
        return variantFeatureGroups.every(
          (group) => {
            const selected =
              selectedVariantFeatures[
                group.feature.id
              ] ?? [];

            const variantValues =
              getVariantFeatureValueIds(
                variant,
                group.feature.id
              );

            return arraysEqual(
              selected,
              variantValues
            );
          }
        );
      }) ?? null
    );
  }, [
    product,
    variantFeatureGroups,
    selectedVariantFeatures,
    isVariantSelectionComplete,
  ]);

  /* ============================================================
     Apply Variant
  ============================================================ */

  useEffect(() => {
    if (!product) {
      return;
    }

    if (
      !product.has_variants ||
      product.variants.length === 0
    ) {
      const sale = getPreferredSale(
        product.sales
      );

      setSelectedVariant(null);
      setSelectedSale(sale);

      return;
    }

    if (!isVariantSelectionComplete) {
      setSelectedVariant(null);
      setSelectedSale(null);
      setQuantity(1);

      return;
    }

    if (!matchingVariant) {
      setSelectedVariant(null);
      setSelectedSale(null);
      setQuantity(1);

      return;
    }

    setSelectedVariant(matchingVariant);

    const sale = getPreferredSale(
      matchingVariant.sales
    );

    setSelectedSale(sale);

    setQuantity(
      getInitialQuantity(sale)
    );
  }, [
    product,
    matchingVariant,
    isVariantSelectionComplete,
  ]);

  /* ============================================================
     Available Sales
  ============================================================ */

  const availableSales = useMemo(() => {
    if (!product) {
      return [];
    }

    if (
      product.has_variants &&
      product.variants.length > 0
    ) {
      return selectedVariant?.sales ?? [];
    }

    return product.sales ?? [];
  }, [product, selectedVariant]);

  /* ============================================================
     Quantity
  ============================================================ */

  useEffect(() => {
    if (!selectedSale) {
      setQuantity(1);
      return;
    }

    const minimum = Math.max(
      1,
      selectedSale.minimum_quantity || 1
    );

    const maximum =
      getCartMaximumQuantity(selectedSale);

    setQuantity((current) => {
      if (current < minimum) {
        return minimum;
      }

      if (
        maximum !== null &&
        current > maximum
      ) {
        return maximum;
      }

      return current;
    });
  }, [selectedSale?.id]);

  const quantityStep = Math.max(
    1,
    selectedSale?.purchase_step || 1
  );

  const quantityMinimum = Math.max(
    1,
    selectedSale?.minimum_quantity || 1
  );

  const quantityMaximum = selectedSale
    ? getCartMaximumQuantity(selectedSale)
    : null;

  const canDecrease =
    !!selectedSale &&
    quantity - quantityStep >=
      quantityMinimum;

  const canIncrease =
    !!selectedSale &&
    (
      quantityMaximum === null ||
      quantity + quantityStep <=
        quantityMaximum
    );

  const pricingSteps = selectedSale
    ? getStepsFromSale(selectedSale)
    : [];

  /* ============================================================
     Price
  ============================================================ */

  const currentPrice = useMemo(() => {
    return getPriceForQuantity(
      selectedSale,
      quantity
    );
  }, [selectedSale, quantity]);

  /* ============================================================
     Active Discount
  ============================================================ */

  const activeDiscount = useMemo(() => {
    return getBestDiscount(
      product?.discounts
    );
  }, [product?.discounts]);

  const discountedPrice = useMemo(() => {
    if (currentPrice === null) {
      return null;
    }

    return getDiscountedPrice(
      currentPrice,
      activeDiscount?.percentage
    );
  }, [
    currentPrice,
    activeDiscount,
  ]);

  const hasDiscount =
    !!activeDiscount &&
    currentPrice !== null &&
    discountedPrice !== null &&
    discountedPrice < currentPrice;

  const discountAmount =
    hasDiscount &&
    currentPrice !== null &&
    discountedPrice !== null
      ? currentPrice - discountedPrice
      : 0;

  /* ============================================================
     Variant Value Availability
  ============================================================ */

  function isVariantPossible(
    selection: SelectedVariantFeatures
  ) {
    if (
      !product ||
      product.variants.length === 0
    ) {
      return false;
    }

    return product.variants.some((variant) => {
      return Object.entries(selection).every(
        ([featureIdString, selectedValues]) => {
          const featureId =
            Number(featureIdString);

          if (selectedValues.length === 0) {
            return true;
          }

          const variantValues =
            getVariantFeatureValueIds(
              variant,
              featureId
            );

          const group =
            variantFeatureGroups.find(
              (item) =>
                item.feature.id === featureId
            );

          if (!group) {
            return true;
          }

          if (
            group.feature.type ===
            "multi_select"
          ) {
            return selectedValues.every((id) =>
              variantValues.includes(id)
            );
          }

          return arraysEqual(
            selectedValues,
            variantValues
          );
        }
      );
    });
  }

  function isValueAvailable(
    featureId: number,
    valueId: number
  ) {
    const group =
      variantFeatureGroups.find(
        (item) =>
          item.feature.id === featureId
      );

    if (!group) {
      return false;
    }

    const currentValues =
      selectedVariantFeatures[featureId] ?? [];

    let nextValues: number[];

    if (
      group.feature.type ===
      "multi_select"
    ) {
      if (currentValues.includes(valueId)) {
        nextValues = currentValues.filter(
          (id) => id !== valueId
        );
      } else {
        nextValues = [
          ...currentValues,
          valueId,
        ];
      }
    } else {
      nextValues = [valueId];
    }

    const nextSelection = {
      ...selectedVariantFeatures,
      [featureId]: nextValues,
    };

    return isVariantPossible(
      nextSelection
    );
  }

  function handleVariantValueChange(
    featureId: number,
    valueId: number
  ) {
    const group =
      variantFeatureGroups.find(
        (item) =>
          item.feature.id === featureId
      );

    if (!group) {
      return;
    }

    const currentValues =
      selectedVariantFeatures[featureId] ?? [];

    let nextValues: number[];

    if (
      group.feature.type ===
      "multi_select"
    ) {
      if (currentValues.includes(valueId)) {
        nextValues = currentValues.filter(
          (id) => id !== valueId
        );
      } else {
        nextValues = [
          ...currentValues,
          valueId,
        ];
      }
    } else {
      nextValues = [valueId];
    }

    const nextSelection = {
      ...selectedVariantFeatures,
      [featureId]: nextValues,
    };

    setSelectedVariantFeatures(
      nextSelection
    );
  }

  /* ============================================================
     Availability
  ============================================================ */

  const hasVariants =
    product?.has_variants &&
    product.variants.length > 0;

  const selectedVariantAvailable =
    !hasVariants ||
    (selectedVariant?.is_available ??
      false);

  const saleAvailable =
    !!selectedSale &&
    selectedSale.is_available;

  const canAddToCart =
    !!selectedSale &&
    saleAvailable &&
    selectedVariantAvailable &&
    isVariantSelectionComplete &&
    quantity > 0 &&
    (
      quantityMaximum === null ||
      quantity <= quantityMaximum
    );

  /* ============================================================
     Add To Cart
  ============================================================ */

  function handleAddToCart() {
    if (!product || !selectedSale) {
      return;
    }

    setCartMessage(null);

    const result = addToCart({
      product,
      variant: selectedVariant,
      selectedVariantFeatures,
      sale: selectedSale,
      quantity,
    });

    if (!result.success) {
      setCartMessageType("error");
      setCartMessage(result.message);
      return;
    }

    setCartMessageType("success");
    setCartMessage(result.message);

    window.setTimeout(() => {
      setCartMessage(null);
    }, 3500);
  }

  /* ============================================================
     Loading
  ============================================================ */

  if (loading) {
    return (
      <>
        <Header />

        <main className="flex min-h-[60vh] items-center justify-center">
          <div className="text-sm text-zinc-500">
            در حال دریافت اطلاعات محصول...
          </div>
        </main>

        <Footer />
      </>
    );
  }

  /* ============================================================
     Error
  ============================================================ */

  if (error || !product) {
    return (
      <>
        <Header />

        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <p className="text-sm text-red-500">
              {error ??
                "محصول پیدا نشد."}
            </p>

            <Link
              href="/"
              className="mt-5 inline-flex text-sm text-zinc-900 underline underline-offset-4"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  /* ============================================================
     Render
  ============================================================ */

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white text-zinc-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

          {/* Breadcrumb */}

          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <Link
              href="/"
              className="transition hover:text-zinc-900"
            >
              خانه
            </Link>

            <span>/</span>

            <span className="text-zinc-900">
              {product.title}
            </span>
          </nav>

          {/* Product Main */}

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">

            {/* Gallery */}

            <div className="min-w-0">
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
                <div className="relative aspect-square w-full">
                  {selectedImage ? (
                    <Image
                      src={selectedImage}
                      alt={product.title}
                      fill
                      priority
                      className="object-contain p-5 sm:p-8"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                      تصویری برای محصول وجود ندارد
                    </div>
                  )}
                </div>
              </div>

              {product.gallery &&
                product.gallery.length > 0 && (
                  <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6">
                    {product.gallery.map(
                      (image) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() =>
                            setSelectedImage(
                              image.image
                            )
                          }
                          className={`relative aspect-square overflow-hidden rounded-2xl border bg-zinc-50 transition ${
                            selectedImage ===
                            image.image
                              ? "border-zinc-950"
                              : "border-zinc-200 hover:border-zinc-400"
                          }`}
                        >
                          <Image
                            src={image.image}
                            alt={product.title}
                            fill
                            className="object-contain p-2"
                            sizes="100px"
                          />
                        </button>
                      )
                    )}
                  </div>
                )}
            </div>

            {/* Product Info */}

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">
                {product.brand && (
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                    {product.brand.name}
                  </span>
                )}

                {product.status && (
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                    {product.status}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-bold leading-9 tracking-tight sm:text-3xl">
                {product.title}
              </h1>

              {/* Variant Features */}

              {hasVariants &&
                variantFeatureGroups.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <div className="text-sm font-semibold">
                      انتخاب ویژگی محصول
                    </div>

                    {variantFeatureGroups.map(
                      (group) => {
                        const selectedValues =
                          selectedVariantFeatures[
                            group.feature.id
                          ] ?? [];

                        return (
                          <div
                            key={
                              group.feature.id
                            }
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-zinc-900">
                                {
                                  group.feature
                                    .name
                                }
                              </span>

                              {selectedValues.length >
                                0 && (
                                <span className="text-xs text-zinc-500">
                                  {selectedValues
                                    .map(
                                      (
                                        valueId
                                      ) => {
                                        const value =
                                          group.values.find(
                                            (
                                              item
                                            ) =>
                                              item.id ===
                                              valueId
                                          );

                                        return value?.value;
                                      }
                                    )
                                    .filter(Boolean)
                                    .join(
                                      "، "
                                    )}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {group.values.map(
                                (value) => {
                                  const isSelected =
                                    selectedValues.includes(
                                      value.id
                                    );

                                  const isAvailable =
                                    isValueAvailable(
                                      group
                                        .feature
                                        .id,
                                      value.id
                                    );

                                  return (
                                    <button
                                      key={
                                        value.id
                                      }
                                      type="button"
                                      disabled={
                                        !isAvailable &&
                                        !isSelected
                                      }
                                      onClick={() =>
                                        handleVariantValueChange(
                                          group
                                            .feature
                                            .id,
                                          value.id
                                        )
                                      }
                                      className={`rounded-xl border px-4 py-2.5 text-sm transition ${
                                        isSelected
                                          ? "border-zinc-950 bg-zinc-950 text-white"
                                          : isAvailable
                                            ? "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-500"
                                            : "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300"
                                      }`}
                                    >
                                      {value.value}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}

                    {isVariantSelectionComplete &&
                      !matchingVariant && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                          این ترکیب از ویژگی‌ها برای محصول موجود نیست.
                        </div>
                      )}
                  </div>
                )}

              {/* Selected Variant */}

              {hasVariants &&
                selectedVariant && (
                  <div className="mt-5 rounded-2xl bg-zinc-50 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-zinc-500">
                        مدل انتخاب‌شده
                      </div>

                      <div className="font-medium text-zinc-900">
                        {
                          selectedVariant.title
                        }
                      </div>
                    </div>

                    {selectedVariant.sku && (
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="text-zinc-500">
                          کد کالا
                        </div>

                        <div
                          dir="ltr"
                          className="font-medium text-zinc-700"
                        >
                          {selectedVariant.sku}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Sale Type */}

              {availableSales.length > 0 && (
                <div className="mt-8">
                  <label
                    htmlFor="sale-type"
                    className="mb-2 block text-sm font-medium"
                  >
                    نوع فروش
                  </label>

                  <select
                    id="sale-type"
                    value={
                      selectedSale?.id ?? ""
                    }
                    onChange={(event) => {
                      const saleId =
                        Number(
                          event.target.value
                        );

                      const sale =
                        availableSales.find(
                          (item) =>
                            item.id === saleId
                        ) ?? null;

                      setSelectedSale(sale);

                      setQuantity(
                        getInitialQuantity(
                          sale
                        )
                      );
                    }}
                    disabled={
                      availableSales.length <=
                      1
                    }
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 disabled:cursor-default disabled:bg-zinc-50"
                  >
                    {availableSales.map(
                      (sale) => (
                        <option
                          key={sale.id}
                          value={sale.id}
                        >
                          {
                            sale.sale_type
                              .name
                          }

                          {sale.unit?.name
                            ? ` - ${sale.unit.name}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {/* Price */}

              <div className="mt-8 rounded-3xl border border-zinc-200 p-5">
                {selectedSale ? (
                  <>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="text-xs text-zinc-500">
                          قیمت
                        </div>

                        {hasDiscount ? (
                          <>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <div className="text-2xl font-bold tracking-tight text-zinc-950">
                                {formatPrice(
                                  discountedPrice
                                )}
                              </div>

                              <div className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                {Number(
                                  activeDiscount?.percentage
                                ).toLocaleString(
                                  "fa-IR"
                                )}
                                ٪ تخفیف
                              </div>
                            </div>

                            <div className="mt-2 text-sm text-zinc-400 line-through">
                              {formatPrice(
                                currentPrice
                              )}
                            </div>

                            <div className="mt-2 text-xs text-emerald-600">
                              شما{" "}
                              {formatPrice(
                                discountAmount
                              )}{" "}
                              کمتر پرداخت می‌کنید.
                            </div>
                          </>
                        ) : (
                          <div className="mt-2 text-2xl font-bold tracking-tight">
                            {formatPrice(
                              currentPrice
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-zinc-500">
                        {selectedSale.unit?.name}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm">
                      <span className="text-zinc-500">
                        وضعیت موجودی
                      </span>

                      <span
                        className={
                          selectedSale.is_available
                            ? "font-medium text-emerald-600"
                            : "font-medium text-red-500"
                        }
                      >
                        {selectedSale.is_available
                          ? selectedSale.inventory
                            ? `موجودی: ${selectedSale.inventory.quantity}`
                            : "موجود"
                          : "ناموجود"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-zinc-500">
                    ابتدا ویژگی‌های محصول را انتخاب کنید.
                  </div>
                )}
              </div>

              {/* Quantity */}

              {selectedSale &&
                saleAvailable && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        تعداد
                      </span>

                      <span className="text-xs text-zinc-500">
                        هر {quantityStep} عدد
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={!canDecrease}
                        onClick={() =>
                          setQuantity(
                            (current) =>
                              Math.max(
                                quantityMinimum,
                                current -
                                  quantityStep
                              )
                          )
                        }
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 text-xl transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        −
                      </button>

                      <div className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-semibold">
                        {quantity.toLocaleString(
                          "fa-IR"
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!canIncrease}
                        onClick={() =>
                          setQuantity(
                            (current) =>
                              current +
                              quantityStep
                          )
                        }
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 text-xl transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    {pricingSteps.length > 1 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pricingSteps.map(
                          (step) => (
                            <button
                              key={step}
                              type="button"
                              onClick={() => {
                                if (
                                  quantityMaximum ===
                                    null ||
                                  step <=
                                    quantityMaximum
                                ) {
                                  setQuantity(
                                    step
                                  );
                                }
                              }}
                              className={`rounded-xl px-3 py-2 text-xs transition ${
                                quantity ===
                                step
                                  ? "bg-zinc-950 text-white"
                                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                              }`}
                            >
                              {step.toLocaleString(
                                "fa-IR"
                              )}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Add To Cart */}

              <button
                type="button"
                disabled={!canAddToCart}
                onClick={handleAddToCart}
                className="mt-6 w-full rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
              >
                {!isVariantSelectionComplete
                  ? "ابتدا ویژگی محصول را انتخاب کنید"
                  : !selectedSale
                    ? "فروش برای این انتخاب وجود ندارد"
                    : !selectedSale.is_available
                      ? "این محصول ناموجود است"
                      : "افزودن به سبد خرید"}
              </button>

              {/* Cart Message */}

              {cartMessage && (
                <div
                  className={`mt-3 rounded-2xl px-4 py-3 text-sm ${
                    cartMessageType ===
                    "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      {cartMessage}
                    </span>

                    {cartMessageType ===
                      "success" && (
                      <Link
                        href="/shopcart"
                        className="shrink-0 font-semibold underline underline-offset-4"
                      >
                        مشاهده سبد
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Categories */}

              {product.categories &&
                product.categories.length > 0 && (
                  <div className="mt-8">
                    <div className="mb-3 text-sm font-semibold">
                      دسته‌بندی
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.categories.map(
                        (category) => (
                          <Link
                            key={category.id}
                            href={`/category/${category.slug}`}
                            className="rounded-full bg-zinc-100 px-3 py-2 text-xs text-zinc-600 transition hover:bg-zinc-200"
                          >
                            {category.title}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* Description */}

          {product.description && (
            <section className="mt-14 border-t border-zinc-200 pt-10">
              <h2 className="text-xl font-bold">
                توضیحات محصول
              </h2>

              <div
                className="prose prose-zinc mt-5 max-w-none leading-8"
                dangerouslySetInnerHTML={{
                  __html:
                    product.description,
                }}
              />
            </section>
          )}

          {/* Product Features */}

          {product.features &&
            product.features.length > 0 && (
              <section className="mt-14 border-t border-zinc-200 pt-10">
                <h2 className="text-xl font-bold">
                  ویژگی‌های محصول
                </h2>

                <div className="mt-5 overflow-hidden rounded-3xl border border-zinc-200">
                  {product.features.map(
                    (feature, index) => (
                      <div
                        key={feature.id}
                        className={`grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[220px_1fr] ${
                          index !==
                          product.features.length - 1
                            ? "border-b border-zinc-100"
                            : ""
                        }`}
                      >
                        <div className="text-sm font-medium text-zinc-600">
                          {
                            feature.feature
                              .name
                          }
                        </div>

                        <div className="text-sm text-zinc-900">
                          {feature.feature_values
                            ?.map(
                              (value) =>
                                value.value
                            )
                            .join("، ") ||
                            feature.custom_value ||
                            "—"}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          {/* Related Products */}

          {product.related_products &&
            product.related_products.length > 0 && (
              <section className="mt-14 border-t border-zinc-200 pt-10">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold">
                    محصولات مرتبط
                  </h2>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {product.related_products.map(
                    (related) => (
                      <Link
                        key={related.id}
                        href={`/product/${related.slug}`}
                        className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-zinc-400"
                      >
                        <div className="relative aspect-square bg-zinc-50">
                          {related.cover_image ? (
                            <Image
                              src={
                                related.cover_image
                              }
                              alt={
                                related.title
                              }
                              fill
                              className="object-contain p-4 transition duration-300 group-hover:scale-105"
                              sizes="300px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                              بدون تصویر
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          {related.brand && (
                            <div className="text-xs text-zinc-500">
                              {
                                related.brand
                                  .name
                              }
                            </div>
                          )}

                          <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-6">
                            {related.title}
                          </h3>

                          {related.price && (
                            <div className="mt-3 text-sm font-bold">
                              {formatPrice(
                                Number(
                                  related.price
                                )
                              )}
                            </div>
                          )}

                          {!related.price &&
                            related.min_price && (
                              <div className="mt-3 text-xs text-zinc-500">
                                از{" "}
                                {formatPrice(
                                  Number(
                                    related.min_price
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </section>
            )}
        </div>
      </main>

      <Footer />
    </>
  );
}

