'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Bookmark, 
  Calculator, 
  Flame, 
  ChevronRight,
  Target
} from 'lucide-react';
import { Badge } from './ui/badge';

interface SidebarProps {
  userProfile?: {
    name: string;
    targetCalories: number;
    goal: string;
  } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ userProfile }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Daily overview & stats',
    },
    {
      label: 'Meal Tracker',
      href: '/tracker',
      icon: UtensilsCrossed,
      description: 'Log food & check macros',
    },
    {
      label: 'Saved Meals',
      href: '/saved-meals',
      icon: Bookmark,
      description: 'Custom recipes & templates',
    },
    {
      label: 'TDEE & Goals',
      href: '/calculator',
      icon: Calculator,
      description: 'Calculate maintenance & targets',
    },
  ];

  const getGoalBadge = (goal?: string) => {
    switch (goal) {
      case 'WEIGHT_LOSS':
        return { label: 'Weight Loss' };
      case 'BULK':
        return { label: 'Muscle Bulk' };
      default:
        return { label: 'Maintain' };
    }
  };

  const goalInfo = getGoalBadge(userProfile?.goal);

  return (
    <aside className="w-64 bg-[#008785] border-r border-[#006f6d] flex flex-col justify-between h-screen sticky top-0 shrink-0 overflow-hidden hidden md:flex z-30 text-white shadow-md">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#006f6d] flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#006f6d] flex items-center justify-center text-white shadow-inner border border-teal-600/30">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">
              GramGains
            </h1>
            <p className="text-[11px] text-teal-100/80">Calorie & Macro Tracker</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[10px] font-semibold text-teal-100/70 uppercase tracking-wider">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between p-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-[#006f6d] text-white font-medium shadow-sm border border-[#005a58]'
                    : 'text-teal-100 hover:text-white hover:bg-[#006f6d]/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#006f6d]/70 text-teal-100 group-hover:text-white'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-none text-white">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isActive ? 'text-teal-100' : 'text-teal-100/70'}`}>{item.description}</div>
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Quick Info Box */}
      <div className="p-3.5 m-3 rounded-xl bg-[#006f6d] border border-[#005a58] space-y-2.5 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-teal-200" />
            <span className="text-[11px] font-semibold text-white">Daily Target</span>
          </div>
          <Badge variant="secondary" className="normal-case tracking-normal">
            {goalInfo.label}
          </Badge>
        </div>

        <div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {userProfile?.targetCalories ?? 2200}{' '}
            <span className="text-xs font-normal text-teal-100/80">kcal/day</span>
          </div>
          <p className="text-[10px] text-teal-100/80 mt-0.5">
            Logged as <span className="text-white font-medium">{userProfile?.name ?? 'Athlete'}</span>
          </p>
        </div>
      </div>
    </aside>
  );
};
