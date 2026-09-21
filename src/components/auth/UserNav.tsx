'use client';

import React, { useState } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { AuthModal } from './AuthModal';
import { LogOut, LogIn } from 'lucide-react';

interface UserNavProps {
  userProfileName?: string;
}

export function UserNav({ userProfileName }: UserNavProps) {
  const { data: session, isPending } = useSession();
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

  if (isPending) {
    return (
      <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
    );
  }

  const initials = displayName ? displayName.charAt(0).toUpperCase() : 'A';

  return (
    <>
      <div className="relative">
        {user || displayName ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center rounded-full p-0.5 hover:ring-2 hover:ring-[#0f8651]/30 transition-all focus:outline-none"
              aria-label="User Profile Menu"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#e4f7ee] border border-[#d2f3e3] flex items-center justify-center shrink-0">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-xs text-[#0d7649]">
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
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-[#e5e7eb] bg-white p-2 shadow-lg backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#e5e7eb] mb-1">
                    <p className="text-xs font-semibold text-[#171C1B] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#68716F] truncate">{user?.email || 'user@gramgains.com'}</p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
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
              className="flex items-center gap-1.5 rounded-xl border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-medium text-[#171C1B] hover:bg-[#f3f4f6] shadow-sm transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => handleOpenAuth('register')}
              className="flex items-center gap-1.5 rounded-xl bg-[#0f8651] hover:bg-[#0d7649] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
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

