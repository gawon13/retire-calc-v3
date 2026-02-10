import { NextResponse } from 'next/server';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'raw' | 'published' | null (all)

    const contentDir = join(process.cwd(), 'content', 'insights');

    try {
        const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'));

        const articles = files
            .map((file) => {
                try {
                    return JSON.parse(readFileSync(join(contentDir, file), 'utf-8'));
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
            .filter((a) => !status || a.status === status)
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        return NextResponse.json({ articles, total: articles.length });
    } catch {
        return NextResponse.json({ articles: [], total: 0 });
    }
}
