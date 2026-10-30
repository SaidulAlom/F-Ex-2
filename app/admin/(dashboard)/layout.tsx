import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/sidebar';

export const metadata: Metadata = {
  title: 'F-Ex Admin',
  robots: { index: false, follow: false },
};

/** Protected shell. Middleware gates the route; this re-checks the session. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-cream text-ink lg:flex">
      <AdminSidebar user={session.user} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
