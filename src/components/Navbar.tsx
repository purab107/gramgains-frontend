'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Flame, 
  Plus, 
  Calendar,
  LayoutDashboard,
  UtensilsCrossed,
  Bookmark,
  Calculator
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';

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

  const initials = userProfile?.name
    ? userProfile.name.charAt(0).toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-20 w-full bg-card border-b border-border px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Mobile Brand / Toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Mobile brand */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-foreground">GramGains</span>
        </div>

        {/* Date Selector for desktop */}
        <div className="hidden md:flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground font-medium">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Action CTA & Profile info */}
      <div className="flex items-center gap-3">
        {onOpenLogModal && (
          <Button
            size="sm"
            onClick={onOpenLogModal}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Meal</span>
          </Button>
        )}

        <div className="flex items-center gap-2.5 bg-background border border-border px-3 py-1.5 rounded-lg">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-foreground leading-none">
              {userProfile?.name ?? 'Athlete'}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {userProfile?.targetCalories ?? 2200} kcal
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-card border-b border-border p-4 space-y-2 md:hidden shadow-lg z-50">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-lg mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                onDateChange(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="bg-transparent text-xs font-semibold text-foreground outline-none"
            />
          </div>

          <Separator className="my-2" />

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
