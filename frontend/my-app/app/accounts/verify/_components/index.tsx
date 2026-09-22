"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  verify,
  login,
} from "@/lib/api/accounts/auth";

import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mobileFromQuery =
    searchParams.get("mobile") || "";

  const next =
    searchParams.get("next");

  const [mobileNumber, setMobileNumber] =
    useState(mobileFromQuery);

  const [code, setCode] =
    useState(["", "", "", "", "", ""]);

  const [loading, setLoading] =
    useState(false);

  const [resendLoading, setResendLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [seconds, setSeconds] =
    useState(120);

  const inputRefs = useRef<
    Array<HTMLInputElement | null>
  >([]);

  /*
   * اگر شماره در URL نبود،
   * کاربر را به صفحه ورود برمی‌گردانیم.
   */
  useEffect(() => {
    if (!mobileFromQuery) {
      router.replace("/accounts/login");
    }
  }, [mobileFromQuery, router]);

  /*
   * تایمر ارسال مجدد
   */
  useEffect(() => {
    if (seconds <= 0) return;

    const timer = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [seconds]);

  /*
   * فوکوس روی اولین input
   */
  useEffect(() => {
    if (mobileFromQuery) {
      inputRefs.current[0]?.focus();
    }
  }, [mobileFromQuery]);

  function handleCodeChange(
    index: number,
    value: string
  ) {
    const numericValue =
      value.replace(/\D/g, "");

    if (!numericValue) {
      const updated = [...code];
      updated[index] = "";

      setCode(updated);
      return;
    }

    const updated = [...code];

    /*
     * اگر کاربر چند رقم را paste کرد
     */
    if (numericValue.length > 1) {
      const digits = numericValue
        .slice(0, 6)
        .split("");

      digits.forEach((digit, i) => {
        if (index + i < 6) {
          updated[index + i] = digit;
        }
      });

      setCode(updated);

      const nextIndex = Math.min(
        index + digits.length,
        5
      );

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    updated[index] = numericValue[0];

    setCode(updated);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      e.key === "Backspace" &&
      !code[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerifyWithCode(
    e?: React.FormEvent
  ) {
    e?.preventDefault();

    setError("");

    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      setError(
        "لطفاً کد تایید ۶ رقمی را کامل وارد کنید."
      );
      return;
    }

    if (!mobileNumber) {
      setError(
        "شماره موبایل مشخص نیست."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await verify(
        mobileNumber,
        fullCode
      );

      if (!data.authenticated) {
        setError(
          "احراز هویت انجام نشد."
        );
        return;
      }

      /*
       * مقصد قبلی کاربر را حفظ می‌کنیم.
       *
       * اگر کاربر از checkout آمده باشد:
       *
       * /order/checkout/123
       *
       * دوباره همان‌جا برمی‌گردد.
       *
       * اگر next معتبر نباشد،
       * صفحه اصلی مقصد خواهد بود.
       */
      const safeNext =
        next &&
        next.startsWith("/") &&
        !next.startsWith("//")
          ? next
          : "/";

      /*
       * replace بهتر از push است،
       * چون صفحات login و verify
       * دوباره در history باقی نمی‌مانند.
       */
      router.replace(safeNext);

      router.refresh();
    } catch (err) {
      console.error(
        "Verify error:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "کد تایید نامعتبر است."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!mobileNumber) return;

    try {
      setError("");
      setResendLoading(true);

      await login(mobileNumber);

      setSeconds(120);

      setCode([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error(
        "Resend error:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "ارسال مجدد کد تایید ناموفق بود."
        );
      }
    } finally {
      setResendLoading(false);
    }
  }

  function formatSeconds(value: number) {
    const minutes = Math.floor(
      value / 60
    );

    const secs = value % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  if (!mobileFromQuery) {
    return null;
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
                تایید شماره موبایل
              </h1>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                کد ارسال‌شده به شماره
              </p>

              <div
                dir="ltr"
                className="mt-2 text-sm font-semibold text-neutral-900"
              >
                {mobileNumber}
              </div>
            </div>

            <form
              onSubmit={handleVerifyWithCode}
              className="space-y-5"
            >
              <div
                dir="ltr"
                className="flex justify-center gap-2 sm:gap-3"
              >
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] =
                        element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleCodeChange(
                        index,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(
                        index,
                        e
                      )
                    }
                    className="h-12 w-11 rounded-xl border border-neutral-200 bg-white text-center text-lg font-bold text-neutral-950 outline-none transition-all focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 sm:h-14 sm:w-12"
                  />
                ))}
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  code.join("").length !== 6
                }
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-neutral-950 px-5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span>
                    در حال بررسی...
                  </span>
                ) : (
                  <span>
                    تایید و ورود
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              {seconds > 0 ? (
                <p className="text-sm text-neutral-500">
                  ارسال مجدد کد تا{" "}
                  <span
                    dir="ltr"
                    className="font-semibold text-neutral-900"
                  >
                    {formatSeconds(seconds)}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-60 disabled:opacity-40"
                >
                  {resendLoading
                    ? "در حال ارسال..."
                    : "ارسال مجدد کد"}
                </button>
              )}
            </div>

            <div className="mt-5 text-center">
              <Link
                href="/accounts/login"
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
              >
                تغییر شماره موبایل
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}