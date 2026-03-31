'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Library, 
  Calculator, 
  CreditCard, 
  Home,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Student Registration', href: '/dashboard/students/register', icon: Users },
  { name: 'All Students', href: '/dashboard/students', icon: Users },
  { name: 'All Books', href: '/dashboard/books', icon: BookOpen },
  { name: 'Add Book', href: '/dashboard/books/add', icon: BookOpen },
  { name: 'Issue Book', href: '/dashboard/book-issue', icon: BookOpen },
  { name: 'Fee Calculator', href: '/dashboard/fees/calculator', icon: Calculator },
  { name: 'Pending Payments', href: '/dashboard/fees/pending', icon: CreditCard },
  { name: 'Submit Fee', href: '/dashboard/fees/submit', icon: CreditCard },
  { name: 'System Settings', href: '/dashboard/settings', icon: SettingsIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    if (isMounted) {
      setTimeout(() => setMounted(true), 0);
    }
    return () => { isMounted = false; };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  // Return consistent layout during SSR and initial client render to avoid hydration mismatch
  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 bg-indigo-900 text-white flex flex-col">
          <div className="p-6 border-b border-indigo-800">
            <div className="flex items-center gap-3">
              <Library className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Library MS</h1>
                <p className="text-xs text-indigo-300">Management System</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-indigo-300">Loading...</div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <main className="p-8">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <Library className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Library MS</h1>
              <p className="text-xs text-indigo-300">Management System</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-indigo-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-indigo-200 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
          </h2>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
