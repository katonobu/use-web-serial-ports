'use client';

import * as React from 'react';
import { useSerialPorts } from '@/features/web-serial/webSerialDataProvider';
import Link from 'next/link';

export const dynamicParams = false

export default function RootPage() {
  const serialPorts = useSerialPorts()
  return (
    <>
    <p>src/app/page.tsx</p>
    <p>{serialPorts.length}</p>
    {serialPorts.map((port)=>(
        <Link href={`/${port.idStr}`} key={port.idStr}>
          <p>{port.idStr},{port.venderName}</p>
        </Link>
    ))}
    </>
  )
}
