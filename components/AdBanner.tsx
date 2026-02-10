'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';

declare global {
    interface Window {
        adfit: any;
    }
}

export default function AdBanner() {
    const containerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const adUnitId = isDesktop ? 'DAN-t9lGCcxpTMougVhj' : 'DAN-K1FLGTL052YLYvpM';
    const adWidth = isDesktop ? '728' : '300';
    const adHeight = isDesktop ? '90' : '250';

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        const container = containerRef.current;
        if (!container) return;

        // 기존 내용 제거
        container.innerHTML = '';

        // ins 태그 생성
        const ins = document.createElement('ins');
        ins.className = 'kakao_ad_area';
        ins.style.display = 'none';
        ins.setAttribute('data-ad-unit', adUnitId);
        ins.setAttribute('data-ad-width', adWidth);
        ins.setAttribute('data-ad-height', adHeight);
        container.appendChild(ins);

        // ba.min.js 스크립트를 매번 동적으로 추가 (adfit이 새 ins를 인식하도록)
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
        script.async = true;
        container.appendChild(script);

        return () => {
            // 언마운트 또는 의존성 변경 시 기존 광고 단위 정리
            if (window.adfit) {
                try {
                    window.adfit.destroy(adUnitId);
                } catch (e) {
                    // ignore
                }
            }
            container.innerHTML = '';
        };
    }, [pathname, isDesktop, adUnitId, adWidth, adHeight, isMounted]);

    if (!isMounted) return null;

    return (
        <div className="flex justify-center items-center mt-6 mb-3 overflow-hidden">
            <div
                style={{
                    width: isDesktop ? '728px' : '300px',
                    height: isDesktop ? '90px' : '250px'
                }}
                className="bg-slate-50 rounded-2xl flex justify-center items-center overflow-hidden shadow-sm border border-slate-100 relative"
            >
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs font-bold pointer-events-none">
                    ADVERTISEMENT
                </div>
                <div ref={containerRef} />
            </div>
        </div>
    );
}
