'use client';

import { FormEvent, useState } from 'react';

import { useRouter } from 'next/navigation';

import { requestLoginCode } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

const DIGIT_COUNT = 11;

function formatMobile(digits: string) {
  const p1 = digits.slice(0, 4);
  const p2 = digits.slice(4, 7);
  const p3 = digits.slice(7, 11);
  return [p1, p2, p3].filter(Boolean).join(' ');
}

export default function Login() {
  const router = useRouter();

  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // آیا رقم‌های وارد شده تا الان با الگوی 09xxxxxxxxx جور درمیاد؟
  // اگه رقم دوم چیزی جز ۹ باشه، همون لحظه (نه فقط موقع submit) می‌فهمیم.
  const prefixOk =
    mobileNumber.length === 0 ||
    (mobileNumber[0] === '0' &&
      (mobileNumber.length === 1 || mobileNumber[1] === '9'));

  const isComplete = mobileNumber.length === DIGIT_COUNT;
  const isValid = /^09\d{9}$/.test(mobileNumber);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, DIGIT_COUNT);

    setMobileNumber(digits);

    if (error) {
      setError('');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    const mobile = mobileNumber.trim();

    if (!/^09\d{9}$/.test(mobile)) {
      setError('شماره موبایل وارد شده معتبر نیست.');
      return;
    }

    try {
      setLoading(true);

      await requestLoginCode({ mobile_number: mobile });

      router.push(`/auth/verify?mobile_number=${encodeURIComponent(mobile)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('خطایی در ارتباط با سرور رخ داده است.');
      }
    } finally {
      setLoading(false);
    }
  }

  const barColor = !prefixOk ? '#F87171' : 'rgba(255,255,255,0.7)';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0C] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-white/10 bg-[#141416] p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="7"
                  y="3"
                  width="10"
                  height="18"
                  rx="2"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <path d="M11 17.5h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="text-lg font-semibold text-white">با موبایلت وارد شو</h1>
            <p className="mt-2 text-sm text-white/40">
              شماره رو بزن، کد ورود برات پیامک می‌شه
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="mobile_number" className="sr-only">
                شماره موبایل
              </label>

              <input
                id="mobile_number"
                name="mobile_number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                autoFocus
                value={formatMobile(mobileNumber)}
                onChange={handleChange}
                placeholder="0912 345 6789"
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? 'mobile_number_error' : undefined}
                className="w-full border-0 bg-transparent text-center font-mono text-3xl tracking-[0.1em] text-white outline-none placeholder:text-white/15 disabled:opacity-40"
              />

              {/* نوار پیشرفت - سیگنیچر ورود
                  پر شدنش یعنی چند رقم مونده؛ رنگش یعنی پیش‌شماره درسته یا نه */}
              <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-white/10" aria-hidden>
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${(mobileNumber.length / DIGIT_COUNT) * 100}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>

            {!prefixOk && !error && (
              <p className="text-center text-sm text-red-400">
                شماره موبایل باید با ۰۹ شروع بشه
              </p>
            )}

            {error && (
              <p id="mobile_number_error" className="text-center text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !isComplete || !isValid}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              )}
              {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}