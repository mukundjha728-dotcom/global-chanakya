export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views Card */}
        <div className="p-5 border border-white/[0.07] rounded-2xl bg-[#080808]">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Total Views</h3>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white">124.5K</p>
            <span className="text-xs font-medium text-emerald-400 mb-1">+12%</span>
          </div>
        </div>

        {/* Premium Users Card */}
        <div className="p-5 border border-white/[0.07] rounded-2xl bg-[#080808]">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Active Premium</h3>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white">1,245</p>
            <span className="text-xs font-medium text-emerald-400 mb-1">+4%</span>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="p-5 border border-white/[0.07] rounded-2xl bg-[#080808]">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Revenue (30d)</h3>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white">₹23.6K</p>
            <span className="text-xs font-medium text-rose-400 mb-1">-2%</span>
          </div>
        </div>

        {/* Published Blogs Card */}
        <div className="p-5 border border-white/[0.07] rounded-2xl bg-[#080808]">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Published Reports</h3>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white">184</p>
            <span className="text-xs font-medium text-emerald-400 mb-1">+8 this week</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 p-6 border border-white/[0.07] rounded-2xl bg-[#080808]">
          <h3 className="text-base font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-300 truncate">
                    Blog "The Emerging Indo-Pacific Security Architecture" was published.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago by Admin</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="p-6 border border-white/[0.07] rounded-2xl bg-[#080808]">
          <h3 className="text-base font-semibold text-white mb-6">Quick Links</h3>
          <div className="flex flex-col gap-3">
            <a href="/admin/blogs/new" className="p-3 text-sm font-medium text-center text-rose-400 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-colors">
              Write New Report
            </a>
            <a href="/admin/users" className="p-3 text-sm font-medium text-center text-gray-300 border border-white/[0.07] hover:bg-white/[0.04] rounded-xl transition-colors">
              Manage Users
            </a>
            <a href="/admin/settings" className="p-3 text-sm font-medium text-center text-gray-300 border border-white/[0.07] hover:bg-white/[0.04] rounded-xl transition-colors">
              Platform Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
