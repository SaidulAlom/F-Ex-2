import { withAuth } from 'next-auth/middleware';

/**
 * Protects everything under /admin except the login screen.
 * Role checks that need the DB (e.g. owner-only pages) are repeated in the
 * server components — middleware is the first gate, not the only one.
 */
export default withAuth({
  pages: { signIn: '/admin/login' },
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path === '/admin/login') return true;
      if (!token) return false;
      return true;
    },
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};
