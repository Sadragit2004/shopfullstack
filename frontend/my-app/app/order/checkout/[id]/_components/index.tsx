"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Barcode,
  Check,
  ChevronDown,
  CreditCard,
  Hash,
  Loader2,
  MapPin,
  Package,
  Percent,
  ShoppingBag,
  Tag,
  Truck,
} from "lucide-react";

import {
  getOrder,
  type Order,
  type OrderDetail,
} from "@/lib/api/order/order";

import {
  getLogistics,
  setOrderLogistics,
  type Logistics,
} from "@/lib/api/order/logistics";

import {
  getPaymentTypes,
  setOrderPaymentType,
  type PaymentType,
} from "@/lib/api/order/payment-type";

import { setOrderAddress } from "@/lib/api/order/address";

import { getUserAddresses } from "@/lib/api/accounts/address";

// ============================================================
// Props
// ============================================================

interface CheckoutPageProps {
  orderId: string;
}

// ============================================================
// Address
// ============================================================

interface NamedObject {
  id?: number | string;
  name?: string;
}

interface UserAddress {
  id: number;
  province?: string | NamedObject | null;
  city?: string | NamedObject | null;
  address?: string | null;
  postal_code?: string | null;
  lat?: string | null;
  lon?: string | null;
}

// ============================================================
// Local Storage
// ============================================================

interface SavedCheckoutState {
  addressId: number | null;
  logisticsId: number | null;
  paymentTypeId: number | null;
}

// ============================================================
// Helpers
// ============================================================

function getDisplayName(
  value: string | NamedObject | null | undefined,
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name || "";
}

function getStorageKey(orderId: number): string {
  return `checkout-selection-${orderId}`;
}

function readSavedCheckoutState(
  orderId: number,
): SavedCheckoutState {
  const emptyState: SavedCheckoutState = {
    addressId: null,
    logisticsId: null,
    paymentTypeId: null,
  };

  try {
    const raw =
      window.localStorage.getItem(
        getStorageKey(orderId),
      );

    if (!raw) {
      return emptyState;
    }

    const parsed =
      JSON.parse(raw) as Partial<SavedCheckoutState>;

    return {
      addressId:
        typeof parsed.addressId === "number"
          ? parsed.addressId
          : null,

      logisticsId:
        typeof parsed.logisticsId === "number"
          ? parsed.logisticsId
          : null,

      paymentTypeId:
        typeof parsed.paymentTypeId === "number"
          ? parsed.paymentTypeId
          : null,
    };
  } catch {
    return emptyState;
  }
}

function saveCheckoutState(
  orderId: number,
  state: SavedCheckoutState,
): void {
  try {
    window.localStorage.setItem(
      getStorageKey(orderId),
      JSON.stringify(state),
    );
  } catch {
    // localStorage ممکن است توسط مرورگر محدود شده باشد.
  }
}

// ============================================================
// Number Helpers
// ============================================================

function toNumber(
  value: number | string | null | undefined,
): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatPrice(
  value: number | string | null | undefined,
): string {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(toNumber(value));
}

function formatQuantity(
  value: number | string,
): string {
  const numeric = toNumber(value);

  return new Intl.NumberFormat(
    "fa-IR",
    {
      maximumFractionDigits: 3,
    },
  ).format(numeric);
}

function formatPercent(
  value: number | string | null | undefined,
): string {
  const numeric = toNumber(value);

  return new Intl.NumberFormat(
    "fa-IR",
    {
      maximumFractionDigits: 2,
    },
  ).format(numeric);
}

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      "fa-IR",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    ).format(new Date(value));
  } catch {
    return value;
  }
}

// ============================================================
// Feature Helpers
// ============================================================

