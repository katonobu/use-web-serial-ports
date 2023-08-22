'use client';

import * as React from 'react';
import ThemeRegistry from '@/components/Theme/ThemeRegistry/ThemeRegistry';
import { useSerialPorts } from '@/features/web-serial/webSerialDataProvider';

export const metadata = {
  title: 'Web-Serial GUI',
  description: 'Web Serial port terminal',
};

export const dynamic = 'force-static'
export const dynamicParams = false

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const serialPorts = useSerialPorts()
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <p>src/app/layout.tsx</p>
          <p>{serialPorts.length}</p>
          <hr></hr>
            {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
