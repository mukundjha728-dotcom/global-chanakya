import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import dbConnect from "./lib/mongoose";
import { User } from "./lib/models/User";
import * as argon2 from "argon2";
import { authConfig } from "./auth.config";

// 🔒 SINGLE ADMIN LOCK — Only this email can ever have admin role
const ADMIN_EMAIL = "mukundjha728@gmail.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.passwordHash) return null;

        // Check if locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account temporarily locked due to too many failed attempts. Try again later.");
        }

        const isValid = await argon2.verify(user.passwordHash, credentials.password as string);
        if (!isValid) {
          // Increment failed attempts
          user.failedLoginAttempts += 1;
          if (user.failedLoginAttempts >= 5) {
            user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
          }
          await user.save();
          throw new Error("Invalid credentials");
        }

        // Reset on success
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        await user.save();

        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Override jwt to fetch role from DB for OAuth users (runs in Node.js, not Edge)
    async jwt({ token, user, account }) {
      // Credentials provider: role already on user object
      if (user) {
        token.role = (user as any).role ?? "free";
        token.id = user.id;
      }
      // For OAuth sign-ins (Google/GitHub), fetch role from DB
      if (account && (account.provider === "google" || account.provider === "github")) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email }).lean() as any;
          if (dbUser) {
            token.role = dbUser.role ?? "free";
            token.id = dbUser._id.toString();
          }
        } catch (e) {
          token.role = token.role ?? "free";
        }
      }
      // 🔒 FINAL SAFETY: Only the designated admin email can have admin/super_admin role
      // No other user can ever have admin, even if DB is modified
      if ((token.role === "admin" || token.role === "super_admin") && token.email !== ADMIN_EMAIL) {
        token.role = "free";
      }
      return token;
    },
  }
});
