// app/[locale]/accounts/verify/_components/index.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verify, login } from '@/lib/api/accounts/auth';
import Header from '@/app/_components/Header';
import Footer from '@/app/_components/Footer';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobileFromQuery = searchParams.get('mobile') || '';

  const [mobileNumber, setMobileNumber] = useState(mobileFromQuery);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  // ============================================================
  // شمارش معکوس
  // ============================================================
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // ============================================================
  // فوکوس روی اولین input
  // ============================================================
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  // ============================================================
  // اگه شماره موبایل نبود، برگرد به لاگین
  // ============================================================
  useEffect(() => {
    if (!mobileFromQuery) {
      router.push('/accounts/login');
    }
  }, [mobileFromQuery, router]);

  // ============================================================
  // تغییر کد
  // ============================================================
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // پاک کردن خطا
    if (error) setError(null);

    // انتقال به input بعدی
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // ارسال خودکار وقتی همه پر شد
    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        setTimeout(() => {
          handleVerifyWithCode(fullCode);
        }, 200);
      }
    }
  };

  // ============================================================
  // حذف کد
  // ============================================================
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ============================================================
  // پیست کد
  // ============================================================
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (!pastedData) return;

    const newCode = pastedData.split('');
    while (newCode.length < 6) {
      newCode.push('');
    }

    setCode(newCode);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // ارسال خودکار
    if (pastedData.length === 6) {
      setTimeout(() => {
        handleVerifyWithCode(pastedData);
      }, 200);
    }
  };

  // ============================================================
  // تایید کد
  // ============================================================
  const handleVerifyWithCode = async (fullCode: string) => {
    if (fullCode.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const data = await verify(mobileNumber, fullCode);
      if (data.authenticated) {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'کد تایید نامعتبر است');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('لطفا کد ۶ رقمی را کامل وارد کنید');
      return;
    }

    await handleVerifyWithCode(fullCode);
  };

  // ============================================================
  // ارسال مجدد کد
  // ============================================================
  const handleResend = async () => {
    setResending(true);
    setError(null);

    try {
      await login(mobileNumber);
      setCountdown(120);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'خطا در ارسال مجدد کد');
    } finally {
      setResending(false);
    }
  };

  // ============================================================
  // فرمت زمان
  // ============================================================
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================
  // نمایش شماره موبایل
  // ============================================================
  const displayMobile = mobileNumber
    ? `${mobileNumber.slice(0, 4)}***${mobileNumber.slice(-4)}`
    : '';

  return (
    <>
      <Header onMenuClick={handleMenuClick} />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/70 dark:border-slate-800/60 overflow-hidden">

            {/* Top Decoration */}
            <div className="h-2 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700" />

            <div className="p-8 sm:p-10">
              {/* Icon & Title */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-700/30">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mt-6 text-center">
                  کد تایید را وارد کنید
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm text-center leading-relaxed">
                  کد ۶ رقمی به شماره
                  <br />
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 mt-1" dir="ltr">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{displayMobile}</span>
                  </span>
                  <br />
                  ارسال شد
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    !
                  </div>
                  <p className="text-red-700 dark:text-red-400 text-sm flex-1 leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Code Inputs */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 text-center">
                    کد تایید
                  </label>

                  <div dir="ltr" className="flex justify-center gap-2 sm:gap-3">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={loading}
                        className={`w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold rounded-2xl border-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-all duration-200 focus:outline-none focus:scale-105 disabled:opacity-50 ${
                          digit
                            ? 'border-teal-500 dark:border-teal-500 shadow-lg shadow-teal-500/20'
                            : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Countdown / Resend */}
                <div className="text-center text-sm">
                  {countdown > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        زمان باقیمانده:{' '}
                        <span className="font-medium text-slate-700 dark:text-slate-300" dir="ltr">
                          {formatTime(countdown)}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors hover:underline disabled:opacity-50"
                    >
                      {resending ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>در حال ارسال...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>ارسال مجدد کد</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || code.join('').length !== 6}
                  className="group relative w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-500 dark:hover:to-teal-600 text-white py-4 rounded-2xl font-medium text-base transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>در حال تایید...</span>
                      </>
                    ) : (
                      <>
                        <span>تایید و ورود</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Change Mobile */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => router.push('/accounts/login')}
                  className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>تغییر شماره موبایل</span>
                </button>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>بازگشت به صفحه اصلی</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}