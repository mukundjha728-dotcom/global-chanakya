"use client";

import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-black">
      <div className="w-full max-w-xl">
        <div className="bg-gray-900 border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30">
              <Shield className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Apply for Access</h2>
              <p className="text-gray-400 text-sm">Join the enterprise intelligence network.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                  placeholder="James"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                  placeholder="Bond"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Corporate Email</label>
              <input
                type="email"
                required
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                placeholder="name@organization.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 text-gray-400 text-xs leading-relaxed">
                <input type="checkbox" required className="mt-1 rounded bg-black border-white/20 text-rose-500 focus:ring-rose-500/50" />
                <span>
                  I confirm that I have read and agree to the <Link href="/terms" className="text-rose-400 hover:text-rose-300">Terms of Service</Link> and <Link href="/privacy" className="text-rose-400 hover:text-rose-300">Privacy Policy</Link>. I understand this platform contains confidential intelligence.
                </span>
              </label>
            </div>

            <button type="submit" className="w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-gray-200 transition-colors mt-6 flex items-center justify-center gap-2 group">
              Submit Application
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have clearance? <Link href="/auth/signin" className="text-white hover:text-gray-300 font-medium">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
