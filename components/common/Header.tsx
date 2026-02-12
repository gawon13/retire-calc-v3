'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CALCULATORS, OTHER_MENU } from '../../common/constants/navigation';

/**
 * 전역 헤더 컴포넌트
 * 로고, 메인 메뉴(데스크탑/모바일), 햄버거 메뉴 포함
 */
export default function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // 모바일 메뉴 개폐 상태

    // 현재 경로가 활성화된 메뉴인지 확인하는 함수
    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    // 상단 GNB 메뉴 항목 정의
    const mainMenuItems = [
        { label: '계산기', path: '/' },
        { label: '인사이트', path: '/insight' },
        { label: '소개', path: '/about' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            {/* 1단 네비게이션 컨테이너 */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    {/* 서비스 로고 영역 */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                                <path d="M9 13a4.5 4.5 0 0 0 3-4" />
                                <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
                                <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
                                <path d="M6 18a4 4 0 0 1-1.967-.516" />
                                <path d="M12 13h4" />
                                <path d="M12 18h6a2 2 0 0 1 2 2v1" />
                                <path d="M12 8h8" />
                                <path d="M16 8V5a2 2 0 0 1 2-2" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            은퇴 자산 계산기
                        </span>
                    </Link>

                    {/* 데스크탑 전용 네비게이션 메뉴 */}
                    <nav className="hidden md:flex space-x-8">
                        {mainMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${isActive(item.path)
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* 모바일 햄버거 메뉴 버튼 */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* 모바일 전용 메뉴 드롭다운 (상태에 따라 노출) */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white shadow-xl max-h-[80vh] overflow-y-auto">
                    {/* 계산기 도구 그룹 */}
                    <div className="text-xs text-gray-400 font-semibold px-3 pt-4 pb-1">
                        [계산기 도구]
                    </div>
                    <div className="px-2 pb-2 space-y-1">
                        {CALCULATORS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center justify-between ${isActive(item.href)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span>{item.name}</span>
                                {item.isNew && (
                                    <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">NEW</span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* 인사이트 그룹 */}
                    <div className="text-xs text-gray-400 font-semibold px-3 pt-4 pb-1">
                        [인사이트]
                    </div>
                    <div className="px-2 pb-2 space-y-1">
                        {OTHER_MENU.filter(item => item.name === '인사이트').map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.href)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* 소개 그룹 */}
                    <div className="text-xs text-gray-400 font-semibold px-3 pt-4 pb-1">
                        [소개]
                    </div>
                    <div className="px-2 pb-2 space-y-1 border-b border-gray-100 mb-2">
                        {OTHER_MENU.filter(item => item.name === '소개').map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.href)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* 이용약관 및 개인정보처리방침 */}
                    <div className="text-xs text-gray-400 font-semibold px-3 pt-4 pb-1">
                        [약관 및 정책]
                    </div>
                    <div className="px-2 pb-6 space-y-1">
                        {OTHER_MENU.filter(item => ['이용약관', '개인정보처리방침'].includes(item.name)).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.href)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
