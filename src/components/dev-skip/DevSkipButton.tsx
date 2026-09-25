'use client';

import { isDevSkip } from '@/lib/dev-skip';
import { useDevSkip } from './DevSkipProvider';
import { Code2 } from 'lucide-react';

export function DevSkipButton() {
  // Self-guard: render nothing if dev skip is not enabled
  if (!isDevSkip()) {
    return null;
  }

  const { openPanel, isSeeded } = useDevSkip();

  return (
    <button
      id="dev-skip-btn"
      onClick={openPanel}
      className="fixed bottom-6 right-6 z-[9999] flex h-12 w-12 items-center 
                 justify-center rounded-full bg-amber-500 shadow-lg 
                 hover:bg-amber-400 transition-all hover:scale-110 active:scale-95"
      title="Dev Skip Panel"
    >
      <Code2 className="h-5 w-5 text-white" />
      <span className={`absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white
                        ${isSeeded ? 'bg-green-500' : 'bg-red-500'}`} />
    </button>
  );
}