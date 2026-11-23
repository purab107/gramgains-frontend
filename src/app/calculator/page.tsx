'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CalculatorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile?tab=calculator');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-xs text-muted-foreground font-medium">
        Redirecting to Profile &amp; Macro Calculator Hub...
      </p>
    </div>
  );
}
