'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api-client';

interface RazorpayOptions {
  amount: number;
  currency?: string;
  description?: string;
  receipt?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure?: (error: unknown) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const openCheckout = useCallback(async (options: RazorpayOptions) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error('Payment gateway failed to load. Please try again.');
      options.onFailure?.('script_load_failed');
      return;
    }

    type OrderData = { id: string; currency: string; amount: number };
    let order: OrderData;
    try {
      const res = await api.post('/api/payments/create-order/', {
        json: {
          amount_paise: options.amount,
          currency: options.currency ?? 'INR',
          receipt: options.receipt ?? '',
        },
      });
      order = (res as { data: { order: OrderData } }).data.order;
    } catch {
      toast.error('Failed to initiate payment. Please try again.');
      options.onFailure?.('order_creation_failed');
      return;
    }

    const razorpay = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: 'Xentro',
      description: options.description ?? 'Mentorship Package',
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await api.post('/api/payments/verify/', {
            json: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });
          options.onSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
          );
        } catch {
          toast.error('Payment verification failed. Contact support.');
          options.onFailure?.(response.razorpay_payment_id);
        }
      },
      modal: { ondismiss: () => options.onFailure?.('dismissed') },
      theme: { color: '#6366f1' },
    });
    razorpay.open();
  }, []);

  return { openCheckout };
}
