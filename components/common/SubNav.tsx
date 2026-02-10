'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SubNav() {
    const pathname = usePathname();

    const simulatorMenuItems = [
        { label: '은퇴 시뮬레이터', mobileLabel: '은퇴', path: '/' },
        { label: '복리 시뮬레이터', mobileLabel: '복리', path: '/compound' },
        { label: '절세 시뮬레이터', mobileLabel: '절세', path: '/tax-save' },
        { label: '자녀투자 시뮬레이터', mobileLabel: '자녀', path: '/kids-invest' },
    ];

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    return (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-6">
                <nav className="flex space-x-1 md:space-x-8 overflow-x-auto py-3 justify-between md:justify-start">
                    {simulatorMenuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${isActive(item.path)
                                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                                : 'text-gray-700 hover:text-blue-600'
                                }`}
                        >
                            <span className="hidden md:inline">{item.label}</span>
                            <span className="md:hidden">{item.mobileLabel}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
