'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Article {
    id: string;
    title: string;
    source: string;
    sourceUrl: string;
    category: string;
    priority: number;
    rawSummary: string;
    publishedAt: string;
    adminSummary: string | null;
    adminKeyPoints: string[] | null;
    adminPublishedAt: string | null;
    status: string;
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

export default function InsightDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchArticle() {
            try {
                const res = await fetch(`/api/insights/${id}`);
                if (!res.ok) {
                    setError(true);
                    return;
                }
                const data = await res.json();
                if (data.status !== 'published') {
                    setError(true);
                    return;
                }
                setArticle(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchArticle();
    }, [id]);

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="text-center py-16 text-slate-400">로딩 중...</div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-md p-8 text-center py-16">
                    <p className="text-xl text-gray-600 mb-4">
                        인사이트를 찾을 수 없습니다
                    </p>
                    <Link
                        href="/insight"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        ← 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            {/* 뒤로가기 */}
            <Link
                href="/insight"
                className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
            >
                ← 인사이트 목록
            </Link>

            <article className="bg-white rounded-lg shadow-md p-8">
                {/* 메타 정보 */}
                <div className="flex items-center gap-2 mb-4">
                    <span
                        className={`px-2.5 py-1 text-xs font-medium rounded ${
                            CATEGORY_COLORS[article.category] ||
                            'bg-slate-100 text-slate-600'
                        }`}
                    >
                        {CATEGORY_LABELS[article.category] || article.category}
                    </span>
                    <span className="text-sm text-slate-400">
                        {SOURCE_LABELS[article.source] || article.source}
                    </span>
                    <span className="text-sm text-slate-400">·</span>
                    <span className="text-sm text-slate-400">
                        {formatDate(article.adminPublishedAt || article.publishedAt)}
                    </span>
                </div>

                {/* 제목 */}
                <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-snug">
                    {article.title}
                </h1>

                {/* 요약 */}
                {article.adminSummary && (
                    <div className="mb-6">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                            <h2 className="text-sm font-bold text-blue-800 mb-2">
                                핵심 요약
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {article.adminSummary}
                            </p>
                        </div>
                    </div>
                )}

                {/* 태그 */}
                {article.adminKeyPoints && article.adminKeyPoints.length > 0 && (
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            {article.adminKeyPoints.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 구분선 */}
                <hr className="my-6 border-slate-200" />

                {/* 원문 링크 */}
                <div className="flex items-center justify-between">
                    <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        원문 보기
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </a>
                </div>
            </article>
        </div>
    );
}
