'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CopyReferralLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copia el enlace:', url);
    }
  }

  async function onShare() {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as any).share({
          title: 'Comparte un nicho virtual con tu familia',
          url,
        });
      } catch {
        // usuario canceló
      }
    } else {
      onCopy();
    }
  }

  return (
    <div className="flex gap-2">
      <Button type="button" variant="dorado" size="sm" onClick={onCopy} className="flex-1">
        {copied
          ? <><Check className="h-4 w-4 mr-1.5" /> ¡Copiado!</>
          : <><Copy className="h-4 w-4 mr-1.5" /> Copiar enlace</>}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onShare}>
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