function getFeatureLabel(
  feature: unknown,
): string {
  if (
    typeof feature === "string" ||
    typeof feature === "number"
  ) {
    return String(feature);
  }

  if (
    typeof feature === "object" &&
    feature !== null
  ) {
    const item =
      feature as Record<string, unknown>;

    const name =
      item.name ??
      item.title ??
      item.label ??
      item.key;

    const value =
      item.value ??
      item.text ??
      item.display_value ??
      item.displayValue;

    if (
      name !== undefined &&
      value !== undefined
    ) {
      return `${String(name)}: ${String(value)}`;
    }

    if (value !== undefined) {
      return String(value);
    }

    if (name !== undefined) {
      return String(name);
    }
  }

  return "";
}

// ============================================================
// Product Detail Card
// ============================================================

function OrderProductCard({
  item,
}: {
  item: OrderDetail;
}) {
  const features = Array.isArray(
    item.feature_snapshot,
  )
    ? item.feature_snapshot
        .map(getFeatureLabel)
        .filter(Boolean)
    : [];

  const hasProductDiscount =
    toNumber(
      item.product_discount_amount,
    ) > 0;

  return (
    <article className="overflow-hidden rounded-3xl bg-neutral-50">
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-5">

        {/* ================================================== */}
        {/* Image */}
        {/* ================================================== */}

        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-white sm:h-32 sm:w-32">
          {item.product_image ? (
            <img
              src={item.product_image}
              alt={item.product_title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <ShoppingBag className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* Main */}
        {/* ================================================== */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

            <div className="min-w-0">
              <h3 className="text-base font-bold leading-7">
                {item.product_title}
              </h3>

              {item.brand_name && (
                <p className="mt-1 text-xs text-neutral-400">
                  برند: {item.brand_name}
                </p>
              )}
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="text-xs text-neutral-400">
                مبلغ نهایی
              </p>

              <p className="mt-1 text-base font-bold">
                {formatPrice(
                  item.total_price,
                )}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  تومان
                </span>
              </p>
            </div>

          </div>

          {/* ================================================= */}
          {/* Variant */}
          {/* ================================================= */}

          {(item.variant_title ||
            item.variant_sku ||
            item.variant_barcode) && (
            <div className="mt-4 flex flex-wrap gap-2">

              {item.variant_title && (
                <span className="rounded-xl bg-white px-3 py-2 text-xs text-neutral-600">
                  {item.variant_title}
                </span>
              )}

              {item.variant_sku && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs text-neutral-500">
                  <Hash className="h-3.5 w-3.5" />
                  {item.variant_sku}
                </span>
              )}

              {item.variant_barcode && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs text-neutral-500">
                  <Barcode className="h-3.5 w-3.5" />
                  {item.variant_barcode}
                </span>
              )}

            </div>
          )}

          {/* ================================================= */}
          {/* Features */}
          {/* ================================================= */}

          {features.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-neutral-400">
                ویژگی‌های انتخاب‌شده
              </p>

              <div className="flex flex-wrap gap-2">
                {features.map(
                  (feature, index) => (
                    <span
                      key={`${feature}-${index}`}
                      className="rounded-xl bg-white px-3 py-2 text-xs text-neutral-600"
                    >
                      {feature}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* Pricing */}
          {/* ================================================= */}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl bg-white p-3">
              <p className="text-[11px] text-neutral-400">
                تعداد
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatQuantity(
                  item.quantity,
                )}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  {item.unit_symbol ||
                    item.unit_name}
                </span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3">
              <p className="text-[11px] text-neutral-400">
                قیمت واحد
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatPrice(
                  item.unit_price,
                )}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  تومان
                </span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3">
              <p className="text-[11px] text-neutral-400">
                مبلغ قبل تخفیف
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatPrice(
                  item.subtotal_price,
                )}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  تومان
                </span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3">
              <p className="text-[11px] text-neutral-400">
                قیمت نهایی واحد
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatPrice(
                  item.final_unit_price,
                )}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  تومان
                </span>
              </p>
            </div>

          </div>

          {/* ================================================= */}
          {/* Discount */}
          {/* ================================================= */}

          {hasProductDiscount && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3">

              <div className="flex items-center gap-2 text-emerald-600">
                <Percent className="h-4 w-4" />

                <span className="text-xs font-semibold">
                  تخفیف محصول
                </span>
              </div>

              <span className="text-xs text-neutral-500">
                {formatPercent(
                  item.product_discount_percent,
                )}
                ٪
              </span>

              <span className="text-xs font-semibold text-emerald-600">
                {formatPrice(
                  item.product_discount_amount,
                )}{" "}
                تومان
              </span>

            </div>
          )}

        </div>
      </div>
    </article>
  );
}

