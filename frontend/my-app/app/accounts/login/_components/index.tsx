"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { login } from "@/lib/api/accounts/auth";

import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function normalizeMobile(value: string) {
    return value.replace(/\D/g, "").slice(0, 11);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    const mobile = normalizeMobile(mobileNumber);

    if (!/^09\d{9}$/.test(mobile)) {
      setError("شماره موبایل را به‌صورت صحیح وارد کنید.");
      return;
    }

    try {
      setLoading(true);

      await login(mobile);

      /*
       * مسیر مقصدی که کاربر قبل از ورود درخواست کرده بود.
       *
       * مثال:
       * /order/checkout/123
       */
      const next = searchParams.get("next");

      const verifyParams = new URLSearchParams();

      verifyParams.set("mobile", mobile);

      /*
       * فقط مسیرهای داخلی سایت مجاز هستند.
       * این کار جلوی open redirect را می‌گیرد.
       */
      if (
        next &&
        next.startsWith("/") &&
        !next.startsWith("//")
      ) {
        verifyParams.set("next", next);
      }

      router.push(
        `/accounts/verify?${verifyParams.toString()}`
      );
    } catch (err) {
      console.error("Login error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("ارسال کد تایید ناموفق بود.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white text-neutral-900"
    >
      <Header />

      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
                ورود به حساب
              </h1>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                شماره موبایل خود را وارد کنید تا کد تایید برای شما ارسال شود.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium text-neutral-700"
                >
                  شماره موبایل
                </label>

                <div
                  className={[
                    "flex h-14 items-center rounded-2xl border bg-white px-4 transition-all",
                    focused
                      ? "border-neutral-900 ring-4 ring-neutral-900/5"
                      : "border-neutral-200",
                  ].join(" ")}
                >
                  <input
                    ref={inputRef}
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    autoComplete="tel"
                    value={mobileNumber}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={(e) =>
                      setMobileNumber(
                        normalizeMobile(e.target.value)
                      )
                    }
                    placeholder="09123456789"
                    className="w-full bg-transparent text-left text-base font-medium text-neutral-900 outline-none placeholder:text-neutral-300"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-neutral-950 px-5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span>در حال ارسال...</span>
                ) : (
                  <span>دریافت کد تایید</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}