import './globals.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { DevSkipProvider, DevSkipButton, DevSkipPanel } from '@/components/dev-skip';

const inter = Inter({subsets:['latin'],variable:'--font-sans',display:'swap'});

export const metadata: Metadata = {
  title: 'GramGains - Modular Calorie & Macro Tracker',
  description: 'Track daily nutrition with IFCT 2017 & INDB datasets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body className="loading">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DevSkipProvider>
            {children}
            <DevSkipButton />
            <DevSkipPanel />
          </DevSkipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
