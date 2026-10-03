import React from 'react';
import { X } from 'lucide-react';

interface OnboardingHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingHelpModal: React.FC<OnboardingHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-blur">
      <div className="w-full max-w-md rounded-3xl bg-[#0E1513] border border-zinc-800 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">How GramGains Works</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="h-8 w-8 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          GramGains uses your biological sex, age, height, weight, and lifestyle to determine your Total Daily Energy Expenditure (TDEE).
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          We then formulate a high-protein macronutrient plan designed to preserve lean muscle while adjusting for fat loss or caloric surplus.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-full bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default OnboardingHelpModal;
