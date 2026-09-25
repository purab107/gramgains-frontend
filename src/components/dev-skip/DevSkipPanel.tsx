'use client';

import { isDevSkip, seedMockData, clearMockData } from '@/lib/dev-skip';
import { useDevSkip } from './DevSkipProvider';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  UtensilsCrossed,
  BarChart3,
  User,
  Bookmark,
  Calculator,
  LogIn,
  Bug,
} from 'lucide-react';

const DEV_PAGES = [
  { label: 'Dashboard', route: '/', icon: LayoutDashboard },
  { label: 'Daily Tracker', route: '/tracker', icon: UtensilsCrossed },
  { label: 'Analytics', route: '/analytics', icon: BarChart3 },
  { label: 'Profile', route: '/profile', icon: User },
  { label: 'Saved Meals', route: '/saved-meals', icon: Bookmark },
  { label: 'Calculator', route: '/calculator', icon: Calculator },
  { label: 'Login', route: '/login', icon: LogIn },
];

export function DevSkipPanel() {
  // Self-guard: render nothing if dev skip is not enabled
  if (!isDevSkip()) {
    return null;
  }

  const { isPanelOpen, closePanel, isSeeded } = useDevSkip();
  const router = useRouter();
  const [envValue, setEnvValue] = useState<string>('false');

  useEffect(() => {
    setEnvValue(process.env.NEXT_PUBLIC_DEV_SKIP || 'false');
  }, []);

  const handleSeed = async () => {
    await seedMockData();
    window.location.reload();
  };

  const handleClear = () => {
    clearMockData();
    window.location.reload();
  };

  const handleNavigate = (route: string) => {
    router.push(route);
    closePanel();
  };

  return (
    <Sheet open={isPanelOpen} onOpenChange={closePanel}>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-amber-500" />
            <SheetTitle>Dev Skip — Mock Mode</SheetTitle>
          </div>
          <SheetDescription>
            NEXT_PUBLIC_DEV_SKIP = {envValue}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {/* Mock Data Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                MOCK DATA
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className={`h-2 w-2 rounded-full ${isSeeded ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                  Status: {isSeeded ? 'Seeded' : 'Not seeded'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSeed}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  Seed Mock Data
                </Button>
                <Button
                  onClick={handleClear}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  Clear Mock Data
                </Button>
              </div>
            </div>

            <Separator />

            {/* Navigation Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                NAVIGATE TO PAGE
              </h3>
              <div className="space-y-1">
                {DEV_PAGES.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.route}
                      onClick={() => handleNavigate(page.route)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-muted rounded-md transition-colors"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{page.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {page.route}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Info Section */}
            <div className="text-xs text-muted-foreground">
              Dev Skip disabled in production
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}