import * as React from 'react';
import ThemeRegistry from '@/components/Theme/ThemeRegistry/ThemeRegistry';
import Dashboard from './_components/Dashboard'

export const metadata = {
  title: 'Next App with MUI5',
  description: 'next app with mui5',
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
