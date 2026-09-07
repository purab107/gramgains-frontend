import './globals.css';
import type { Metadata } from 'next';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
