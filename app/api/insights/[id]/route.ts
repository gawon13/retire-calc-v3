import { NextResponse } from 'next/server';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

function findArticleFile(contentDir: string, id: string): { path: string; data: any } | null {
    const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
        try {
            const filePath = join(contentDir, file);
            const data = JSON.parse(readFileSync(filePath, 'utf-8'));
            if (data.id === id) {
                return { path: filePath, data };
            }
        } catch {
            continue;
        }
    }
    return null;
}

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const contentDir = join(process.cwd(), 'content', 'insights');
    const result = findArticleFile(contentDir, params.id);

    if (!result) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(result.data);
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const contentDir = join(process.cwd(), 'content', 'insights');
    const result = findArticleFile(contentDir, params.id);

    if (!result) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const body = await request.json();
    const { adminSummary, adminKeyPoints, status } = body;

    const updated = {
        ...result.data,
        ...(adminSummary !== undefined && { adminSummary }),
        ...(adminKeyPoints !== undefined && { adminKeyPoints }),
        ...(status !== undefined && { status }),
        ...(status === 'published' && { adminPublishedAt: new Date().toISOString() }),
    };

    writeFileSync(result.path, JSON.stringify(updated, null, 2), 'utf-8');

    return NextResponse.json(updated);
}
