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
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  userProfile?: {
    name: string;
    targetCalories?: number;
  } | null;
  onOpenLogModal?: () => void;
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedDate = new Date().toISOString().split('T')[0],
  onDateChange,
  userProfile,
  onOpenLogModal,
  title,
  subtitle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Tracker', href: '/tracker', icon: SquarePen },
    { label: 'Saved Meals', href: '/saved-meals', icon: Bookmark },
    { label: 'Calculator', href: '/calculator', icon: Calculator },
  ];

  const fullName = userProfile?.name || 'Purab';
  const firstName = fullName.split(' ')[0] || 'Purab';

  // Determine title & subtitle dynamically if not explicitly provided
  let headerTitle = title;
  let headerSubtitle = subtitle;

  if (!headerTitle || !headerSubtitle) {
    if (pathname === '/tracker') {
      headerTitle = headerTitle || 'Daily Tracker';
      headerSubtitle = headerSubtitle || 'Log your meals, track macros, and monitor water intake.';
    } else if (pathname === '/saved-meals') {
      headerTitle = headerTitle || 'Saved Meals';
      headerSubtitle = headerSubtitle || 'Manage your custom recipes and saved meal preps.';
    } else if (pathname === '/calculator') {
      headerTitle = headerTitle || 'Metabolic Calculator';
      headerSubtitle = headerSubtitle || 'Calculate your TDEE, BMR, and target macronutrient goals.';
    } else {
      // Default to Home tab header format
      headerTitle = headerTitle || `Welcome back, ${firstName}!`;
      headerSubtitle = headerSubtitle || 'Fuel your goals, one meal at a time.';
    }
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {headerTitle}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {headerSubtitle}
          </p>
        </div>
      </div>

      {/* Header Right Actions: Date | Divider | Bell | Dark Mode Toggle | Profile PFP */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Static Date Display */}
        <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
          <Calendar className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
          <span className="text-sm font-normal text-[var(--text-secondary)]">
            {formatHeaderDate(selectedDate)}
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-7 w-[1px] bg-[var(--border)] mx-0.5 hidden sm:block" />

        {/* Notification Bell with Green Indicator Badge */}
        <div className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer rounded-full hover:bg-[var(--surface-3)]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[var(--accent)] rounded-full ring-2 ring-[var(--surface)]" />
        </div>

        {/* Dark Theme Button */}
        <button
          type="button"
          onClick={() => {}}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--surface-3)] focus:outline-none"
          title="Matte Dark Theme Active"
          aria-label="Theme Mode"
        >
          <Moon className="w-5 h-5 text-[var(--accent)]" />
        </button>

        {/* User Profile Dropdown (Circle PFP at last) */}
        <UserNav userProfileName={userProfile?.name} />
      </div>

      {/* Mobile Slide-down Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[var(--surface-2)] border-b border-[var(--border)] p-4 space-y-2 md:hidden shadow-xl z-50">
          <div className="flex items-center gap-2 bg-[var(--surface-3)] border border-[var(--border)] px-3 py-2 rounded-lg mb-3">
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                onDateChange?.(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="bg-transparent text-xs font-semibold text-[var(--text-primary)] outline-none"
            />
          </div>

          <Separator className="my-2 bg-[var(--border)]" />

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
                    ? 'bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-border)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]'
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
