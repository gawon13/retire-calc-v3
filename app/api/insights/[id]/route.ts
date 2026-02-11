import { NextResponse } from 'next/server';
import { getArticle, updateArticle } from '@/lib/insights-store';

export const dynamic = 'force-dynamic';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const article = await getArticle(params.id);

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json(article);
    } catch (err: any) {
        console.error('[GET /api/insights/[id]]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { adminSummary, adminKeyPoints, status } = body;

        const updated = await updateArticle(params.id, {
            adminSummary,
            adminKeyPoints,
            status,
        });

        if (!updated) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (err: any) {
        console.error('[PATCH /api/insights/[id]]', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
