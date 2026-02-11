import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/common/Header';
import SubNav from '@/components/common/SubNav';
import Footer from '@/components/common/Footer';
import AdBanner from '@/components/AdBanner';

export const metadata: Metadata = {
    title: '은퇴 자산 계산기 | 은퇴·복리·절세·자녀계좌·FIRE 계산기',
    description: '은퇴자금, 복리 수익, 절세 효과, 자녀계좌, FIRE 목표까지 한 번에 계산합니다. 간단 입력으로 은퇴 시점 자산과 월 부족 생활비를 확인할 수 있습니다.',
    openGraph: {
        type: 'website',
        siteName: '은퇴 자산 계산기',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 630,
                type: 'image/png',
            },
        ],
    },
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
