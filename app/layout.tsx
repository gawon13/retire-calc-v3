import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/common/Header';
import SubNav from '@/components/common/SubNav';
import Footer from '@/components/common/Footer';
import AdBanner from '@/components/AdBanner';

export const metadata: Metadata = {
    title: '은퇴 & 자산 시뮬레이터',
    description: '더 나은 미래를 설계하는 뼈때리는 금융 도구',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className="flex flex-col min-h-screen bg-slate-50">
                <Header />
                <SubNav />
                <AdBanner />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
