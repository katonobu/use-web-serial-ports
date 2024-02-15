import * as React from 'react';
import ThemeRegistry from '@/components/Theme/ThemeRegistry/ThemeRegistry';
import Dashboard from './_components/Dashboard'
import {PortInfosProvider} from '@/features/ws-serial/PortInfosProvider';

export const metadata = {
  title: 'Web-Serial GUI',
  description: 'Web Serial port terminal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <PortInfosProvider>
            <Dashboard>
              {children}
            </Dashboard>
          </PortInfosProvider>              
        </ThemeRegistry>
      </body>
    </html>
  );
}
