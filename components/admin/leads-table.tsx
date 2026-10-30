'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, MessageCircle, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { updateLeadStatus } from '@/app/admin/(dashboard)/actions';
import { cnDate, telLink } from '@/lib/utils';

type Row = {
  _id: string;
  type: string;
  status: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  productName: string;
  deviceModel: string;
  repairType: string;
  branch: string;
  createdAt: string;
  notes: string;
  photos: string[];
};

const statuses = ['new', 'contacted', 'won', 'lost', 'archived'] as const;

/** Leads table with expandable rows and inline status updates. */
export function LeadsTable({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const router = useRouter();
  const [, start] = useTransition();

  const setStatus = (id: string, status: (typeof statuses)[number]) => {
    start(async () => {
      await updateLeadStatus({ status }, id);
      router.refresh();
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-input text-left">
            {['Name', 'Type', 'Branch', 'Received', 'Status', ''].map((h) => (
              <th key={h} className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-plum">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="border-b border-input/60 last:border-0">
              <td className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => setOpen(open === r._id ? null : r._id)}
                  className="flex items-center gap-1.5 text-left text-sm text-ink hover:text-rose"
                  aria-expanded={open === r._id}
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === r._id ? 'rotate-180' : ''}`} />
                  {r.name}
                </button>
                <p className="mt-0.5 pl-5 text-[11px] text-muted-foreground">{r.phone}</p>
                {open === r._id && (
                  <div className="mt-3 space-y-2 rounded-lg bg-cream/70 p-3 pl-5 text-xs text-plum">
                    {r.productName && <p><strong>Product:</strong> {r.productName}</p>}
                    {r.deviceModel && <p><strong>Device:</strong> {r.deviceModel}</p>}
                    {r.repairType && <p><strong>Repair:</strong> {r.repairType}</p>}
                    {r.email && <p><strong>Email:</strong> {r.email}</p>}
                    {r.message && <p className="whitespace-pre-line">{r.message}</p>}
                    {r.photos?.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {r.photos.map((p) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={p} src={p} alt="Repair photo" className="h-16 w-16 rounded object-cover" />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <a
                        href={telLink(r.phone)}
                        className="inline-flex items-center gap-1 rounded-full border border-input px-3 py-1 text-[10px] uppercase tracking-[0.12em]"
                      >
                        <Phone className="h-3 w-3" /> Call
                      </a>
                      <a
                        href={`https://wa.me/91${r.phone.replace(/\D/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-input px-3 py-1 text-[10px] uppercase tracking-[0.12em]"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </td>
              <td className="px-3 py-3">
                <Badge variant="muted">{r.type}</Badge>
              </td>
              <td className="px-3 py-3 text-xs capitalize text-plum/80">{r.branch}</td>
              <td className="px-3 py-3 text-xs text-plum/70">{cnDate(r.createdAt)}</td>
              <td className="px-3 py-3">
                <select
                  value={r.status}
                  onChange={(e) => setStatus(r._id, e.target.value as (typeof statuses)[number])}
                  className="h-8 rounded border border-input bg-white px-1.5 text-[11px] capitalize"
                  aria-label={`Status for ${r.name}`}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-3 text-right">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    r.status === 'new'
                      ? 'bg-peach'
                      : r.status === 'won'
                        ? 'bg-emerald-500'
                        : r.status === 'lost'
                          ? 'bg-red-400'
                          : 'bg-plum/30'
                  }`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
