import * as React from 'react';
import ThemeRegistry from '@/components/Theme/ThemeRegistry/ThemeRegistry';
import Dashboard from './_components/Dashboard'

export const metadata = {
  title: 'Web-Serial GUI',
  description: 'Web Serial port terminal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Dashboard>
            {children}
          </Dashboard>
        </ThemeRegistry>
      </body>
    </html>
  );
}
