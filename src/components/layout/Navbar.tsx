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
  Scale,
  BarChart3,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserNav } from '@/components/auth/UserNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useIsGuest } from '@/lib/guest-session';

interface NavbarProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  userProfile?: {
    name: string;
    targetCalories?: number;
  } | null;
  onOpenLogModal?: () => void;
  onOpenWeightModal?: () => void;
  hasPendingWeight?: boolean;
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedDate = new Date().toISOString().split('T')[0],
  onDateChange,
  userProfile,
  onOpenLogModal,
  onOpenWeightModal,
  hasPendingWeight = false,
  title,
  subtitle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const isGuest = useIsGuest();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Tracker', href: '/tracker', icon: SquarePen },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Saved Meals', href: '/saved-meals', icon: Bookmark },
    { label: 'Calculator', href: '/calculator', icon: Calculator },
    { label: 'Profile', href: '/profile', icon: User },
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
    } else if (pathname === '/analytics') {
      headerTitle = headerTitle || 'Metabolic Analytics';
      headerSubtitle = headerSubtitle || 'Real-world energy expenditure, smoothed weight trends, and actionable insights.';
    } else if (pathname === '/profile') {
      headerTitle = headerTitle || 'Profile & Metabolic Goals';
      headerSubtitle = headerSubtitle || 'Adjust your target rate of change, macro distribution, and check-in schedules.';
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {headerTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {headerSubtitle}
          </p>
        </div>
      </div>

      {/* Header Right Actions: Date | Divider | Bell | Dark Mode Toggle | Profile PFP */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Guest Mode Pill */}
        {isGuest && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1">
            <UserX className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-semibold text-amber-600">Guest Session</span>
          </div>
        )}

        {/* Static Date Display */}
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
          <span className="text-sm font-normal text-muted-foreground">
            {formatHeaderDate(selectedDate)}
          </span>
        </div>


        {/* Vertical Divider */}
        <div className="h-7 w-[1px] bg-border mx-0.5 hidden sm:block" />

        {/* Notification Bell with Indicator Badge & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-full hover:bg-muted/50 focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {hasPendingWeight ? (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-foreground">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notifications</h4>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>

              <div className="py-2 space-y-2">
                {hasPendingWeight ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Today&apos;s Weigh-In Pending</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          You haven&apos;t logged your scale reading today. Consistent tracking keeps your adaptive TDEE calibrated.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNotificationsOpen(false);
                        onOpenWeightModal?.();
                      }}
                      className="w-full h-8 text-xs font-semibold gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Log Today&apos;s Weight</span>
                    </Button>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    All caught up! No pending notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

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
                onDateChange?.(e.target.value);
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
