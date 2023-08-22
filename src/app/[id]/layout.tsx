'use client';
export const dynamicParams = false
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <p>src/app/[id]/layout.tsx</p>
            <hr></hr>
            {children}
        </>
    )
}