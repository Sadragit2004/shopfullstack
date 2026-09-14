// app/[locale]/accounts/login/page.tsx
import LoginPage from './_components/index';

export const metadata = {
  title: 'ورود به حساب کاربری | آرامیس',
  description: 'ورود یا ثبت‌نام با شماره موبایل',
};

export default function Page() {
  return <LoginPage />;
}