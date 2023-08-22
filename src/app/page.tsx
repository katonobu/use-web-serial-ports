'use client';

import * as React from 'react';
import dynamic from 'next/dynamic'
const PortList = dynamic(() => import('./_components/PortList'), {
  ssr: false, // サーバーサイドレンダリングを無効化
});


export default function RootPage() {
  return (
    <PortList></PortList>
  )
}
