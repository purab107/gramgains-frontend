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
      <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 px-3 py-1.5 border border-zinc-800 animate-pulse">
        <div className="h-6 w-6 rounded-full bg-zinc-800" />
        <div className="h-3 w-16 rounded bg-zinc-800" />
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
              className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30">
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <span className="font-medium text-white max-w-[120px] truncate">
                {user.name || user.email.split('@')[0]}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user.name || 'Athlete'}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
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
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => handleOpenAuth('register')}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-black shadow-md shadow-emerald-500/20 transition-all"
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
