'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Flame, 
  Plus, 
  User, 
  Calendar,
  LayoutDashboard,
  UtensilsCrossed,
  Bookmark,
  Calculator
} from 'lucide-react';

interface NavbarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  userProfile?: {
    name: string;
    targetCalories: number;
  } | null;
  onOpenLogModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedDate,
  onDateChange,
  userProfile,
  onOpenLogModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Tracker', href: '/tracker', icon: UtensilsCrossed },
    { label: 'Saved Meals', href: '/saved-meals', icon: Bookmark },
    { label: 'TDEE & Goals', href: '/calculator', icon: Calculator },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Brand / Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 md:hidden hover:text-white"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            GramGains
          </span>
        </div>

        {/* Date Selector for desktop */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-white/10 px-3 py-1.5 rounded-xl">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-400 font-medium">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Action CTA & Profile info */}
      <div className="flex items-center gap-3">
        {onOpenLogModal && (
          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Meal</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 bg-slate-900/60 border border-white/10 px-3 py-1.5 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white leading-none">
              {userProfile?.name ?? 'Athlete'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {userProfile?.targetCalories ?? 2200} kcal goal
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0F172A] border-b border-white/10 p-4 space-y-2 md:hidden shadow-2xl z-50">
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-2 rounded-xl mb-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-medium">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                onDateChange(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="bg-transparent text-xs font-semibold text-white outline-none"
            />
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
