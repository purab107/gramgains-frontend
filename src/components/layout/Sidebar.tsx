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
  Flame,
  UserX,
  BarChart3,
  User
} from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { useIsGuest, endGuestSession } from '@/lib/guest-session';

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
  const isGuest = useIsGuest();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleExitGuest = () => {
    endGuestSession();
    router.replace('/login');
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
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
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
    <aside className="w-64 bg-card border-r border-border flex flex-col justify-between h-screen sticky top-0 shrink-0 overflow-hidden hidden md:flex z-30 text-foreground">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-foreground">
              GramGains
            </h1>
            <p className="text-[11px] text-muted-foreground">Macro &amp; Calorie Tracker</p>
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
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:text-accent-foreground hover:bg-accent/50'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation Items (Profile & Logout/Guest) */}
      <div className="px-3.5 pb-6 pt-2 space-y-1.5 border-t border-border">
        {!isGuest && (
          <Link
            href="/profile"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm font-medium ${
              pathname === '/profile'
                ? 'bg-accent text-accent-foreground font-semibold'
                : 'text-muted-foreground hover:text-accent-foreground hover:bg-accent/50'
            }`}
          >
            <User className="w-5 h-5 shrink-0 text-muted-foreground" />
            <span>Profile &amp; Settings</span>
          </Link>
        )}

        {isGuest ? (
          <button
            onClick={handleExitGuest}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-amber-600 hover:bg-amber-500/10"
          >
            <UserX className="w-5 h-5 shrink-0" />
            <span>Exit Guest Mode</span>
          </button>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 shrink-0 text-muted-foreground" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};
