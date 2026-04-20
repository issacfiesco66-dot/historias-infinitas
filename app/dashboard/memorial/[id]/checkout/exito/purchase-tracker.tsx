'use client';

import { useEffect, useRef } from 'react';
import { track } from '@vercel/analytics';

interface Props {
  orderId: string;
  planId: string;
  amount: number;
  currency: string;
  hasArAddon: boolean;
}

export function PurchaseTracker({ orderId, planId, amount, currency, hasArAddon }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track('purchase', {
      orderId,
      planId,
      amount,
      currency,
      arAddon: hasArAddon,
    });
  }, [orderId, planId, amount, currency, hasArAddon]);

  return null;
}
