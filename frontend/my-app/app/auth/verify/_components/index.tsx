'use client';

import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { verifyCode } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mobileNumber = searchParams.get('mobile_number') || '';

  const [digits, setDigits] = useState<string[]>(
    Array(CODE_LENGTH).fill(''),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join('');

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function triggerError(message: string) {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  function updateDigit(index: number, value: string) {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      next[index] = cleaned.slice(-1);
      return next;
    });

    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }

  async function submitCode(verificationCode: string) {
    setError('');

    if (!mobileNumber) {
      triggerError('شماره موبایل پیدا نشد.');
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      triggerError('کد تأیید باید ۶ رقم باشد.');
      return;
    }

    try {
      setLoading(true);

      const response = await verifyCode({
        mobile_number: mobileNumber,
        code: verificationCode,
      });

      if (!response.data.authenticated) {
        triggerError('احراز هویت انجام نشد.');
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      /*
       * فعلاً برای تست:
       * توکن‌ها را در اینجا دریافت می‌کنیم.
       *
       * مرحله بعدی می‌توانیم مدیریت امن
       * access_token / refresh_token را اضافه کنیم.
       */
      console.log('Access Token:', response.data.access_token);
      console.log('Refresh Token:', response.data.refresh_token);
      console.log('User:', response.data.user);

      router.push('/');
    } catch (error) {
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();

      if (error instanceof ApiError) {
        triggerError(error.message);
      } else {
        triggerError('کد تأیید صحیح نیست یا خطایی در سرور رخ داده است.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length === CODE_LENGTH) submitCode(code);
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    // TODO: فراخوانی API ارسال مجدد کد
  }

  if (!mobileNumber) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0C] px-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#141416] p-8 text-center">
          <p className="text-sm text-red-400">شماره موبایل پیدا نشد.</p>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
          >
            بازگشت به ورود
          </button>
        </div>
      </main>
    );
  }

  const progress = (RESEND_SECONDS - secondsLeft) / RESEND_SECONDS;
  const circumference = 2 * Math.PI * 9;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0C] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-white/10 bg-[#141416] p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M19 11a7 7 0 01-14 0M12 18v3"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1 className="text-lg font-semibold text-white">تأیید شماره موبایل</h1>
            <p className="mt-2 text-sm text-white/40">
              کد ۶ رقمی ارسال شده به
              <span dir="ltr" className="mx-1 font-medium text-white/70">
                {mobileNumber}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              dir="ltr"
              className={`flex justify-center gap-2 ${shake ? 'animate-shake' : ''}`}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  disabled={loading}
                  maxLength={1}
                  className="h-13 w-11 rounded-xl border border-white/10 bg-white/5 text-center text-lg font-semibold text-white outline-none transition focus:border-white/40 focus:bg-white/10"
                  style={{ height: '52px' }}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== CODE_LENGTH}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  در حال بررسی...
                </>
              ) : (
                'تأیید و ورود'
              )}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => router.push('/login')}
                disabled={loading}
                className="text-white/40 transition hover:text-white/70"
              >
                تغییر شماره موبایل
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={secondsLeft > 0}
                className="flex items-center gap-2 text-white/70 transition hover:text-white disabled:text-white/30"
              >
                {secondsLeft > 0 ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" className="-rotate-90">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.15"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress)}
                      />
                    </svg>
                    <span dir="ltr">{secondsLeft}s</span>
                  </>
                ) : (
                  'ارسال مجدد کد'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}