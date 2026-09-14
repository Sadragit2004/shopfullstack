// app/[locale]/accounts/login/_components/index.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/api/accounts/auth';
import Header from '@/app/_components/Header';
import Footer from '@/app/_components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  // فوکوس خودکار روی input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // اعتبارسنجی شماره موبایل
  const isValidMobile = (mobile: string): boolean => {
    return /^09\d{9}$/.test(mobile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!mobileNumber) {
      setError('لطفا شماره موبایل خود را وارد کنید');
      return;
    }

    if (!isValidMobile(mobileNumber)) {
      setError('شماره موبایل وارد شده معتبر نیست');
      return;
    }

    setLoading(true);

    try {
      await login(mobileNumber);
      router.push(`/accounts/verify?mobile=${mobileNumber}`);
    } catch (err: any) {
      setError(err.message || 'خطا در ارسال کد تایید');
    } finally {
      setLoading(false);
    }
  };

  // فرمت شماره موبایل برای نمایش
  const formatMobile = (value: string): string => {
    // حذف کاراکترهای غیر عددی
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

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
              {/* Logo & Title */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-700/30">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mt-6 text-center">
                  خوش آمدید 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm text-center leading-relaxed">
                  برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید
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
                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 text-right"
                  >
                    شماره موبایل
                  </label>

                  <div
                    className={`relative rounded-2xl border-2 transition-all duration-300 ${
                      focused
                        ? 'border-teal-500 dark:border-teal-500 shadow-lg shadow-teal-500/10'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg
                        className={`w-5 h-5 transition-colors ${
                          focused
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    <input
                      ref={inputRef}
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(formatMobile(e.target.value))}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      maxLength={11}
                      dir="ltr"
                      className="w-full bg-transparent rounded-2xl px-4 py-4 pr-12 text-slate-800 dark:text-slate-100 text-lg text-left placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* Helper Text */}
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">
                    کد تایید به این شماره ارسال خواهد شد
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || mobileNumber.length !== 11}
                  className="group relative w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-500 dark:hover:to-teal-600 text-white py-4 rounded-2xl font-medium text-base transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 overflow-hidden"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>در حال ارسال...</span>
                      </>
                    ) : (
                      <>
                        <span>دریافت کد تایید</span>
                        <svg
                          className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white dark:bg-slate-900 text-xs text-slate-400 dark:text-slate-500">
                    یا
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  حساب کاربری ندارید؟{' '}
                  <Link
                    href="/accounts/register"
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors hover:underline"
                  >
                    ثبت‌نام کنید
                  </Link>
                </p>
              </div>
            </div>

            {/* Bottom Terms */}
            <div className="px-8 pb-8">
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                با ورود،{' '}
                <Link
                  href="/terms"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  قوانین و مقررات
                </Link>{' '}
                و{' '}
                <Link
                  href="/privacy"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  حریم خصوصی
                </Link>{' '}
                را می‌پذیرم
              </p>
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