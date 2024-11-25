import NextAuth from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import type { Session } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

if (!process.env['GOOGLE_CLIENT_ID'] || !process.env['GOOGLE_CLIENT_SECRET']) {
  throw new Error('Missing Google OAuth credentials');
}

if (!process.env['NEXT_PUBLIC_SUPABASE_URL'] || !process.env['SUPABASE_SERVICE_ROLE_KEY']) {
  throw new Error('Missing Supabase credentials');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env['NEXT_PUBLIC_SUPABASE_URL'],
    secret: process.env['SUPABASE_SERVICE_ROLE_KEY'],
  }),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token['id'] = user['id'];
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.id = token['id'] as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }