import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/common/Header';
import SubNav from '@/components/common/SubNav';
import Footer from '@/components/common/Footer';
import AdBanner from '@/components/AdBanner';

export const metadata: Metadata = {
    title: '은퇴 계산기 | 복리, 절세, 자녀투자 수익 시뮬레이션',
    description: '은퇴 후 삶을 위한 복리 계산, 절세 전략, 자녀 투자 시뮬레이션을 한곳에서 확인하세요. 나스미디어 nap ssp 기반의 신뢰할 수 있는 데이터를 제공합니다.',
    // other: {
    //     'google-adsense-account': 'ca-pub-6000593057898615',
    // },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className="flex flex-col min-h-screen bg-slate-50">
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-8FR7KVBVFM"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-8FR7KVBVFM');
                    `}
                </Script>
                {/* 
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6000593057898615"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                /> 
                */}
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
