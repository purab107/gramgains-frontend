'use client';

import React, { useState } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { AuthModal } from './AuthModal';
import { User as UserIcon, LogOut, LogIn, ChevronDown } from 'lucide-react';

export function UserNav() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const user = session?.user;

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
      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 border border-[#e5e7eb] animate-pulse shadow-sm">
        <div className="h-6 w-6 rounded-full bg-slate-200" />
        <div className="h-3 w-16 rounded bg-slate-200" />
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 rounded-xl border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm text-[#171C1B] hover:bg-[#f3f4f6] shadow-sm transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e4f7ee] text-[#0d7649] font-semibold text-xs border border-[#e4f7ee]">
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <span className="font-medium text-[#171C1B] max-w-[120px] truncate">
                {user.name || user.email.split('@')[0]}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#68716F]" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-[#e5e7eb] bg-white p-2 shadow-sm backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#e5e7eb] mb-1">
                    <p className="text-xs font-semibold text-[#171C1B] truncate">{user.name || 'Athlete'}</p>
                    <p className="text-[11px] text-[#68716F] truncate">{user.email}</p>
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
