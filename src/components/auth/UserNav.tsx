'use client';

import React, { useState } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { AuthModal } from './AuthModal';
import { LogOut, LogIn, UserX } from 'lucide-react';
import { useIsGuest, endGuestSession } from '@/lib/guest-session';

interface UserNavProps {
  userProfileName?: string;
}

export function UserNav({ userProfileName }: UserNavProps) {
  const { data: session, isPending } = useSession();
  const isGuest = useIsGuest();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const user = session?.user;
  const displayName = userProfileName || user?.name || user?.email?.split('@')[0] || 'Alex Carter';

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
    router.replace('/login');
  };

  const handleExitGuest = () => {
    endGuestSession();
    setIsDropdownOpen(false);
    router.replace('/login');
  };

  if (isPending && !isGuest) {
    return (
      <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
    );
  }

  // --- GUEST MODE UI ---
  if (isGuest) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center rounded-full p-0.5 hover:ring-2 hover:ring-primary/30 transition-all focus:outline-none"
            aria-label="Guest User Menu"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
              <UserX className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-popover text-popover-foreground p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs font-semibold text-foreground">Guest Explorer</p>
                  <p className="text-[11px] text-amber-500 font-medium mt-0.5">Session-only · data not saved</p>
                </div>

                <button
                  onClick={() => { setIsDropdownOpen(false); handleOpenAuth('login'); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => { setIsDropdownOpen(false); handleOpenAuth('register'); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <span className="h-4 w-4 flex items-center justify-center text-xs font-bold">✦</span>
                  <span>Create Free Account</span>
                </button>

                <div className="my-1 border-t border-border" />

                <button
                  onClick={handleExitGuest}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <UserX className="h-4 w-4" />
                  <span>Exit Guest Mode</span>
                </button>
              </div>
            </>
          )}
        </div>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultMode={authMode}
          onSuccess={() => {
            setIsAuthOpen(false);
            endGuestSession();
            window.location.replace('/');
          }}
        />
      </>
    );
  }

  // --- AUTHENTICATED / UNAUTHENTICATED UI ---
  const initials = displayName ? displayName.charAt(0).toUpperCase() : 'A';

  return (
    <>
      <div className="relative">
        {user || displayName ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center rounded-full p-0.5 hover:ring-2 hover:ring-primary/30 transition-all focus:outline-none"
              aria-label="User Profile Menu"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-accent border border-border flex items-center justify-center shrink-0">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-xs text-accent-foreground">
                    {initials}
                  </span>
                )}
              </div>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-popover text-popover-foreground p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'user@gramgains.com'}</p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAuth('login')}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted shadow-sm transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => handleOpenAuth('register')}
              className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all"
            >
              <span>Register</span>
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
        onSuccess={() => {
          setIsAuthOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}

