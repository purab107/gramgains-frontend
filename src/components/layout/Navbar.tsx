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
  Home,
  SquarePen,
  Bookmark,
  Calculator,
  Bell,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserNav } from '@/components/auth/UserNav';

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
    { label: 'Home', href: '/', icon: Home },
    { label: 'Tracker', href: '/tracker', icon: SquarePen },
    { label: 'Saved Meals', href: '/saved-meals', icon: Bookmark },
    { label: 'Calculator', href: '/calculator', icon: Calculator },
  ];

  const fullName = userProfile?.name || 'Alex Carter';
  const firstName = fullName.split(' ')[0] || 'Alex';

  const formatHeaderDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <header className="w-full bg-transparent px-4 lg:px-8 py-4 flex items-center justify-between">
      {/* Mobile Brand / Toggle & Desktop Main Header Title */}
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

        {/* Main Header Title & Subtitle for Desktop */}
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight text-[#173b28] dark:text-emerald-400">
            Welcome back, {firstName}!
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fuel your goals, one meal at a time.
          </p>
        </div>
      </div>

      {/* Header Right Actions: Date | Divider | Bell | Dark Mode Toggle | Profile PFP */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Static Date Display */}
        <div className="flex items-center gap-2.5 text-[#5e716d]">
          <Calendar className="w-5 h-5 text-[#5e716d] shrink-0" />
          <span className="text-sm font-normal text-[#5e716d]">
            {formatHeaderDate(selectedDate)}
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-7 w-[1px] bg-border mx-0.5 hidden sm:block" />

        {/* Notification Bell with Green Indicator Badge */}
        <div className="relative p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-full hover:bg-muted/50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#4cd593] rounded-full ring-2 ring-card" />
        </div>

        {/* Dark Theme Button (Placeholder) */}
        <button
          type="button"
          onClick={() => {}}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50 focus:outline-none"
          title="Toggle Dark Theme (Coming Soon)"
          aria-label="Toggle Dark Theme"
        >
          <Moon className="w-5 h-5" />
        </button>

        {/* User Profile Dropdown (Circle PFP at last) */}
        <UserNav userProfileName={userProfile?.name} />
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
