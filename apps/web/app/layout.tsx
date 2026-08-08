import type { ReactNode } from 'react';

export const metadata = {
  title: 'Parakh — Customer risk profiling',
  description: 'Every judgment, explained.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f2efdc', color: '#1a1a1a' }}>{children}</body>
    </html>
  );
}