// ============================================================
// Checkout Page
// ============================================================

export default function CheckoutPage({
  orderId,
}: CheckoutPageProps) {
  const router = useRouter();

  // ==========================================================
  // Order ID
  // ==========================================================

  const numericOrderId = useMemo(() => {
    const value = Number(orderId);

    if (
      !Number.isInteger(value) ||
      value <= 0
    ) {
      return null;
    }

    return value;
  }, [orderId]);

  // ==========================================================
  // State
  // ==========================================================

  const [order, setOrder] =
    useState<Order | null>(null);

  const [logistics, setLogistics] =
    useState<Logistics[]>([]);

  const [paymentTypes, setPaymentTypes] =
    useState<PaymentType[]>([]);

  const [addresses, setAddresses] =
    useState<UserAddress[]>([]);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState<number | null>(null);

  const [
    selectedLogisticsId,
    setSelectedLogisticsId,
  ] = useState<number | null>(null);

  const [
    selectedPaymentTypeId,
    setSelectedPaymentTypeId,
  ] = useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  // ==========================================================
  // Load Checkout Data
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!numericOrderId) {
        setError(
          "شناسه سفارش معتبر نیست.",
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const [
        orderResult,
        logisticsResult,
        paymentResult,
        addressResult,
      ] = await Promise.allSettled([
        getOrder(numericOrderId),
        getLogistics(),
        getPaymentTypes(),
        getUserAddresses(),
      ]);

      if (cancelled) {
        return;
      }

      // ======================================================
      // Order
      // ======================================================

      if (
        orderResult.status ===
        "fulfilled"
      ) {
        setOrder(
          orderResult.value,
        );
      } else {
        setOrder(null);
      }

      // ======================================================
      // Logistics
      // ======================================================

      let loadedLogistics: Logistics[] =
        [];

      if (
        logisticsResult.status ===
        "fulfilled"
      ) {
        loadedLogistics =
          logisticsResult.value || [];

        setLogistics(
          loadedLogistics,
        );
      } else {
        setLogistics([]);
      }

      // ======================================================
      // Payment
      // ======================================================

      let loadedPaymentTypes:
        PaymentType[] = [];

      if (
        paymentResult.status ===
        "fulfilled"
      ) {
        loadedPaymentTypes =
          paymentResult.value || [];

        setPaymentTypes(
          loadedPaymentTypes,
        );
      } else {
        setPaymentTypes([]);
      }

      // ======================================================
      // Addresses
      // ======================================================

      let loadedAddresses:
        UserAddress[] = [];

      if (
        addressResult.status ===
        "fulfilled"
      ) {
        loadedAddresses =
          addressResult.value || [];

        setAddresses(
          loadedAddresses,
        );
      } else {
        setAddresses([]);
      }

      // ======================================================
      // Saved State
      // ======================================================

      const saved =
        readSavedCheckoutState(
          numericOrderId,
        );

      // ======================================================
      // Address
      // ======================================================

      if (
        saved.addressId !== null &&
        loadedAddresses.some(
          (item) =>
            item.id ===
            saved.addressId,
        )
      ) {
        setSelectedAddressId(
          saved.addressId,
        );
      } else {
        setSelectedAddressId(null);
      }

      // ======================================================
      // Logistics
      // ======================================================

      if (
        saved.logisticsId !== null &&
        loadedLogistics.some(
          (item) =>
            item.id ===
            saved.logisticsId,
        )
      ) {
        setSelectedLogisticsId(
          saved.logisticsId,
        );
      } else if (
        orderResult.status ===
          "fulfilled" &&
        orderResult.value.logistics
      ) {
        setSelectedLogisticsId(
          orderResult.value.logistics.id,
        );
      } else {
        setSelectedLogisticsId(null);
      }

      // ======================================================
      // Payment
      // ======================================================

      if (
        saved.paymentTypeId !== null &&
        loadedPaymentTypes.some(
          (item) =>
            item.id ===
            saved.paymentTypeId,
        )
      ) {
        setSelectedPaymentTypeId(
          saved.paymentTypeId,
        );
      } else if (
        orderResult.status ===
          "fulfilled" &&
        orderResult.value.payment_type
      ) {
        setSelectedPaymentTypeId(
          orderResult.value
            .payment_type.id,
        );
      } else {
        setSelectedPaymentTypeId(null);
      }

      // ======================================================
      // Errors
      // ======================================================

      const orderFailed =
        orderResult.status ===
        "rejected";

      const logisticsFailed =
        logisticsResult.status ===
        "rejected";

      const paymentFailed =
        paymentResult.status ===
        "rejected";

      if (orderFailed) {
        setError(
          "دریافت اطلاعات سفارش انجام نشد.",
        );
      } else if (
        logisticsFailed &&
        paymentFailed
      ) {
        setError(
          "دریافت روش‌های ارسال و پرداخت انجام نشد.",
        );
      } else if (
        logisticsFailed
      ) {
        setError(
          "دریافت روش‌های ارسال انجام نشد.",
        );
      } else if (
        paymentFailed
      ) {
        setError(
          "دریافت روش‌های پرداخت انجام نشد.",
        );
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [numericOrderId]);

  // ==========================================================
  // Persist Selection
  // ==========================================================

  useEffect(() => {
    if (!numericOrderId) {
      return;
    }

    if (loading) {
      return;
    }

    saveCheckoutState(
      numericOrderId,
      {
        addressId:
          selectedAddressId,
        logisticsId:
          selectedLogisticsId,
        paymentTypeId:
          selectedPaymentTypeId,
      },
    );
  }, [
    numericOrderId,
    loading,
    selectedAddressId,
    selectedLogisticsId,
    selectedPaymentTypeId,
  ]);

  // ==========================================================
  // Refresh Order
  // ==========================================================

  const refreshOrder = async () => {
    if (!numericOrderId) {
      return;
    }

    try {
      const latestOrder =
        await getOrder(
          numericOrderId,
        );

      setOrder(latestOrder);
    } catch {
      // اطلاعات انتخاب فعلی همچنان روی UI باقی می‌ماند.
    }
  };

  // ==========================================================
  // Address Select
  // ==========================================================

  const handleAddressSelect = async (
    addressId: number,
  ) => {
    if (!numericOrderId) {
      setError(
        "شناسه سفارش معتبر نیست.",
      );
      return;
    }

    try {
      setSaving(
        `address-${addressId}`,
      );

      setError("");

      await setOrderAddress(
        numericOrderId,
        addressId,
      );

      setSelectedAddressId(
        addressId,
      );

      saveCheckoutState(
        numericOrderId,
        {
          addressId,
          logisticsId:
            selectedLogisticsId,
          paymentTypeId:
            selectedPaymentTypeId,
        },
      );

      await refreshOrder();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ذخیره آدرس سفارش انجام نشد.",
      );
    } finally {
      setSaving(null);
    }
  };

  // ==========================================================
  // Logistics Select
  // ==========================================================

  const handleLogisticsSelect =
    async (
      logistics: Logistics,
    ) => {
      if (!numericOrderId) {
        setError(
          "شناسه سفارش معتبر نیست.",
        );
        return;
      }

      try {
        setSaving(
          `logistics-${logistics.id}`,
        );

        setError("");

        await setOrderLogistics(
          numericOrderId,
          logistics.id,
        );

        setSelectedLogisticsId(
          logistics.id,
        );

        saveCheckoutState(
          numericOrderId,
          {
            addressId:
              selectedAddressId,
            logisticsId:
              logistics.id,
            paymentTypeId:
              selectedPaymentTypeId,
          },
        );

        await refreshOrder();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "انتخاب روش ارسال انجام نشد.",
        );
      } finally {
        setSaving(null);
      }
    };

  // ==========================================================
  // Payment Select
  // ==========================================================

  const handlePaymentSelect =
    async (
      paymentTypeId: number,
    ) => {
      if (!numericOrderId) {
        setError(
          "شناسه سفارش معتبر نیست.",
        );
        return;
      }

      try {
        setSaving(
          `payment-${paymentTypeId}`,
        );

        setError("");

        await setOrderPaymentType(
          numericOrderId,
          paymentTypeId,
        );

        setSelectedPaymentTypeId(
          paymentTypeId,
        );

        saveCheckoutState(
          numericOrderId,
          {
            addressId:
              selectedAddressId,
            logisticsId:
              selectedLogisticsId,
            paymentTypeId,
          },
        );

        await refreshOrder();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "انتخاب روش پرداخت انجام نشد.",
        );
      } finally {
        setSaving(null);
      }
    };

  // ==========================================================
  // Selected Values
  // ==========================================================

  const selectedLogistics =
    logistics.find(
      (item) =>
        item.id ===
        selectedLogisticsId,
    );

  const selectedPayment =
    paymentTypes.find(
      (item) =>
        item.id ===
        selectedPaymentTypeId,
    );

  const selectedAddress =
    addresses.find(
      (item) =>
        item.id ===
        selectedAddressId,
    );

  const selectedAddressCity =
    selectedAddress
      ? getDisplayName(
          selectedAddress.city,
        )
      : "";

  const selectedAddressProvince =
    selectedAddress
      ? getDisplayName(
          selectedAddress.province,
        )
      : "";

  const canContinue =
    numericOrderId !== null &&
    selectedAddressId !== null &&
    selectedLogisticsId !== null &&
    selectedPaymentTypeId !== null;

  // ==========================================================
  // Loading
  // ==========================================================

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#f7f7f8]"
      >
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4">
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            در حال دریافت اطلاعات سفارش...
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f7f8] text-neutral-950"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* ================================================== */}
        {/* Header */}
        {/* ================================================== */}

        <header className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mb-5 inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-950"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-neutral-400">
                تکمیل سفارش
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                انتخاب نحوه دریافت و پرداخت
              </h1>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 text-left shadow-sm">
              <p className="text-[11px] text-neutral-400">
                شماره سفارش
              </p>

              <p className="mt-1 text-sm font-bold">
                #{numericOrderId ?? orderId}
              </p>

              {order?.uuid && (
                <p className="mt-1 max-w-[240px] truncate text-[10px] text-neutral-400">
                  {order.uuid}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* ================================================== */}
        {/* Error */}
        {/* ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">

          {/* ================================================= */}
          {/* Main */}
          {/* ================================================= */}

          <div className="space-y-5">

            {/* =============================================== */}
            {/* Order Information */}
            {/* =============================================== */}

            {order && (
              <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100">
                    <Package className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold">
                      اطلاعات سفارش
                    </h2>

                    <p className="mt-1 text-xs text-neutral-400">
                      اطلاعات ثبت‌شده سفارش
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs text-neutral-400">
                      شناسه سفارش
                    </p>

                    <p className="mt-2 text-sm font-bold">
                      #{order.id}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs text-neutral-400">
                      وضعیت
                    </p>

                    <p className="mt-2 text-sm font-bold">
                      {order.status?.name ||
                        order.status?.value ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs text-neutral-400">
                      تاریخ ایجاد
                    </p>

                    <p className="mt-2 text-sm font-bold">
                      {formatDate(
                        order.created_at,
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs text-neutral-400">
                      آخرین بروزرسانی
                    </p>

                    <p className="mt-2 text-sm font-bold">
                      {formatDate(
                        order.updated_at,
                      )}
                    </p>
                  </div>

                </div>
              </section>
            )}

            {/* =============================================== */}
            {/* Products */}
            {/* =============================================== */}

            {order && (
              <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">

                <div className="mb-6 flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100">
                      <ShoppingBag className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-bold">
                        محصولات سفارش
                      </h2>

                      <p className="mt-1 text-xs text-neutral-400">
                        {new Intl.NumberFormat(
                          "fa-IR",
                        ).format(
                          order.details.length,
                        )}{" "}
                        محصول
                      </p>
                    </div>
                  </div>

                </div>

                {order.details.length ===
                0 ? (
                  <div className="rounded-2xl bg-neutral-50 px-5 py-8 text-center text-sm text-neutral-400">
                    محصولی در این سفارش وجود ندارد.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {order.details.map(
                      (item) => (
                        <OrderProductCard
                          key={item.id}
                          item={item}
                        />
                      ),
                    )}
                  </div>
                )}

              </section>
            )}

            {/* =============================================== */}
            {/* Address */}
            {/* =============================================== */}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold">
                    آدرس تحویل
                  </h2>

                  <p className="mt-1 text-xs text-neutral-400">
                    آدرس موردنظر برای دریافت سفارش را انتخاب کنید.
                  </p>
                </div>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-2xl bg-neutral-50 px-5 py-8 text-center">
                  <MapPin className="mx-auto mb-3 h-7 w-7 text-neutral-300" />

                  <p className="text-sm font-medium text-neutral-700">
                    هنوز آدرسی ثبت نشده است
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    ابتدا یک آدرس برای حساب کاربری خود ثبت کنید.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(
                    (address) => {
                      const selected =
                        selectedAddressId ===
                        address.id;

                      const addressSaving =
                        saving ===
                        `address-${address.id}`;

                      const cityName =
                        getDisplayName(
                          address.city,
                        );

                      const provinceName =
                        getDisplayName(
                          address.province,
                        );

                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() =>
                            handleAddressSelect(
                              address.id,
                            )
                          }
                          disabled={
                            saving !== null
                          }
                          className={[
                            "flex w-full items-start gap-4 rounded-2xl p-4 text-right transition",
                            selected
                              ? "bg-neutral-950 text-white"
                              : "bg-neutral-50 hover:bg-neutral-100",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              selected
                                ? "bg-white/10"
                                : "bg-white",
                            ].join(" ")}
                          >
                            {addressSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : selected ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">
                              {cityName ||
                                provinceName ||
                                "آدرس"}
                            </p>

                            <p
                              className={[
                                "mt-1 text-sm leading-6",
                                selected
                                  ? "text-white/70"
                                  : "text-neutral-500",
                              ].join(" ")}
                            >
                              {address.address ||
                                "جزئیات آدرس ثبت نشده است"}
                            </p>

                            {(provinceName ||
                              cityName) && (
                              <p
                                className={[
                                  "mt-2 text-xs",
                                  selected
                                    ? "text-white/50"
                                    : "text-neutral-400",
                                ].join(" ")}
                              >
                                {provinceName &&
                                cityName
                                  ? `${provinceName}، ${cityName}`
                                  : provinceName ||
                                    cityName}
                              </p>
                            )}

                            {address.postal_code && (
                              <p
                                className={[
                                  "mt-2 text-xs",
                                  selected
                                    ? "text-white/50"
                                    : "text-neutral-400",
                                ].join(" ")}
                              >
                                کد پستی:{" "}
                                {
                                  address.postal_code
                                }
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </section>

            {/* =============================================== */}
            {/* Logistics */}
            {/* =============================================== */}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100">
                  <Truck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold">
                    روش ارسال
                  </h2>

                  <p className="mt-1 text-xs text-neutral-400">
                    نحوه دریافت سفارش را انتخاب کنید.
                  </p>
                </div>
              </div>

              {logistics.length ===
              0 ? (
                <div className="rounded-2xl bg-neutral-50 px-5 py-6 text-center text-sm text-neutral-400">
                  روش ارسالی موجود نیست.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {logistics.map(
                    (item) => {
                      const selected =
                        selectedLogisticsId ===
                        item.id;

                      const itemSaving =
                        saving ===
                        `logistics-${item.id}`;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handleLogisticsSelect(
                              item,
                            )
                          }
                          disabled={
                            saving !== null
                          }
                          className={[
                            "flex items-center gap-4 rounded-2xl p-4 text-right transition",
                            selected
                              ? "bg-neutral-950 text-white"
                              : "bg-neutral-50 hover:bg-neutral-100",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              selected
                                ? "bg-white/10"
                                : "bg-white",
                            ].join(" ")}
                          >
                            {itemSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : selected ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Truck className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">
                              {item.title}
                            </p>

                            <p
                              className={[
                                "mt-1 text-xs",
                                selected
                                  ? "text-white/60"
                                  : "text-neutral-400",
                              ].join(" ")}
                            >
                              {item.type ===
                              "freight"
                                ? "ارسال با باربری"
                                : "پرداخت در محل"}
                            </p>
                          </div>

                          {item.price !==
                            undefined && (
                            <div className="shrink-0 text-left">
                              <p
                                className={[
                                  "text-xs font-semibold",
                                  selected
                                    ? "text-white"
                                    : "text-neutral-700",
                                ].join(" ")}
                              >
                                {formatPrice(
                                  item.price,
                                )}
                              </p>

                              <p
                                className={[
                                  "mt-0.5 text-[10px]",
                                  selected
                                    ? "text-white/40"
                                    : "text-neutral-400",
                                ].join(" ")}
                              >
                                تومان
                              </p>
                            </div>
                          )}

                          {selected && (
                            <Check className="h-5 w-5 shrink-0" />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              )}

            </section>

            {/* =============================================== */}
            {/* Payment */}
            {/* =============================================== */}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100">
                  <CreditCard className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold">
                    روش پرداخت
                  </h2>

                  <p className="mt-1 text-xs text-neutral-400">
                    روش پرداخت سفارش را انتخاب کنید.
                  </p>
                </div>
              </div>

              {paymentTypes.length ===
              0 ? (
                <div className="rounded-2xl bg-neutral-50 px-5 py-6 text-center text-sm text-neutral-400">
                  روش پرداختی موجود نیست.
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentTypes.map(
                    (item) => {
                      const selected =
                        selectedPaymentTypeId ===
                        item.id;

                      const itemSaving =
                        saving ===
                        `payment-${item.id}`;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handlePaymentSelect(
                              item.id,
                            )
                          }
                          disabled={
                            saving !== null
                          }
                          className={[
                            "flex w-full items-center gap-4 rounded-2xl p-4 text-right transition",
                            selected
                              ? "bg-neutral-950 text-white"
                              : "bg-neutral-50 hover:bg-neutral-100",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              selected
                                ? "bg-white/10"
                                : "bg-white",
                            ].join(" ")}
                          >
                            {itemSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : selected ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-semibold">
                              {item.title}
                            </p>
                          </div>

                          {selected && (
                            <Check className="h-5 w-5 shrink-0" />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              )}

            </section>
          </div>

          {/* ================================================= */}
          {/* Summary */}
          {/* ================================================= */}

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="overflow-hidden rounded-3xl bg-neutral-950 text-white shadow-sm">

              {/* ============================================= */}
              {/* Summary Header */}
              {/* ============================================= */}

              <div className="p-5 sm:p-6">

                <p className="text-sm text-white/50">
                  خلاصه سفارش
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  پرداخت سفارش
                </h2>

                {/* =========================================== */}
                {/* Selected */}
                {/* =========================================== */}

                <div className="mt-6 space-y-4">

                  <div>
                    <p className="text-xs text-white/40">
                      آدرس
                    </p>

                    <p className="mt-1 text-sm">
                      {selectedAddress
                        ? selectedAddressCity ||
                          selectedAddressProvince ||
                          "انتخاب شده"
                        : "انتخاب نشده"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/40">
                      ارسال
                    </p>

                    <p className="mt-1 text-sm">
                      {selectedLogistics?.title ||
                        order?.logistics
                          ?.title ||
                        "انتخاب نشده"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/40">
                      پرداخت
                    </p>

                    <p className="mt-1 text-sm">
                      {selectedPayment?.title ||
                        order?.payment_type
                          ?.name ||
                        "انتخاب نشده"}
                    </p>
                  </div>

                </div>
              </div>

              {/* ============================================= */}
              {/* Pricing */}
              {/* ============================================= */}

              {order && (
                <div className="border-t border-white/10 px-5 py-5 sm:px-6">

                  <div className="space-y-4">

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-white/50">
                        مبلغ محصولات
                      </span>

                      <span className="text-sm font-medium">
                        {formatPrice(
                          order.pricing
                            .subtotal_price,
                        )}{" "}
                        تومان
                      </span>
                    </div>

                    {toNumber(
                      order.pricing
                        .product_discount_amount,
                    ) > 0 && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-sm text-white/50">
                          <Tag className="h-3.5 w-3.5" />
                          تخفیف محصولات
                        </span>

                        <span className="text-sm font-medium text-emerald-400">
                          −{" "}
                          {formatPrice(
                            order.pricing
                              .product_discount_amount,
                          )}{" "}
                          تومان
                        </span>
                      </div>
                    )}

                    {toNumber(
                      order.pricing
                        .coupon_discount_amount,
                    ) > 0 && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-sm text-white/50">
                          <Percent className="h-3.5 w-3.5" />
                          تخفیف کوپن
                        </span>

                        <span className="text-sm font-medium text-emerald-400">
                          −{" "}
                          {formatPrice(
                            order.pricing
                              .coupon_discount_amount,
                          )}{" "}
                          تومان
                        </span>
                      </div>
                    )}

                    {toNumber(
                      order.pricing
                        .total_discount_amount,
                    ) > 0 && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-white/50">
                          مجموع تخفیف
                        </span>

                        <span className="text-sm font-semibold text-emerald-400">
                          −{" "}
                          {formatPrice(
                            order.pricing
                              .total_discount_amount,
                          )}{" "}
                          تومان
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-white/50">
                        هزینه ارسال
                      </span>

                      <span className="text-sm font-medium">
                        {formatPrice(
                          order.pricing
                            .shipping_price,
                        )}{" "}
                        تومان
                      </span>
                    </div>

                    {toNumber(
                      order.pricing
                        .discount_percent,
                    ) > 0 && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-white/50">
                          درصد تخفیف
                        </span>

                        <span className="text-sm font-medium">
                          {formatPercent(
                            order.pricing
                              .discount_percent,
                          )}
                          ٪
                        </span>
                      </div>
                    )}

                  </div>

                  {/* ========================================= */}
                  {/* Total */}
                  {/* ========================================= */}

                  <div className="my-6 h-px bg-white/10" />

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-white/40">
                        مبلغ قابل پرداخت
                      </p>

                      <p className="mt-2 text-2xl font-bold tracking-tight">
                        {formatPrice(
                          order.pricing
                            .total_price,
                        )}
                      </p>
                    </div>

                    <span className="pb-1 text-xs text-white/40">
                      تومان
                    </span>
                  </div>

                </div>
              )}

              {/* ============================================= */}
              {/* Continue */}
              {/* ============================================= */}

              <div className="p-5 sm:p-6">

                <button
                  type="button"
                  disabled={
                    !canContinue ||
                    saving !== null
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-neutral-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ادامه و پرداخت

                  <ArrowRight className="h-4 w-4" />
                </button>

                {!canContinue && (
                  <p className="mt-3 text-center text-xs leading-5 text-white/35">
                    برای ادامه، آدرس، روش ارسال و روش پرداخت را انتخاب کنید.
                  </p>
                )}

              </div>

            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}