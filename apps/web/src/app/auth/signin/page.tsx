"use client";

import Link from "next/link";
import { Lock, Github, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res?.error) {
        setError("Invalid credentials");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/30">
              <Lock className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Access Intelligence</h2>
          <p className="text-gray-400 text-center text-sm mb-8">Sign in to your Global Chanakya account.</p>

          {error && <p className="text-rose-500 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                placeholder="agent@globalchanakya.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm mt-2">
              <label className="flex items-center gap-2 text-gray-400">
                <input type="checkbox" className="rounded bg-black border-white/20 text-rose-500 focus:ring-rose-500/50" />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-rose-400 hover:text-rose-300">Forgot password?</Link>
            </div>

            <button type="submit" className="w-full bg-rose-600 text-white font-semibold py-3 rounded-xl hover:bg-rose-700 transition-colors mt-6">
              Sign In
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button onClick={() => signIn("google")} className="flex items-center justify-center gap-2 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium">
              <Mail className="w-4 h-4" /> Google
            </button>
            <button onClick={() => signIn("github")} className="flex items-center justify-center gap-2 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium">
              <Github className="w-4 h-4" /> GitHub
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Need access? <Link href="/auth/signup" className="text-rose-400 hover:text-rose-300 font-medium">Apply for an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
