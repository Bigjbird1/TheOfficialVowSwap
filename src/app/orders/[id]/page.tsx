import OrderDetails from '@/app/components/OrderDetails';

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default function OrderPage({ params }: OrderPageProps) {
  return <OrderDetails />;
}
