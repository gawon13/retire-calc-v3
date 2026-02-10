import { SOURCES, NAVER_SEARCH_QUERIES } from '../config';
import { RawArticle } from '../types';

interface NaverNewsItem {
    title: string;
    originallink: string;
    link: string;
    description: string;
    pubDate: string;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'");
}

export async function fetchNaver(): Promise<RawArticle[]> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn('[NAVER] NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not set, skipping');
        return [];
    }

    const allArticles: RawArticle[] = [];
    const seenUrls = new Set<string>();

    for (const query of NAVER_SEARCH_QUERIES) {
        try {
            const params = new URLSearchParams({
                query,
                display: '5',
                start: '1',
                sort: 'date',
            });

            const res = await fetch(`${SOURCES.naver.apiUrl}?${params.toString()}`, {
                headers: {
                    'X-Naver-Client-Id': clientId,
                    'X-Naver-Client-Secret': clientSecret,
                },
                signal: AbortSignal.timeout(10000),
            });

            if (!res.ok) {
                console.warn(`[NAVER] Query "${query}" failed: ${res.status}`);
                continue;
            }

            const data = await res.json();
            const items: NaverNewsItem[] = data.items || [];

            for (const item of items) {
                const url = item.originallink || item.link;
                if (seenUrls.has(url)) continue;
                seenUrls.add(url);

                allArticles.push({
                    title: stripHtml(item.title),
                    sourceUrl: url,
                    rawSummary: stripHtml(item.description).slice(0, 500),
                    publishedAt: new Date(item.pubDate).toISOString(),
                    source: 'naver',
                });
            }

            // API 속도 제한 방지 (100ms 대기)
            await new Promise((r) => setTimeout(r, 100));
        } catch (err) {
            console.warn(`[NAVER] Query "${query}" error: ${(err as Error).message}`);
        }
    }

    console.log(`[NAVER] Fetched ${allArticles.length} articles from ${NAVER_SEARCH_QUERIES.length} queries`);
    return allArticles;
}
