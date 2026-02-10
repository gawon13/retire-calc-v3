import { SOURCES } from '../config';
import { RawArticle } from '../types';

export async function fetchKrx(): Promise<RawArticle[]> {
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    if (!apiKey) {
        console.warn('[KRX] DATA_GO_KR_API_KEY not set, skipping KRX fetch');
        return [];
    }

    // 최근 7일간 신규 상장 ETF 조회
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

    const params = new URLSearchParams({
        serviceKey: apiKey,
        resultType: 'json',
        numOfRows: '50',
        beginBasDt: formatDate(weekAgo),
        endBasDt: formatDate(today),
        mrktCtg: 'ETF',
    });

    const url = `${SOURCES.krx.apiUrl}?${params.toString()}`;

    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'RetirecalcBot/1.0' },
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            console.error(`[KRX] API returned ${res.status}`);
            return [];
        }

        const data = await res.json();
        const items = data?.response?.body?.items?.item || [];

        if (!Array.isArray(items) || items.length === 0) {
            console.log('[KRX] No new ETF listings found');
            return [];
        }

        const articles: RawArticle[] = items.map((item: any) => ({
            title: `신규 ETF 상장: ${item.itmsNm || item.srtnCd}`,
            sourceUrl: `https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101&isuCd=${item.srtnCd || ''}`,
            rawSummary: `${item.itmsNm || ''} (${item.srtnCd || ''})이(가) ${item.basDt || ''} 한국거래소에 신규 상장되었습니다. 종목코드: ${item.srtnCd || ''}, 시장: ETF`,
            publishedAt: item.basDt
                ? new Date(`${item.basDt.slice(0, 4)}-${item.basDt.slice(4, 6)}-${item.basDt.slice(6, 8)}`).toISOString()
                : new Date().toISOString(),
            source: 'krx' as const,
        }));

        console.log(`[KRX] Fetched ${articles.length} ETF listings`);
        return articles;
    } catch (err) {
        console.error(`[KRX] Fetch failed: ${(err as Error).message}`);
        return [];
    }
}
