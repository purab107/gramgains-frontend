'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  BookOpen, 
  Bookmark, 
  Calculator, 
  Flame, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

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
        return { label: 'Weight Loss', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'BULK':
        return { label: 'Muscle Bulk', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default:
        return { label: 'Maintain', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    }
  };

  const goalInfo = getGoalBadge(userProfile?.goal);

  return (
    <aside className="w-64 bg-[#0F172A]/80 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between shrink-0 min-h-screen transition-all duration-300 hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              GramGains
            </h1>
            <p className="text-xs text-slate-400">Precision Calorie Tracker</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/10 text-white border border-emerald-500/30 shadow-md shadow-emerald-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium leading-none">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{item.description}</div>
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Quick Info Box */}
      <div className="p-4 m-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Daily Target</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${goalInfo.color}`}>
            {goalInfo.label}
          </span>
        </div>

        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {userProfile?.targetCalories ?? 2200}{' '}
            <span className="text-xs font-normal text-slate-400">kcal/day</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Logged as <span className="text-slate-200 font-medium">{userProfile?.name ?? 'Athlete'}</span>
          </p>
        </div>
      </div>
    </aside>
  );
};
