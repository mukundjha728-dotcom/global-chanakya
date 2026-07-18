export default function BlogsLoading() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="w-full">
            <div className="w-24 h-6 bg-[var(--surface)] border border-[var(--border)] rounded mb-3 animate-pulse"></div>
            <div className="w-3/4 max-w-lg h-12 md:h-14 bg-[var(--surface)] rounded mb-4 animate-pulse"></div>
            <div className="w-1/2 max-w-md h-6 bg-[var(--surface)] rounded animate-pulse"></div>
          </div>
          <div className="w-full md:w-auto">
            <div className="relative w-full md:w-64 h-11 bg-[var(--surface)] border border-[var(--border)] rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Category filters Skeleton */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-24 h-10 bg-[var(--surface)] rounded-xl border border-[var(--border)] animate-pulse"></div>
          ))}
        </div>

        {/* Blog Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]/20 animate-pulse flex flex-col h-[400px]">
              <div className="w-full aspect-[16/9] bg-[var(--surface)] border-b border-[var(--border)]"></div>
              <div className="flex flex-col flex-1 p-5 md:p-6 lg:p-7">
                <div className="w-full h-6 bg-[var(--surface)] rounded mb-3"></div>
                <div className="w-4/5 h-6 bg-[var(--surface)] rounded mb-6"></div>
                
                <div className="w-full h-4 bg-[var(--surface)] rounded mb-2"></div>
                <div className="w-5/6 h-4 bg-[var(--surface)] rounded mb-2"></div>
                <div className="w-2/3 h-4 bg-[var(--surface)] rounded mb-6"></div>
                
                <div className="mt-auto pt-4 md:pt-5 border-t border-[var(--border)]/50 flex justify-between">
                  <div className="w-24 h-6 bg-[var(--surface)] rounded"></div>
                  <div className="w-16 h-6 bg-[var(--surface)] rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
