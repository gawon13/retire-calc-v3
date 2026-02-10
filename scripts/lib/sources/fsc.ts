import Parser from 'rss-parser';
import { SOURCES } from '../config';
import { RawArticle } from '../types';

const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'RetirecalcBot/1.0 (+https://retirecalc.co.kr)',
    },
});

export async function fetchFsc(): Promise<RawArticle[]> {
    const { rssUrl, backupRssUrl } = SOURCES.fsc;

    let feed;
    try {
        feed = await parser.parseURL(rssUrl);
    } catch (err) {
        console.warn(`[FSC] Primary RSS failed, trying backup: ${(err as Error).message}`);
        try {
            feed = await parser.parseURL(backupRssUrl);
        } catch (backupErr) {
            console.error(`[FSC] Backup RSS also failed: ${(backupErr as Error).message}`);
            return [];
        }
    }

    const articles: RawArticle[] = (feed.items || [])
        .filter((item) => item.title && item.link)
        .map((item) => ({
            title: item.title!.trim(),
            sourceUrl: item.link!.trim(),
            rawSummary: (item.contentSnippet || item.content || '').trim().slice(0, 500),
            publishedAt: item.pubDate
                ? new Date(item.pubDate).toISOString()
                : new Date().toISOString(),
            source: 'fsc' as const,
        }));

    console.log(`[FSC] Fetched ${articles.length} articles`);
    return articles;
}
