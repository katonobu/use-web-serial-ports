'use client';
'use client';

import { useRxBufferLen } from '@/features/web-serial/webSerialDataProvider'
export const dynamicParams = false

export function generateStaticParams() {
    return Array.from({ length: 2 }, (_, index) => ({id:index}))
}

export default function Page({ params }: { params: { id: string } }) {
    const idStr = params.id
    const id = parseInt(idStr, 10)
    const {totalLines, updatedLines} = useRxBufferLen(idStr)
    return (
        <div>
            <p>{idStr}</p>
            <p>totalLines:{totalLines.toString(10)}</p>
            <p>updateLines:{updatedLines.toString(10)}</p>
        </div>
    )
}