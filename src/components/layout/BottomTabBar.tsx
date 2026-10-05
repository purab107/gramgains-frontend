'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  SquarePen, 
  BarChart3, 
  Bookmark, 
  User 
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
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
    label: 'Saved',
    href: '/saved-meals',
    icon: Bookmark,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export const BottomTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/90 dark:bg-[#0B100F]/90 backdrop-blur-xl border-t border-border/80 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] transition-all"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all duration-200 select-none active:scale-95 ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {/* Active Indicator Top Glow Dot / Pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(10,155,130,0.6)] animate-in fade-in zoom-in-75 duration-200" />
              )}

              {/* Icon Container with subtle active background highlight */}
              <div
                className={`p-1 rounded-xl transition-colors duration-200 ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
              </div>

              {/* Tab Label */}
              <span className="text-[10px] tracking-tight mt-0.5 font-medium leading-none">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
