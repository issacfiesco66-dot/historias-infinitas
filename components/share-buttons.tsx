'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Facebook, Mail, Link2, Check, Twitter } from 'lucide-react';

interface Props {
  url: string;
  name: string;
  epitaph?: string | null;
}

/**
 * Botones de compartir que sólo deben mostrarse cuando el memorial ya está
 * pagado/activo. El componente NO hace gate por sí mismo — confía en que
 * el caller lo muestre únicamente en ese estado.
 */
export function ShareButtons({ url, name, epitaph }: Props) {
  const [copied, setCopied] = useState(false);

  const text = epitaph
    ? `En memoria de ${name} — "${epitaph}"`
    : `En memoria de ${name}`;

  const enc = encodeURIComponent;
  const encoded = { url: enc(url), text: enc(text) };

  const whatsapp = `https://wa.me/?text=${encoded.text}%20${encoded.url}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`;
  const twitter  = `https://twitter.com/intent/tweet?text=${encoded.text}&url=${encoded.url}`;
  const email    = `mailto:?subject=${enc(`En memoria de ${name}`)}&body=${encoded.text}%0A%0A${encoded.url}`;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: seleccionar via prompt
      window.prompt('Copia el enlace:', url);
    }
  }

  return (
    <div className="bg-marfil border border-pizarra-100 rounded-xl p-5 shadow-solemn">
      <p className="uppercase tracking-widest text-[11px] text-dorado-600 mb-3">
        Comparte este memorial
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <ShareBtn
          href={whatsapp}
          label="WhatsApp"
          className="bg-[#25D366] hover:bg-[#1fb858] text-white"
          icon={<MessageCircle className="h-4 w-4" />}
        />
        <ShareBtn
          href={facebook}
          label="Facebook"
          className="bg-[#1877F2] hover:bg-[#156fd6] text-white"
          icon={<Facebook className="h-4 w-4" />}
        />
        <ShareBtn
          href={twitter}
          label="X / Twitter"
          className="bg-pizarra-900 hover:bg-pizarra-800 text-white"
          icon={<Twitter className="h-4 w-4" />}
        />
        <ShareBtn
          href={email}
          label="Correo"
          className="bg-pizarra-100 hover:bg-pizarra-200 text-pizarra-800"
          icon={<Mail className="h-4 w-4" />}
        />
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors bg-dorado-500 hover:bg-dorado-400 text-pizarra-900"
        >
          {copied ? <><Check className="h-4 w-4" /> ¡Copiado!</> : <><Link2 className="h-4 w-4" /> Copiar</>}
        </button>
      </div>

      <p className="mt-3 text-[11px] text-pizarra-400 break-all font-mono">{url}</p>
    </div>
  );
}

function ShareBtn({
  href, label, className, icon,
}: { href: string; label: string; className: string; icon: React.ReactNode }) {
  return (
    <motion.a
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${className}`}
    >
      {icon}
      <span>{label}</span>
    </motion.a>
  );
}
