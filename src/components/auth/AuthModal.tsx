'use client';

import React, { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-client';
import { Mail, Lock, User, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const { error: resError } = await signUp.email({
          email,
          password,
          name: name.trim() || 'Athlete',
        });
        if (resError) {
          setError(resError.message || 'Failed to sign up. Please try again.');
          setIsLoading(false);
          return;
        }
      } else {
        const { error: resError } = await signIn.email({
          email,
          password,
        });
        if (resError) {
          setError(resError.message || 'Invalid email or password.');
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[#68716F] hover:bg-[#f3f4f6] hover:text-[#171C1B] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e4f7ee] text-[#0d7649]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#171C1B]">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="mt-1 text-sm text-[#68716F]">
            {mode === 'login'
              ? 'Enter your credentials to access your nutrition tracker'
              : 'Start your fitness journey and track your gains'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#f8fafc] p-1 border border-[#e5e7eb]">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`rounded-lg py-2 text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-white text-[#171C1B] shadow-sm font-semibold'
                : 'text-[#68716F] hover:text-[#171C1B]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`rounded-lg py-2 text-sm font-medium transition-all ${
              mode === 'register'
                ? 'bg-white text-[#171C1B] shadow-sm font-semibold'
                : 'text-[#68716F] hover:text-[#171C1B]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#68716F] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#68716F]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Hunter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 pl-10 pr-4 text-sm text-[#171C1B] placeholder-[#9ca3af] focus:border-[#0f8651] focus:outline-none focus:ring-1 focus:ring-[#0f8651] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#68716F] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#68716F]" />
              <input
                type="email"
                required
                placeholder="athlete@gramgains.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 pl-10 pr-4 text-sm text-[#171C1B] placeholder-[#9ca3af] focus:border-[#0f8651] focus:outline-none focus:ring-1 focus:ring-[#0f8651] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#68716F] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#68716F]" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 pl-10 pr-4 text-sm text-[#171C1B] placeholder-[#9ca3af] focus:border-[#0f8651] focus:outline-none focus:ring-1 focus:ring-[#0f8651] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#0f8651] hover:bg-[#0d7649] py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In to Tracker' : 'Create Free Account'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
