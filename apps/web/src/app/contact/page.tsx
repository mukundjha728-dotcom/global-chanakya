import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Contact Desk",
  description: "Contact the Global Chanakya intelligence desk.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Contact Desk</h1>
          <p className="text-gray-400 max-w-xl text-lg">
            Reach out to our editorial board, report tips, or contact our support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Editorial Desk</h3>
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Mail className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="font-medium">editor@globalchanakya.com</p>
                  <p className="text-xs text-gray-500">For pitches and analysis tips</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Reader Support</h3>
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">support@globalchanakya.com</p>
                  <p className="text-xs text-gray-500">For account and access issues</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Headquarters</h3>
              <div className="flex items-start gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium">Global Chanakya Desk</p>
                  <p className="text-sm text-gray-400 mt-1">New Delhi, India</p>
                  <p className="text-xs text-gray-500 mt-1">Virtual operations worldwide.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#0a0a0a] border border-white/[0.08] p-8 md:p-10 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6">Send a Secure Message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                    <input type="text" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input type="email" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" placeholder="you@domain.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                  <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none appearance-none">
                    <option>Editorial Tip</option>
                    <option>Reader Support</option>
                    <option>Partnership Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                  <textarea rows={5} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none resize-none" placeholder="How can we help?"></textarea>
                </div>
                <button type="button" className="w-full md:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  Send Dispatch <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
