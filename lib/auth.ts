import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbConnect } from './db';
import { User } from '@/models/User';
import { loginSchema } from './validators';

/**
 * NextAuth (credentials). Two roles: owner (full access) and branchStaff
 * (products + leads for their branch only).
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 12 }, // 12h staff shift
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'F-Ex Staff',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await dbConnect();
        const user = await User.findOne({ email: parsed.data.email.toLowerCase(), active: true }).select('+password');
        if (!user) return null;

        const ok = await user.comparePassword(parsed.data.password);
        if (!ok) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'branchStaff';
        token.branch = (user as { branch?: string }).branch ?? 'all';
        token.uid = (user as { id?: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? '';
        session.user.role = (token.role as 'owner' | 'branchStaff') ?? 'branchStaff';
        session.user.branch = (token.branch as string) ?? 'all';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module 'next-auth' {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; role: 'owner' | 'branchStaff'; branch: string };
  }
  interface User {
    role?: 'owner' | 'branchStaff';
    branch?: string;
  }
}
