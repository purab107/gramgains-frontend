'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface OnboardingFooterProps {
  step: number;
  loading: boolean;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({
  step,
  loading,
  canProceed,
  onBack,
  onNext,
  onFinish,
}) => {
  return (
    <footer className="w-full px-8 sm:px-16 lg:px-24 py-4 sm:py-5 flex items-center justify-between border-t border-zinc-900 shrink-0 bg-[#070B0A] z-10">
      {/* Back Button */}
      {step > 1 ? (
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-zinc-300 hover:text-white underline underline-offset-4 transition-colors"
        >
          Back
        </button>
      ) : (
        <div />
      )}

      {/* Next / Finish Button */}
      {step < 5 ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm sm:text-base px-8 py-3.5 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
        >
          <span>Next</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onFinish}
          disabled={loading}
          className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm sm:text-base px-8 py-3.5 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Entering...</span>
            </>
          ) : (
            <>
              <span>Enter GramGains →</span>
            </>
          )}
        </button>
      )}
    </footer>
  );
};

export default OnboardingFooter;
