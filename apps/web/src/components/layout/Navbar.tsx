import Link from 'next/link';
import { auth } from '@/auth';
import { Globe, Lock, User, LogOut } from 'lucide-react';

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-rose-600" />
            <span className="text-2xl font-bold tracking-tighter uppercase text-white">
              Global <span className="text-rose-600">Chanakya</span>
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/blogs" className="hover:text-white transition-colors">Latest Intel</Link>
          <Link href="/premium" className="hover:text-white transition-colors flex items-center gap-1">
            <Lock className="w-4 h-4 text-rose-500" /> Premium
          </Link>
          
          {session ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <User className="w-4 h-4 text-gray-300" />
                <span className="text-white">{(session.user as any)?.name || 'Agent'}</span>
                {(session.user as any)?.role === 'premium' && (
                  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 rounded border border-rose-500/30">PRO</span>
                )}
                {(session.user as any)?.role === 'admin' && (
                  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">ADMIN</span>
                )}
              </div>
              <Link href="/api/auth/signout" className="text-gray-400 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <Link href="/auth/signin" className="px-5 py-2.5 bg-white text-black rounded-full hover:bg-gray-200 transition-colors font-semibold">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
