'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BarChart3,
  Image as ImageIcon,
  LayoutGrid,
  LogOut,
  MessageSquareQuote,
  Package,
  Store,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/banners', label: 'Banners & offers', icon: ImageIcon },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/admin/branches', label: 'Branches', icon: Store },
];

/** Calm Deep Teal sidebar — deliberately restrained compared with the site. */
export function AdminSidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null; role?: string; branch?: string };
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col bg-ink text-cream lg:h-screen lg:w-64 lg:sticky lg:top-0">
      <div className="flex items-center justify-between border-b border-cream/10 px-5 py-4">
        <Link href="/admin" className="flex items-baseline gap-1.5">
          <span className="font-display text-xl">F-EX</span>
          <span className="text-[9px] uppercase tracking-[0.24em] text-peach/70">admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[9px] uppercase tracking-[0.18em] text-cream/40 hover:text-peach">
            Site ↗
          </Link>
          {/* The full user block is a desktop column; on a phone this is the only sign-out. */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-cream/50 transition-colors hover:bg-cream/5 hover:text-peach lg:hidden"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:p-3">
        {links.map((l) => {
          const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-3 text-xs transition-colors lg:py-2.5',
                active ? 'bg-peach text-ink-deep' : 'text-cream/65 hover:bg-cream/5 hover:text-cream'
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-cream/10 p-4 lg:block">
        <p className="truncate text-xs text-cream">{user.name}</p>
        <p className="truncate text-[10px] uppercase tracking-[0.16em] text-cream/40">
          {user.role === 'owner' ? 'Owner' : `Staff · ${user.branch ?? 'all'}`}
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-cream/50 hover:text-peach"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}

/** Small helper used by admin pages for empty states. */
export function AdminEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-input p-10 text-center">
      <LayoutGrid className="mx-auto h-5 w-5 text-plum/40" />
      <p className="mt-3 font-display text-xl text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
