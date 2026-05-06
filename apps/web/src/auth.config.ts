import type { NextAuthConfig } from "next-auth";

// This config is used by middleware (Edge runtime) — keep it lightweight, no Node.js-only imports.
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in from Credentials provider, user object carries role
      if (user) {
        token.role = (user as any).role ?? "reader";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role ?? "reader";
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
} satisfies NextAuthConfig;
