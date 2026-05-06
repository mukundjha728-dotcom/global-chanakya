import Link from 'next/link';
import { auth } from '@/auth';

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold font-serif tracking-tight">
              Global Chanakya
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/blogs" className="text-muted-foreground hover:text-foreground font-medium">Feed</Link>
            {session ? (
              <div className="flex items-center space-x-3">
                {(session.user as any)?.role === 'premium' && (
                  <span className="px-2 py-1 text-xs font-bold bg-amber-500 text-white rounded-md">PREMIUM</span>
                )}
                <span className="text-sm font-medium">{session.user?.name}</span>
              </div>
            ) : (
              <Link href="/auth/signin" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
