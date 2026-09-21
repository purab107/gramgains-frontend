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
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col justify-between h-screen sticky top-0 shrink-0 overflow-hidden hidden md:flex z-30 text-[var(--text-primary)]">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white shadow-xs">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
              GramGains
            </h1>
            <p className="text-[11px] text-[var(--text-secondary)]">Macro & Calorie Tracker</p>
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
                    ? 'bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-border)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation Items (Settings & Logout) */}
      <div className="px-3.5 pb-6 pt-2 space-y-1.5 border-t border-[var(--border)]">
        <Link
          href="/calculator"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm font-medium ${
            pathname === '/settings'
              ? 'bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-border)] font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] border border-transparent'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0 text-[var(--text-secondary)]" />
          <span>Settings</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-950/20"
        >
          <LogOut className="w-5 h-5 shrink-0 text-[var(--text-secondary)]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
