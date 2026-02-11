import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/insights-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
        const articles = await getAllArticles(status);
        return NextResponse.json({ articles, total: articles.length });
    } catch (err: any) {
        console.error('[GET /api/insights]', err);
        return NextResponse.json({ articles: [], total: 0 });
    }
}
