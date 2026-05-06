"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/razorpay/create-order", { method: "POST" });
      const order = await response.json();

      if (order.error) throw new Error(order.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: order.currency,
        name: "Global Chanakya",
        description: "7-Day Premium Early Access",
        order_id: order.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            alert("Payment successful! You now have Premium Access.");
            router.push("/blogs");
            router.refresh();
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#f59e0b",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-md w-full border rounded-2xl shadow-xl p-8 bg-card text-center">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-full mb-6">PREMIUM PLAN</div>
        <h1 className="text-3xl font-bold mb-2">Weekly Early Access</h1>
        <p className="text-muted-foreground mb-6">Get 24-hour early access to our exclusive geopolitical intelligence reports.</p>
        
        <div className="text-5xl font-extrabold mb-8">
          ₹19 <span className="text-lg font-medium text-muted-foreground">/ 7 days</span>
        </div>

        <ul className="text-left space-y-3 mb-8 text-sm">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Read latest reports instantly
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> No 24-hour waiting period
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Exclusive Premium Badge
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Bookmark & Comment features
          </li>
        </ul>

        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-lg hover:bg-primary/90 transition shadow-md disabled:opacity-50"
        >
          {loading ? "Processing..." : "Subscribe Now"}
        </button>
      </div>
    </div>
  );
}
