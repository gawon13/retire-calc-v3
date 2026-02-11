/**
 * Insights Storage Layer
 *
 * - Vercel 프로덕션: Blob Storage (읽기/쓰기 모두)
 * - 로컬 개발: 파일 시스템 (content/insights/*.json)
 *
 * BLOB_READ_WRITE_TOKEN 환경변수가 있으면 Blob, 없으면 파일시스템 사용
 */

import { list, put } from '@vercel/blob';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BLOB_PREFIX = 'insights/';

function useBlob(): boolean {
    return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// ─── Blob 기반 ──────────────────────────────────

async function getAllArticlesFromBlob(): Promise<any[]> {
    const { blobs } = await list({ prefix: BLOB_PREFIX });

    // 병렬로 모든 blob fetch (CDN 캐시 방지)
    const results = await Promise.allSettled(
        blobs.map(async (blob) => {
            const res = await fetch(blob.url, { cache: 'no-store' });
            return res.json();
        })
    );

    return results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value);
}

async function getArticleFromBlob(id: string): Promise<any | null> {
    // ID로 직접 blob URL 구성해서 접근 (전체 순회 불필요)
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}${id}.json` });

    if (blobs.length === 0) return null;

    try {
        const res = await fetch(blobs[0].url, { cache: 'no-store' });
        return await res.json();
    } catch {
        return null;
    }
}

async function saveArticleToBlob(article: any): Promise<void> {
    const filename = `${BLOB_PREFIX}${article.id}.json`;
    await put(filename, JSON.stringify(article, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
    });
}

// ─── 파일시스템 기반 (로컬 dev) ──────────────────

function getContentDir(): string {
    return join(process.cwd(), 'content', 'insights');
}

function getAllArticlesFromFS(): any[] {
    const contentDir = getContentDir();
    try {
        const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'));
        return files
            .map((file) => {
                try {
                    return JSON.parse(readFileSync(join(contentDir, file), 'utf-8'));
                } catch {
                    return null;
                }
            })
            .filter(Boolean);
    } catch {
        return [];
    }
}

function getArticleFromFS(id: string): { path: string; data: any } | null {
    const contentDir = getContentDir();
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

function saveArticleToFS(article: any, filePath?: string): void {
    const path = filePath || join(getContentDir(), `${article.id}.json`);
    writeFileSync(path, JSON.stringify(article, null, 2), 'utf-8');
}

// ─── Public API ──────────────────────────────────

export async function getAllArticles(statusFilter?: string | null): Promise<any[]> {
    let articles: any[];

    if (useBlob()) {
        articles = await getAllArticlesFromBlob();
    } else {
        articles = getAllArticlesFromFS();
    }

    if (statusFilter) {
        articles = articles.filter((a) => a.status === statusFilter);
    }

    articles.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return articles;
}

export async function getArticle(id: string): Promise<any | null> {
    if (useBlob()) {
        return await getArticleFromBlob(id);
    } else {
        const result = getArticleFromFS(id);
        return result?.data || null;
    }
}

export async function updateArticle(
    id: string,
    updates: { adminSummary?: string; adminKeyPoints?: string[]; status?: string }
): Promise<any | null> {
    if (useBlob()) {
        const data = await getArticleFromBlob(id);
        if (!data) return null;

        const updated = {
            ...data,
            ...(updates.adminSummary !== undefined && { adminSummary: updates.adminSummary }),
            ...(updates.adminKeyPoints !== undefined && { adminKeyPoints: updates.adminKeyPoints }),
            ...(updates.status !== undefined && { status: updates.status }),
            ...(updates.status === 'published' && { adminPublishedAt: new Date().toISOString() }),
        };

        await saveArticleToBlob(updated);
        return updated;
    } else {
        const result = getArticleFromFS(id);
        if (!result) return null;

        const updated = {
            ...result.data,
            ...(updates.adminSummary !== undefined && { adminSummary: updates.adminSummary }),
            ...(updates.adminKeyPoints !== undefined && { adminKeyPoints: updates.adminKeyPoints }),
            ...(updates.status !== undefined && { status: updates.status }),
            ...(updates.status === 'published' && { adminPublishedAt: new Date().toISOString() }),
        };

        saveArticleToFS(updated, result.path);
        return updated;
    }
}
