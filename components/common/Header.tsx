'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    const mainMenuItems = [
        { label: '계산기', path: '/' },
        { label: '인사이트', path: '/insight' },
        { label: '소개', path: '/about' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            {/* 1단 네비게이션 */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    {/* 로고 */}
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
                                <circle cx="16" cy="13" r=".5" />
                                <circle cx="18" cy="3" r=".5" />
                                <circle cx="20" cy="21" r=".5" />
                                <circle cx="20" cy="8" r=".5" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            은퇴 자산 계산기
                        </span>
                    </Link>

                    {/* 데스크탑 메뉴 */}
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

                    {/* 모바일 햄버거 메뉴 */}
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

            {/* 모바일 메뉴 드롭다운 */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {mainMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.path)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
