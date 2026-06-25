"use client";

import Link from "next/link";
import { Shield, ArrowRight, Mail, Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  // After signup, go to signin which then goes to subscribe or next
  const callbackUrl = searchParams.get("callbackUrl") || next;

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Create account via API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }

      // Auto sign in after registration
      posthog.capture("user_signed_up", { method: "email" });
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (signInRes?.error) { setError("Account created! Please sign in."); return; }
      window.location.href = callbackUrl;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30">
          <Shield className="w-7 h-7 text-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 text-sm">Join the Global Chanakya network.</p>
        </div>
      </div>

      {/* OAuth providers */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => {
            posthog.capture("user_signed_up", { method: "google" });
            signIn("google", { callbackUrl });
          }}
          className="flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-gray-300"
        >
          <Mail className="w-4 h-4" /> Google
        </button>
        <button
          onClick={() => {
            posthog.capture("user_signed_up", { method: "github" });
            signIn("github", { callbackUrl });
          }}
          className="flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-gray-300"
        >
          <Github className="w-4 h-4" /> GitHub
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-xs text-gray-500 uppercase tracking-wider">or register with email</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {error && <p className="text-rose-400 text-sm mb-4 text-center">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input
            type="password" required minLength={8} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            placeholder="Min 8 characters"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3.5 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2 group disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-rose-400 hover:text-rose-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
