'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { CALCULATORS } from '../../common/constants/navigation';

/**
 * 서브 네비게이션 컴포넌트
 * 모바일(md 미만): 상단 2단 확장형 메뉴 (텍스트 중심)
 * 데스크탑(md 이상: 상단 가로 탭 바
 */
export default function SubNav() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    // 페이지 이동 시 확장 메뉴 닫기
    useEffect(() => {
        setIsExpanded(false);
    }, [pathname]);

    // 현재 경로 활성화 여부 확인
    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    // 모바일 1행 메뉴 4개
    const mainCalculators = CALCULATORS.slice(0, 4);
    // 모바일 2행 (더보기) 메뉴
    const moreCalculators = CALCULATORS.slice(4);

    // '더보기' 메뉴 중 하나가 현재 활성화된 상태인지 확인
    const isMoreActive = moreCalculators.some(item => isActive(item.href));

    return (
        <div className="w-full bg-white border-b border-gray-200">
            {/* 1. 데스크탑 레이아웃 (md 이상) */}
            <div className="hidden md:block bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <nav className="flex space-x-8 py-3">
                        {CALCULATORS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors border-b-2 ${isActive(item.href)
                                    ? 'text-blue-600 font-bold border-blue-600'
                                    : 'text-gray-700 hover:text-blue-600 border-transparent'
                                    }`}
                            >
                                {item.name}
                                {item.isNew && (
                                    <span className="ml-1 text-[10px] bg-red-500 text-white px-1 py-0.5 rounded-full font-bold">NEW</span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* 2. 모바일 레이아웃 (md 미만: 2단 텍스트 메뉴) */}
            <div className="md:hidden w-full overflow-hidden">
                {/* 1행: 기본 메뉴 4개 + 더보기 버튼 (h-12로 슬림화) */}
                <div className="grid grid-cols-5 items-center h-12 border-b border-gray-100">
                    {mainCalculators.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center h-full transition-colors ${isActive(item.href) ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
                        >
                            <span className="text-[10px] sm:text-xs text-center leading-tight px-0.5">{item.name}</span>
                        </Link>
                    ))}

                    {/* 더보기 토글 버튼 */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`flex items-center justify-center gap-0.5 h-full transition-colors ${isExpanded || isMoreActive ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
                    >
                        <span className="text-xs">더보기</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>

                {/* 2행: 확장 메뉴 (FIRE, 건보료, 순자산 등급) */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="bg-gray-50 overflow-hidden"
                        >
                            <div className="grid grid-cols-3 items-center h-12 border-b border-gray-100">
                                {moreCalculators.map((item) => {
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-center h-full transition-colors ${isActive(item.href) ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
                                        >
                                            <span className="text-[10px] sm:text-xs text-center leading-tight px-1">{item.name}</span>
                                            {item.isNew && (
                                                <span className="ml-1 text-[8px] bg-red-500 text-white px-1 py-0.5 rounded-full font-bold">N</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
