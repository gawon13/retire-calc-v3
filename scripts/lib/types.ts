export type Source = 'moef' | 'fsc' | 'krx' | 'naver';

export type Category =
    | 'tax-reform'
    | 'pension-regulation'
    | 'interest-rate'
    | 'etf-listing'
    | 'market-volatility'
    | 'economic-indicator'
    | 'crypto'
    | 'us-market'
    | 'asset-management'
    | 'general';

export type Priority = 1 | 2 | 3;

export type Status = 'raw' | 'published';

export interface CollectedArticle {
    id: string;
    title: string;
    slug: string;
    source: Source;
    sourceUrl: string;
    category: Category;
    priority: Priority;
    rawSummary: string;
    publishedAt: string;
    collectedAt: string;
    status: Status;
    adminSummary: string | null;
    adminKeyPoints: string[] | null;
    adminPublishedAt: string | null;
}

export interface RawArticle {
    title: string;
    sourceUrl: string;
    rawSummary: string;
    publishedAt: string;
    source: Source;
}
