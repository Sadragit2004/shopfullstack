// app/[locale]/accounts/verify/page.tsx
import VerifyPage from './_components/index';

export const metadata = {
  title: 'تایید شماره موبایل | آرامیس',
  description: 'تایید کد ارسال شده به شماره موبایل',
};

export default function Page() {
  return <VerifyPage />;
}