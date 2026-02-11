import { fetchMoef } from './lib/sources/moef';
import { fetchFsc } from './lib/sources/fsc';
import { fetchKrx } from './lib/sources/krx';
import { fetchNaver } from './lib/sources/naver';
import { classify } from './lib/classifier';
import { loadExistingIds, isDuplicate } from './lib/dedup';
import { generateSlug, generateId } from './lib/slug';
import { cleanupOldArticles } from './lib/cleanup';
import { CollectedArticle } from './lib/types';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { put } from '@vercel/blob';

async function main() {
    const contentDir = join(process.cwd(), 'content', 'insights');
    mkdirSync(contentDir, { recursive: true });

    // 1. 10일 초과 미게시 기사 삭제
    console.log('=== Cleanup ===');
    const deletedCount = cleanupOldArticles(contentDir);
    console.log(`Deleted ${deletedCount} old articles\n`);

    // 2. 기존 기사 ID 로드
    const existingIds = loadExistingIds(contentDir);
    console.log(`Found ${existingIds.size} existing articles`);

    // 3. 모든 소스에서 병렬 수집
    console.log('\n=== Collecting ===');
    const [moefResult, fscResult, krxResult, naverResult] = await Promise.allSettled([
        fetchMoef(),
        fetchFsc(),
        fetchKrx(),
        fetchNaver(),
    ]);

    const allArticles = [
        ...(moefResult.status === 'fulfilled' ? moefResult.value : []),
        ...(fscResult.status === 'fulfilled' ? fscResult.value : []),
        ...(krxResult.status === 'fulfilled' ? krxResult.value : []),
        ...(naverResult.status === 'fulfilled' ? naverResult.value : []),
    ];

    // 실패한 소스 로그
    if (moefResult.status === 'rejected') console.error('[MOEF] Failed:', moefResult.reason);
    if (fscResult.status === 'rejected') console.error('[FSC] Failed:', fscResult.reason);
    if (krxResult.status === 'rejected') console.error('[KRX] Failed:', krxResult.reason);
    if (naverResult.status === 'rejected') console.error('[NAVER] Failed:', naverResult.reason);

    console.log(`Total fetched: ${allArticles.length} articles\n`);

    // 4. 저장
    let newCount = 0;
    for (const raw of allArticles) {
        const id = generateId(raw.sourceUrl);

        if (isDuplicate(id, existingIds)) continue;

        const { category, priority } = classify(raw.title, raw.rawSummary);
        const slug = generateSlug(raw.title, raw.source);
        const date = raw.publishedAt.slice(0, 10);
        const filename = `${date}-${slug}.json`;

        const article: CollectedArticle = {
            id,
            title: raw.title,
            slug,
            source: raw.source,
            sourceUrl: raw.sourceUrl,
            category,
            priority,
            rawSummary: raw.rawSummary,
            publishedAt: raw.publishedAt,
            collectedAt: new Date().toISOString(),
            status: 'raw',
            adminSummary: null,
            adminKeyPoints: null,
            adminPublishedAt: null,
        };

        // 로컬 파일 저장
        writeFileSync(join(contentDir, filename), JSON.stringify(article, null, 2), 'utf-8');

        // Blob 업로드 (BLOB_READ_WRITE_TOKEN이 있을 때)
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                await put(`insights/${id}.json`, JSON.stringify(article, null, 2), {
                    access: 'public',
                    contentType: 'application/json',
                    addRandomSuffix: false,
                    allowOverwrite: true,
                });
            } catch (blobErr) {
                console.error(`  [Blob upload failed] ${id}:`, blobErr);
            }
        }

        existingIds.add(id);
        newCount++;
        console.log(`  + [P${priority}] ${raw.source.toUpperCase()}: ${raw.title}`);
    }

    console.log(`\nDone: ${newCount} new articles collected`);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
