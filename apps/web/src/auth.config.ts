import type { NextAuthConfig } from "next-auth";

// This config is used by middleware (Edge runtime) — keep it lightweight, no Node.js-only imports.
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in from Credentials provider, user object carries role
      if (user) {
        token.role = user.role ?? "free";
        token.id = user.id!;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as any) ?? "free";
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
} satisfies NextAuthConfig;
