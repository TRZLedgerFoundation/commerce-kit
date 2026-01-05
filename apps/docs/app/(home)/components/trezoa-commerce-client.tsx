'use client';

import dynamic from 'next/dynamic';
import { PaymentButton, type TrezoaCommerceConfig } from '@trezoa-commerce/react';
import { OrderItem } from '@trezoa-commerce/headless';

// Create a client-only version to avoid SSR issues
const ClientOnlyCommerceSDK = dynamic(
  () => Promise.resolve(PaymentButton),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

interface trezoaCommerceClientProps {
  config: TrezoaCommerceConfig;
  variant?: 'default' | 'icon-only';
  onPayment?: (amount: number, currency: string, products?: readonly OrderItem[]) => void;
  onPaymentStart?: () => void;
  onPaymentSuccess?: (signature: string) => void;
  onPaymentError?: (error: Error) => void;
}

export function TrezoaCommerceClient(props: trezoaCommerceClientProps) {
  return <ClientOnlyCommerceSDK {...props} />;
} 