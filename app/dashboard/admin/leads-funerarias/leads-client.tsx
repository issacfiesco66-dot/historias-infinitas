"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, Terminal, ExternalLink, X, Search } from 'lucide-react';
import type { PartnerLead, PartnerLeadStatus } from '@/lib/partner-leads';

interface Props {
  leads: PartnerLead[];
  baseUrl: string;
}

const STATUS_LABEL: Record<PartnerLeadStatus, string> = {
  scraped: 'Scraped',
  contacted: 'Contactado',
  engaged: 'Engaged',
  opted_out: 'Opt-out',
  converted: 'Convertido',
};

const STATUS_BADGE: Record<PartnerLeadStatus, string> = {
  scraped:   'bg-pizarra-100 text-pizarra-700 border-pizarra-200',
  contacted: 'bg-blue-100 text-blue-700 border-blue-200',
  engaged:   'bg-purple-100 text-purple-700 border-purple-200',
  opted_out: 'bg-red-100 text-red-700 border-red-200',
  converted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

type FilterValue = PartnerLeadStatus | 'all';

export function LeadsFunerariaPanel({ leads, baseUrl }: Props) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [scraperOpen, setScraperOpen] = useState(false);

  const visible = useMemo(() => {
    let list = leads;
    if (filter !== 'all') {
      list = list.filter((l) => l.status === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.business_name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.city?.toLowerCase() ?? '').includes(q),
      );
    }
    return list;
  }, [leads, filter, search]);

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = {
      all: leads.length,
      scraped: 0,
      contacted: 0,
      engaged: 0,
      opted_out: 0,
      converted: 0,
    };
    for (const l of leads) c[l.status] += 1;
    return c;
  }, [leads]);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'scraped', 'contacted', 'engaged', 'converted', 'opted_out'] as FilterValue[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ' +
                  (filter === f
                    ? 'bg-pizarra-800 text-marfil'
                    : 'bg-pizarra-100 text-pizarra-600 hover:bg-pizarra-200')
                }
              >
                {f === 'all' ? 'Todos' : STATUS_LABEL[f]}
                <span className="ml-1 opacity-70">({counts[f]})</span>
              </button>
            ),
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pizarra-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nombre, teléfono, ciudad..."
              className="w-64 rounded-lg border border-pizarra-200 bg-marfil pl-9 pr-3 py-1.5 text-sm outline-none focus:border-dorado-500 focus:ring-2 focus:ring-dorado-500/20"
            />
          </div>
          <button
            onClick={() => setScraperOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-pizarra-800 text-marfil px-4 py-2 text-sm font-semibold hover:bg-pizarra-900 transition-colors"
            title="Armar comando de terminal para el scraper"
          >
            <Terminal size={14} />
            Ejecutar scraper
          </button>
        </div>
      </div>

      {/* Tabla */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-pizarra-200 bg-pizarra-50 p-10 text-center text-sm text-pizarra-500">
          No hay leads en esta vista.
          {leads.length === 0 && (
            <p className="mt-2 text-xs">
              Aún no llegan leads del scraper. Usa el botón <strong>Ejecutar scraper</strong> arriba.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-pizarra-200 bg-marfil">
          <table className="w-full text-sm">
            <thead className="bg-pizarra-50 text-pizarra-500 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Funeraria</th>
                <th className="px-4 py-3 text-left font-semibold">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold">Ciudad</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Creado</th>
                <th className="px-4 py-3 text-left font-semibold">Link</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((l) => (
                <tr key={l.id} className="border-t border-pizarra-100 hover:bg-pizarra-50/50">
                  <td className="px-4 py-3 font-medium text-pizarra-800">{l.business_name}</td>
                  <td className="px-4 py-3 text-pizarra-600 font-mono text-xs">{l.phone}</td>
                  <td className="px-4 py-3 text-pizarra-500">
                    {l.city ?? '—'}
                    {l.state ? <span className="text-pizarra-400"> · {l.state}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_BADGE[l.status]}`}
                    >
                      {STATUS_LABEL[l.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-pizarra-500 text-xs">{formatDate(l.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/partners?lead=${encodeURIComponent(l.token)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-dorado-600 hover:text-dorado-800 text-xs"
                    >
                      <ExternalLink size={12} />
                      ver landing
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal scraper */}
      {scraperOpen && (
        <ScraperModal onClose={() => setScraperOpen(false)} baseUrl={baseUrl} />
      )}
    </div>
  );
}

/* ============================================================================
 *  Modal: Ejecutar scraper
 * ========================================================================== */
function ScraperModal({ onClose, baseUrl }: { onClose: () => void; baseUrl: string }) {
  const [ciudad, setCiudad] = useState('Toluca');
  const [max, setMax] = useState(15);
  const [dryRun, setDryRun] = useState(false);
  const [copied, setCopied] = useState(false);

  const cmd = useMemo(() => {
    const parts = [
      'python scraper_funerarias.py',
      dryRun ? '--dry-run' : '',
      `--ciudad "${ciudad.replace(/"/g, '\\"')}"`,
      `--max ${Math.max(1, Math.min(100, Number(max) || 15))}`,
    ].filter(Boolean);
    return parts.join(' ');
  }, [ciudad, max, dryRun]);

  async function copyCmd() {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-pizarra-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-marfil p-6 shadow-solemn border border-pizarra-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="uppercase tracking-[0.3em] text-[10px] text-dorado-600 mb-1">
              Scraper de funerarias
            </p>
            <h2 className="font-serif text-2xl text-pizarra-800">
              Ejecutar scraper local
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-pizarra-400 hover:text-pizarra-700"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-pizarra-600 mb-4 leading-relaxed">
          El scraper usa Playwright (navegador headless) que <strong>no corre en Vercel</strong> —
          tiene que ejecutarse en tu máquina. Arma tu comando aquí y cópialo al portapapeles;
          luego pégalo en tu terminal (<code>E:\Indexa</code>).
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-pizarra-600 mb-1">Ciudad</label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="w-full rounded-lg border border-pizarra-200 bg-white px-3 py-2 text-sm outline-none focus:border-dorado-500 focus:ring-2 focus:ring-dorado-500/20"
              placeholder="Toluca, Guadalajara, Monterrey..."
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-pizarra-600 mb-1">
                Máximo de resultados
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={max}
                onChange={(e) => setMax(Math.max(1, Math.min(100, Number(e.target.value) || 15)))}
                className="w-full rounded-lg border border-pizarra-200 bg-white px-3 py-2 text-sm outline-none focus:border-dorado-500 focus:ring-2 focus:ring-dorado-500/20"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-pizarra-600 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="h-4 w-4 rounded accent-dorado-600"
              />
              Dry-run (preview, no guarda)
            </label>
          </div>
        </div>

        <div className="rounded-xl bg-pizarra-900 text-marfil p-4 font-mono text-xs break-all relative">
          <button
            onClick={copyCmd}
            className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-pizarra-700 hover:bg-pizarra-600 px-2 py-1 text-[10px] font-semibold"
          >
            <Copy size={12} />
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <p className="text-pizarra-400 text-[10px] mb-1">$ cd E:\Indexa</p>
          <p className="pr-20">$ {cmd}</p>
        </div>

        <div className="mt-4 text-[11px] text-pizarra-500 leading-relaxed">
          <p className="mb-1"><strong>Cuando termine</strong>, vuelve aquí — la tabla se refresca sola.</p>
          <p>Los leads aparecen primero en{' '}
            <a
              href={`${baseUrl}/dashboard/admin/leads-funerarias`}
              className="text-dorado-600 hover:underline"
            >
              este panel
            </a>
            {' '}con estado <em>contacted</em>. Cuando la funeraria abra su link personalizado, pasan a <em>engaged</em>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 *  Helpers
 * ========================================================================== */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}
