// app/[locale]/product/[slug]/_components/index.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProductDetail, ProductDetail, ProductSale } from '@/lib/api/products/productDetail';
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

// ============================================================
// ProductDetail Component
// ============================================================
interface ProductDetailProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductDetailProps) {
  const unwrappedParams = use(params);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<ProductSale | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const slug = unwrappedParams.slug;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProductDetail(slug);
        setProduct(data);

        if (data.cover_image) {
          setSelectedImage(data.cover_image);
        } else if (data.gallery && data.gallery.length > 0) {
          setSelectedImage(data.gallery[0].image);
        }

        if (data.sales && data.sales.length > 0) {
          setSelectedSale(data.sales[0]);
          const steps = getStepsFromSale(data.sales[0]);
          setQuantity(steps.length > 0 ? steps[0] : 1);
        }
      } catch (err) {
        setError('خطا در دریافت محصول');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // ============================================================
  // استخراج پله‌های خرید از purchase_step
  // ============================================================
  const getStepsFromSale = (sale: ProductSale): number[] => {
    const step = sale.purchase_step || 1;
    const min = sale.minimum_quantity || 1;
    const max = sale.maximum_quantity || 999;

    const steps: number[] = [];
    for (let i = min; i <= max; i += step) {
      steps.push(i);
    }
    return steps;
  };

  const pricingSteps = selectedSale ? getStepsFromSale(selectedSale) : [];

  // ============================================================
  // پیدا کردن ایندکس پله فعلی
  // ============================================================
  const getCurrentStepIndex = (): number => {
    if (pricingSteps.length === 0) return 0;
    const index = pricingSteps.indexOf(quantity);
    return index !== -1 ? index : 0;
  };

  // ============================================================
  // توابع مربوط به تعداد با پله‌های ثابت
  // ============================================================
  const increaseQuantity = () => {
    if (pricingSteps.length === 0) return;

    const currentIndex = getCurrentStepIndex();
    if (currentIndex < pricingSteps.length - 1) {
      setQuantity(pricingSteps[currentIndex + 1]);
    }
  };

  const decreaseQuantity = () => {
    if (pricingSteps.length === 0) return;

    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setQuantity(pricingSteps[currentIndex - 1]);
    }
  };

  // ============================================================
  // محاسبه قیمت با تخفیف حجمی
  // ============================================================
  const getFinalPrice = (): number | null => {
    if (!selectedSale) return null;

    if (selectedSale.pricing_tiers && selectedSale.pricing_tiers.length > 0) {
      const sortedTiers = [...selectedSale.pricing_tiers].sort((a, b) => a.min_quantity - b.min_quantity);

      for (const tier of sortedTiers) {
        if (quantity >= tier.min_quantity) {
          if (tier.max_quantity === null || quantity <= tier.max_quantity) {
            return parseFloat(tier.price);
          }
        }
      }
    }

    return parseFloat(selectedSale.selling_price);
  };

  const finalPrice = getFinalPrice();
  const totalPrice = finalPrice !== null ? finalPrice * quantity : null;

  // ============================================================
  // نمایش قیمت با تخفیف
  // ============================================================
  const getPriceDisplay = () => {
    if (!selectedSale) return null;

    const regularPrice = parseFloat(selectedSale.selling_price);
    const hasTier = selectedSale.pricing_tiers && selectedSale.pricing_tiers.length > 0;

    if (hasTier && finalPrice !== null && finalPrice < regularPrice) {
      return {
        regular: regularPrice,
        discounted: finalPrice,
        hasDiscount: true
      };
    }

    return {
      regular: regularPrice,
      discounted: null,
      hasDiscount: false
    };
  };

  const priceDisplay = getPriceDisplay();

  // ============================================================
  // بارگذاری
  // ============================================================
  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse h-96" />
            <div className="space-y-4">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse h-10 w-3/4" />
              <div className="bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse h-6 w-1/2" />
              <div className="bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse h-20 w-full" />
              <div className="bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse h-10 w-1/3" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl">
            {error || 'محصول یافت نشد'}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 text-right">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ============================================================
                Images Section
                ============================================================ */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-800/60">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {product.gallery && product.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.gallery.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image.image)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === image.image
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-blue-300'
                      }`}
                    >
                      <Image
                        src={image.image}
                        alt={`گالری ${product.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ============================================================
                Info Section
                ============================================================ */}
            <div className="space-y-6">
              {/* Brand */}
              {product.brand && (
                <div className="flex items-center gap-3">
                  {product.brand.logo && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-800/60">
                      <Image
                        src={product.brand.logo}
                        alt={product.brand.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                  )}
                  <Link
                    href={`/brand/${product.brand.slug}`}
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    {product.brand.name}
                  </Link>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                {product.title}
              </h1>

              {/* ============================================================
                  Selection - انتخاب نوع فروش
                  ============================================================ */}
              {product.sales && product.sales.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    نوع فروش
                  </label>
                  <select
                    value={selectedSale?.id || ''}
                    onChange={(e) => {
                      const sale = product.sales.find(s => s.id === parseInt(e.target.value));
                      setSelectedSale(sale || null);
                      if (sale) {
                        const steps = getStepsFromSale(sale);
                        setQuantity(steps.length > 0 ? steps[0] : 1);
                      }
                    }}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {product.sales.map((sale) => (
                      <option key={sale.id} value={sale.id}>
                        {sale.sale_type.name} - {sale.unit.symbol} - {new Intl.NumberFormat('fa-IR').format(parseFloat(sale.selling_price))} تومان
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ============================================================
                  Price Section
                  ============================================================ */}
              {selectedSale && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30">
                  {priceDisplay?.hasDiscount ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-slate-500 dark:text-slate-400 line-through">
                          {new Intl.NumberFormat('fa-IR').format(priceDisplay.regular)} تومان
                        </span>
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                          تخفیف
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {new Intl.NumberFormat('fa-IR').format(priceDisplay.discounted!)}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">تومان</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('fa-IR').format(parseFloat(selectedSale.selling_price))}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">تومان</span>
                    </div>
                  )}

                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">واحد:</span> {selectedSale.unit.name} ({selectedSale.unit.symbol})
                  </div>

                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">حداقل خرید:</span> {selectedSale.minimum_quantity}
                    {selectedSale.maximum_quantity && (
                      <span className="mr-2">
                        <span className="font-medium">حداکثر خرید:</span> {selectedSale.maximum_quantity}
                      </span>
                    )}
                    <span className="mr-2">
                      <span className="font-medium">پله خرید:</span> {selectedSale.purchase_step}
                    </span>
                  </div>

                  {selectedSale.inventory && (
                    <div className="mt-1 text-sm">
                      <span className="font-medium">موجودی:</span>
                      <span className={selectedSale.inventory.is_available ? 'text-green-600 mr-2' : 'text-red-600 mr-2'}>
                        {selectedSale.inventory.is_available ? 'موجود' : 'ناموجود'}
                      </span>
                      <span className="text-slate-500">({selectedSale.inventory.quantity})</span>
                    </div>
                  )}

                  {/* قیمت‌های حجمی */}
                  {selectedSale.pricing_tiers && selectedSale.pricing_tiers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/30">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                        قیمت‌های ویژه خرید عمده:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSale.pricing_tiers
                          .sort((a, b) => a.min_quantity - b.min_quantity)
                          .map((tier) => {
                            const isActive = quantity >= tier.min_quantity &&
                              (tier.max_quantity === null || quantity <= tier.max_quantity);

                            return (
                              <div
                                key={tier.id}
                                className={`text-xs px-3 py-1 rounded-full ${
                                  isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {tier.min_quantity}{tier.max_quantity ? `-${tier.max_quantity}` : '+'} عدد:
                                {new Intl.NumberFormat('fa-IR').format(parseFloat(tier.price))} تومان
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================
                  Quantity Selector & Add to Cart
                  ============================================================ */}
              {selectedSale && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        تعداد:
                      </label>
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                          onClick={decreaseQuantity}
                          disabled={pricingSteps.length === 0 || getCurrentStepIndex() === 0}
                          className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-16 text-center py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                          {quantity}
                        </span>
                        <button
                          onClick={increaseQuantity}
                          disabled={pricingSteps.length === 0 || getCurrentStepIndex() === pricingSteps.length - 1}
                          className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedSale.unit.symbol}
                      </span>
                    </div>

                    {/* نمایش پله‌های موجود */}
                    {pricingSteps.length > 1 && (
                      <div className="flex flex-wrap gap-1">
                        {pricingSteps.map((step) => (
                          <button
                            key={step}
                            onClick={() => setQuantity(step)}
                            className={`text-xs px-2 py-1 rounded ${
                              step === quantity
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {step}
                          </button>
                        ))}
                      </div>
                    )}

                    {totalPrice !== null && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        مجموع: <span className="font-bold text-slate-900 dark:text-white">
                          {new Intl.NumberFormat('fa-IR').format(totalPrice)}
                        </span> تومان
                      </div>
                    )}

                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-lg font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selectedSale.inventory && !selectedSale.inventory.is_available}
                    >
                      {selectedSale.inventory && !selectedSale.inventory.is_available
                        ? 'ناموجود'
                        : 'افزودن به سبد خرید'}
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    <p>
                      حداقل خرید: {selectedSale.minimum_quantity} {selectedSale.unit.symbol}
                      {selectedSale.maximum_quantity && ` | حداکثر خرید: ${selectedSale.maximum_quantity} ${selectedSale.unit.symbol}`}
                      {selectedSale.purchase_step > 1 && ` | پله خرید: ${selectedSale.purchase_step} تایی`}
                    </p>
                  </div>
                </div>
              )}

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                    مشخصات محصول
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3"
                      >
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {feature.feature.name}:
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400 mr-2">
                          {feature.custom_value ? (
                            feature.custom_value
                          ) : (
                            feature.feature_values.map((v) => v.value).join('، ')
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Products */}
              {product.related_products && product.related_products.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                    محصولات مرتبط
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {product.related_products.map((related) => (
                      <Link
                        key={related.id}
                        href={`/product/${related.slug}`}
                        className="group"
                      >
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-slate-200/70 dark:border-slate-800/60">
                          <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                            {related.cover_image ? (
                              <Image
                                src={related.cover_image}
                                alt={related.title}
                                fill
                                className="object-cover group-hover:scale-105 transition duration-300"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-3 text-right">
                            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {related.title}
                            </h3>
                            {related.brand && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {related.brand.name}
                              </span>
                            )}
                            {related.price && (
                              <div className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat('fa-IR').format(Number(related.price))} تومان
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta Data */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6 text-xs text-slate-400">
                <p>تاریخ ایجاد: {new Date(product.created_at).toLocaleDateString('fa-IR')}</p>
                {product.updated_at && (
                  <p>آخرین بروزرسانی: {new Date(product.updated_at).toLocaleDateString('fa-IR')}</p>
                )}
                <p>وضعیت: {product.status === 'published' ? 'منتشر شده' : 'منتشر نشده'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}