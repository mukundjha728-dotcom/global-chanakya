"use client";
import { useState } from "react";

interface AdminUser {
  name?: string;
  email?: string;
  image?: string;
}

export default function AdminSettingsClient({ user }: { user: AdminUser }) {
  const [saved, setSaved] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Global Chanakya",
    siteTagline: "Premium Geopolitics & Strategic Intelligence",
    siteUrl: "https://global-chanakya-web.vercel.app",
    contactEmail: "contact@globalchanakya.in",
    twitterHandle: "@globalchanakya",
    linkedinUrl: "https://linkedin.com/company/globalchanakya",
    articlesPerPage: "10",
    premiumPrice: "199",
    earlyAccessHours: "24",
    maintenanceMode: false,
    allowSignups: true,
    commentModeration: true,
  });

  function update(key: string, value: string | boolean) {
    setSiteSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all";
  const labelClass = "block text-xs text-gray-400 font-medium mb-1.5 uppercase tracking-wider";

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings ⚙️</h1>
          <p className="text-gray-400 text-sm mt-1">Global Chanakya platform configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-all"
        >
          {saved ? "✓ Saved!" : "💾 Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Admin Profile Card */}
        <div className="bg-[#0d0d17] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            👤 Admin Profile
          </h2>
          <div className="flex items-center gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-16 h-16 rounded-full ring-2 ring-amber-400/40" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-bold text-xl">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-semibold">{user.name}</p>
              <p className="text-amber-400 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
                  🔒 Super Admin
                </span>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                  Google OAuth
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-300 text-xs">
              🔒 Admin account is permanently locked to <strong>{user.email}</strong>. 
              No one else can ever become admin.
            </p>
          </div>
        </div>

        {/* Site Settings */}
        <div className="bg-[#0d0d17] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            🌐 Site Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Site Name</label>
              <input type="text" value={siteSettings.siteName} onChange={(e) => update("siteName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input type="text" value={siteSettings.siteTagline} onChange={(e) => update("siteTagline", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact Email</label>
              <input type="email" value={siteSettings.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Twitter Handle</label>
              <input type="text" value={siteSettings.twitterHandle} onChange={(e) => update("twitterHandle", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="bg-[#0d0d17] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            📰 Content Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Articles Per Page</label>
              <input type="number" value={siteSettings.articlesPerPage} onChange={(e) => update("articlesPerPage", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Early Access (hours)</label>
              <input type="number" value={siteSettings.earlyAccessHours} onChange={(e) => update("earlyAccessHours", e.target.value)} className={inputClass} />
              <p className="text-gray-600 text-xs mt-1">Premium members get early access for this many hours</p>
            </div>
            <div>
              <label className={labelClass}>Premium Price (₹/month)</label>
              <input type="number" value={siteSettings.premiumPrice} onChange={(e) => update("premiumPrice", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Platform Toggles */}
        <div className="bg-[#0d0d17] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            🎛️ Platform Controls
          </h2>
          <div className="space-y-4">
            {[
              {
                key: "maintenanceMode",
                label: "🚧 Maintenance Mode",
                desc: "Site visitors ko maintenance page dikhao",
                danger: true,
              },
              {
                key: "allowSignups",
                label: "✅ Allow New Signups",
                desc: "Naye users ko register hone do",
                danger: false,
              },
              {
                key: "commentModeration",
                label: "💬 Comment Moderation",
                desc: "Comments publish hone se pehle review ho",
                danger: false,
              },
            ].map(({ key, label, desc, danger }) => (
              <div key={key} className={`flex items-start gap-4 p-3 rounded-lg border ${danger ? "border-red-500/20 bg-red-500/5" : "border-white/5 bg-white/3"}`}>
                <div
                  onClick={() => update(key, !siteSettings[key as keyof typeof siteSettings])}
                  className={`mt-0.5 w-10 h-5 rounded-full transition-all relative cursor-pointer flex-shrink-0 ${
                    siteSettings[key as keyof typeof siteSettings] ? (danger ? "bg-red-500" : "bg-amber-500") : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${
                      siteSettings[key as keyof typeof siteSettings] ? "translate-x-5" : ""
                    }`}
                  />
                </div>
                <div>
                  <p className={`text-sm font-medium ${danger ? "text-red-300" : "text-white"}`}>{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Config */}
        <div className="bg-[#0d0d17] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
            💳 Razorpay Configuration
          </h2>
          <p className="text-gray-500 text-xs mb-4">Payment keys .env file mein set hain</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Razorpay Key ID</label>
              <input
                type="text"
                value="rzp_••••••••••••"
                readOnly
                className={`${inputClass} cursor-not-allowed opacity-60`}
              />
            </div>
            <div>
              <label className={labelClass}>Mode</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <span className="text-yellow-400 text-xs">⚠️</span>
                <span className="text-yellow-300 text-xs font-medium">Test Mode Active</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-xs mt-3">
            Production keys set karne ke liye .env file mein <code className="text-amber-400">RAZORPAY_KEY_ID</code> aur <code className="text-amber-400">RAZORPAY_KEY_SECRET</code> update karein
          </p>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-400 font-semibold text-sm mb-4 flex items-center gap-2">
            ⚠️ Danger Zone
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-red-500/10 rounded-lg">
              <div>
                <p className="text-white text-sm font-medium">Clear All Cache</p>
                <p className="text-gray-500 text-xs">Next.js cache purge karein</p>
              </div>
              <button className="px-3 py-1.5 text-xs border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                Clear Cache
              </button>
            </div>
            <div className="flex items-center justify-between p-3 border border-red-500/10 rounded-lg">
              <div>
                <p className="text-white text-sm font-medium">Export All Data</p>
                <p className="text-gray-500 text-xs">Users aur articles ka JSON export</p>
              </div>
              <button className="px-3 py-1.5 text-xs border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/10 transition-all">
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
