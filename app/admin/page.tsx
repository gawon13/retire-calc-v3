'use client';

import { useState, useEffect, useCallback } from 'react';

interface Article {
    id: string;
    title: string;
    slug: string;
    source: string;
    sourceUrl: string;
    category: string;
    priority: number;
    rawSummary: string;
    publishedAt: string;
    collectedAt: string;
    status: 'raw' | 'published';
    adminSummary: string | null;
    adminKeyPoints: string[] | null;
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

const PRIORITY_COLORS: Record<number, string> = {
    1: 'bg-red-100 text-red-700',
    2: 'bg-yellow-100 text-yellow-700',
    3: 'bg-slate-100 text-slate-600',
};

export default function AdminPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [filter, setFilter] = useState<'all' | 'raw' | 'published'>('all');
    const [selected, setSelected] = useState<Article | null>(null);
    const [summary, setSummary] = useState('');
    const [keyPointsText, setKeyPointsText] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        const params = filter === 'all' ? '' : `?status=${filter}`;
        const res = await fetch(`/api/insights${params}`);
        const data = await res.json();
        setArticles(data.articles || []);
        setLoading(false);
    }, [filter]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const selectArticle = (article: Article) => {
        setSelected(article);
        // 기존 요약이 있으면 그대로 사용, 없으면 원문 링크를 포함한 초기값
        if (article.adminSummary) {
            setSummary(article.adminSummary);
        } else {
            setSummary(`\n\n원문: ${article.sourceUrl}`);
        }
        setKeyPointsText(
            (article.adminKeyPoints || []).map((p) => `#${p}`).join(' ')
        );
    };

    const handleSave = async (action: 'draft' | 'publish' | 'unpublish') => {
        if (!selected) return;
        setSaving(true);

        // "#태그1 #태그2 #태그3" 또는 "#태그1, #태그2, #태그3" → ["태그1", "태그2", "태그3"]
        const parsedKeyPoints = keyPointsText
            .split(/[\s,]+/)
            .map((t) => t.replace(/^#/, '').trim())
            .filter(Boolean);

        const body: any = {
            adminSummary: summary,
            adminKeyPoints: parsedKeyPoints,
        };

        if (action === 'publish') {
            body.status = 'published';
        } else if (action === 'unpublish') {
            body.status = 'raw';
        }

        try {
            const res = await fetch(`/api/insights/${selected.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `HTTP ${res.status}`);
            }

            const messages = {
                draft: '임시 저장 완료!',
                publish: '게시 완료!',
                unpublish: '게시 취소됨',
            };
            setToast({ message: messages[action], type: 'success' });
            setSelected(null);
            fetchArticles();
        } catch (err: any) {
            setToast({
                message: `저장 실패: ${err.message || '알 수 없는 오류'}`,
                type: 'error',
            });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* 토스트 알림 */}
            {toast && (
                <div
                    className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
                        toast.type === 'success'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                    }`}
                >
                    {toast.message}
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">📰 인사이트 관리</h1>
                <p className="text-sm text-slate-500 mt-1">수집된 기사를 검토하고 요약을 작성하세요</p>
            </div>

            {/* 필터 */}
            <div className="flex gap-2 mb-6">
                {(['all', 'raw', 'published'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === f
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {f === 'all' ? '전체' : f === 'raw' ? '미게시' : '게시됨'}
                        {f !== 'all' && (
                            <span className="ml-1 opacity-70">
                                ({articles.filter((a) => (f as string) === 'all' || a.status === f).length})
                            </span>
                        )}
                    </button>
                ))}
                <span className="ml-auto text-sm text-slate-400 self-center">
                    총 {articles.length}건
                </span>
            </div>

            <div className="flex gap-6">
                {/* 기사 목록 */}
                <div className="flex-1 space-y-2">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">로딩 중...</div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">수집된 기사가 없습니다</div>
                    ) : (
                        articles.map((article) => (
                            <div
                                key={article.id}
                                onClick={() => selectArticle(article)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selected?.id === article.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${PRIORITY_COLORS[article.priority]}`}>
                                        P{article.priority}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {SOURCE_LABELS[article.source] || article.source}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                        {CATEGORY_LABELS[article.category] || article.category}
                                    </span>
                                    {article.status === 'published' && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold">
                                            게시됨
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 leading-snug">
                                    {article.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {formatDate(article.publishedAt)}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* 편집 패널 */}
                {selected && (
                    <div className="w-[420px] flex-none">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-800">
                                    {selected.status === 'published' ? '게시글 수정' : '요약 작성'}
                                </h2>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* 원문 정보 */}
                            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                <h3 className="text-sm font-bold text-slate-700 mb-1">{selected.title}</h3>
                                <p className="text-xs text-slate-500 mb-2 line-clamp-3">{selected.rawSummary}</p>
                                <a
                                    href={selected.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    원문 보기 →
                                </a>
                            </div>

                            {/* 요약 입력 */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    요약 (300~500자)
                                </label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={6}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="이 기사의 핵심 내용을 요약해주세요..."
                                />
                                <div className="text-right text-xs text-slate-400 mt-1">
                                    {summary.length}자
                                </div>
                            </div>

                            {/* 핵심 태그 */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    핵심 태그
                                </label>
                                <input
                                    value={keyPointsText}
                                    onChange={(e) => setKeyPointsText(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="#세제개편 #연금저축 #ISA"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    #태그 형식, 공백 또는 콤마로 구분 (복사/붙여넣기 가능)
                                </p>
                            </div>

                            {/* 버튼 */}
                            {selected.status === 'published' ? (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleSave('publish')}
                                        disabled={saving || !summary.trim()}
                                        className="w-full px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        수정 반영
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('게시를 취소하시겠습니까?\n인사이트 페이지에서 더 이상 보이지 않습니다.')) {
                                                handleSave('unpublish');
                                            }
                                        }}
                                        disabled={saving}
                                        className="w-full px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                                    >
                                        게시 취소
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSave('draft')}
                                        disabled={saving}
                                        className="flex-1 px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                                    >
                                        임시 저장
                                    </button>
                                    <button
                                        onClick={() => handleSave('publish')}
                                        disabled={saving || !summary.trim()}
                                        className="flex-1 px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        게시하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
