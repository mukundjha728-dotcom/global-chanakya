export const metadata = {
  title: "Refund Policy",
  description: "Global Chanakya Subscription Refund Policy.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
      <div className="max-w-3xl mx-auto prose prose-invert prose-rose">
        <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
        
        <p className="text-gray-400">Last Updated: May 2026</p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Premium Subscription</h2>
        <p className="text-gray-400">
          The Global Chanakya premium subscription provides immediate access to digital intelligence content. Due to the immediate delivery and nature of this digital content, all sales are final.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Non-Refundable Nature</h2>
        <p className="text-gray-400">
          We do not offer refunds for the ₹19 / 7-Day Premium Early Access pass once the payment has been processed and access has been granted, as the content becomes immediately available to the user.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Exceptional Circumstances</h2>
        <p className="text-gray-400">
          Refunds may only be considered in the following exceptional circumstances:
        </p>
        <ul className="text-gray-400 list-disc pl-6 space-y-2 mt-4">
          <li>Duplicate billing for the same access period due to a technical error.</li>
          <li>Platform downtime exceeding 48 hours during your 7-day active subscription period.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Contacting Support</h2>
        <p className="text-gray-400">
          If you believe you have been billed in error, please contact our support desk at <a href="mailto:support@globalchanakya.com" className="text-rose-400">support@globalchanakya.com</a> within 3 days of the transaction.
        </p>
      </div>
    </div>
  );
}
