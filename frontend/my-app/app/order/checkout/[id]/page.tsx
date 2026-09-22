import CheckoutPage from "./_components";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({
  params,
}: PageProps) {
  const { id } = await params;

  return <CheckoutPage orderId={id} />;
}