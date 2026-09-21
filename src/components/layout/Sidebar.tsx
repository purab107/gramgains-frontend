'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  SquarePen, 
  Bookmark, 
  Calculator, 
  Settings, 
  LogOut,
  Flame
} from 'lucide-react';
import { signOut } from '@/lib/auth-client';

interface SidebarProps {
  userProfile?: {
    name: string;
    targetCalories: number;
    goal: string;
  } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ userProfile }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      label: 'Tracker',
      href: '/tracker',
      icon: SquarePen,
    },
    {
      label: 'Saved Meals',
      href: '/saved-meals',
      icon: Bookmark,
    },
    {
      label: 'Calculator',
      href: '/calculator',
      icon: Calculator,
    },
  ];

  return (
    <aside className="w-64 bg-[#fcfdfe] border-r border-[#e5e7eb] flex flex-col justify-between h-screen sticky top-0 shrink-0 overflow-hidden hidden md:flex z-30 text-[#171C1B]">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#0f8651] flex items-center justify-center text-white shadow-sm">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-[#171C1B]">
              GramGains
            </h1>
            <p className="text-[11px] text-[#68716F]">Macro & Calorie Tracker</p>
          </div>
        </div>

        {/* Main Navigation Items */}
        <nav className="px-3.5 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-[#e4f7ee] text-[#0d7649] font-semibold'
                    : 'text-[#4b5563] hover:text-[#0d7649] hover:bg-[#e4f7ee]/50'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0d7649]' : 'text-[#4b5563]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation Items (Settings & Logout) */}
      <div className="px-3.5 pb-6 pt-2 space-y-1.5 border-t border-[#e5e7eb]">
        <Link
          href="/calculator"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm font-medium ${
            pathname === '/settings'
              ? 'bg-[#e4f7ee] text-[#0d7649] font-semibold'
              : 'text-[#4b5563] hover:text-[#0d7649] hover:bg-[#e4f7ee]/50'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0 text-[#4b5563]" />
          <span>Settings</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-[#4b5563] hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 shrink-0 text-[#4b5563]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
