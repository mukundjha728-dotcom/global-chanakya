"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Zap, CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // If not logged in, redirect to signin with subscribe as callbackUrl
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent("/subscribe")}`);
    }
  }, [status, router]);

  // Already premium — redirect to blogs
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "premium") {
      router.replace("/blogs");
    }
  }, [status, session, router]);

  const handlePayment = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/subscribe")}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/razorpay/create-order", { method: "POST" });
      const order = await response.json();

      if (order.error) throw new Error(order.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Global Chanakya",
        description: "7-Day Premium Early Access",
        order_id: order.id,
        prefill: {
          name: session.user?.name ?? "User",
          email: session.user?.email ?? "",
        },
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            alert("✅ Payment successful! You now have Premium Access for 7 days.");
            router.push("/blogs");
            router.refresh();
          } else {
            alert("❌ Payment verification failed. Contact support if charged.");
          }
        },
        theme: { color: "#f59e0b" },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-black selection:bg-amber-900 selection:text-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left copy */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-semibold uppercase tracking-wider w-fit">
            <Zap className="w-3.5 h-3.5" />
            Premium Access
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
            Intelligence,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">
              Delivered First.
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Stop reading yesterday's news. Get uncompromising, unvarnished geopolitical analysis{" "}
            <strong className="text-white">24 hours before</strong> it reaches the public domain.
          </p>

          {session && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{session.user?.name || "Anonymous"}</p>
                <p className="text-gray-500 text-xs">{session.user?.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 mt-2">
            {[
              "Instant 24-hour early access to all new reports.",
              "Exclusive Premium badge on your profile.",
              "Ad-free, tracker-free reading experience.",
              "Priority comment & bookmarking tools.",
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right checkout card */}
        <div className="relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative border border-white/10 bg-[#080808] p-8 md:p-10 rounded-[2rem] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Weekly Pass</h3>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300">
                Auto-expires
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">₹19</span>
                <span className="text-gray-500 font-medium">/ 7 days</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Zero commitment. Renew manually when needed.</p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <>Unlock Premium Access <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <div className="mt-8 pt-8 border-t border-white/[0.06] flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <ShieldCheck className="w-5 h-5 text-amber-500/60" />
                <span>Secured by Razorpay 256-bit encryption.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <ShieldAlert className="w-5 h-5 text-gray-600" />
                <span>No automatic deductions or recurring charges.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
