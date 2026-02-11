'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Article {
    id: string;
    title: string;
    slug: string;
    source: string;
    category: string;
    priority: number;
    adminSummary: string | null;
    adminKeyPoints: string[] | null;
    publishedAt: string;
    adminPublishedAt: string | null;
}

const SOURCE_LABELS: Record<string, string> = {
    moef: '기획재정부',
    fsc: '금융위원회',
    krx: '한국거래소',
    naver: '네이버 뉴스',
};

const CATEGORY_LABELS: Record<string, string> = {
    'tax-reform': '세제 개편',
    'pension-regulation': '연금/절세',
    'interest-rate': '금리',
    'etf-listing': 'ETF 상장',
    'market-volatility': '시장 동향',
    'economic-indicator': '경제 지표',
    crypto: '암호화폐',
    'us-market': '미국증시',
    'asset-management': '자산관리',
    general: '일반',
};

const CATEGORY_COLORS: Record<string, string> = {
    'tax-reform': 'bg-purple-100 text-purple-700',
    'pension-regulation': 'bg-green-100 text-green-700',
    'interest-rate': 'bg-orange-100 text-orange-700',
    'etf-listing': 'bg-blue-100 text-blue-700',
    'market-volatility': 'bg-red-100 text-red-700',
    'economic-indicator': 'bg-teal-100 text-teal-700',
    crypto: 'bg-yellow-100 text-yellow-700',
    'us-market': 'bg-indigo-100 text-indigo-700',
    'asset-management': 'bg-emerald-100 text-emerald-700',
    general: 'bg-slate-100 text-slate-600',
};

export default function InsightPageClient() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPublished() {
            try {
                const res = await fetch('/api/insights?status=published');
                const data = await res.json();
                setArticles(data.articles || []);
            } catch {
                setArticles([]);
            } finally {
                setLoading(false);
            }
        }
        fetchPublished();
    }, []);

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center py-16 text-slate-400">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">


            {articles.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center py-16">
                        <div className="mb-6">
                            <svg
                                className="mx-auto h-24 w-24 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                        <p className="text-xl text-gray-600 mb-4">
                            아직 게시된 인사이트가 없습니다
                        </p>
                        <p className="text-sm text-gray-400">
                            곧 유익한 금융 인사이트를 공유할 예정입니다.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/insight/${article.id}`}
                            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all"
                        >
                            {/* 메타 정보 */}
                            <div className="flex items-center gap-2 mb-3">
                                <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded ${CATEGORY_COLORS[article.category] ||
                                        'bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    {CATEGORY_LABELS[article.category] || article.category}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {SOURCE_LABELS[article.source] || article.source}
                                </span>
                                <span className="text-xs text-slate-400">·</span>
                                <span className="text-xs text-slate-400">
                                    {formatDate(article.adminPublishedAt || article.publishedAt)}
                                </span>
                            </div>

                            {/* 제목 */}
                            <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                                {article.title}
                            </h2>

                            {/* 요약 미리보기 */}
                            {article.adminSummary && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                    {article.adminSummary}
                                </p>
                            )}

                            {/* 태그 */}
                            {article.adminKeyPoints && article.adminKeyPoints.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {article.adminKeyPoints.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
