import { fetchMoef } from './lib/sources/moef';
import { fetchFsc } from './lib/sources/fsc';
import { fetchKrx } from './lib/sources/krx';
import { classify } from './lib/classifier';
import { loadExistingIds, isDuplicate } from './lib/dedup';
import { generateSlug, generateId } from './lib/slug';
import { CollectedArticle } from './lib/types';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
    const contentDir = join(process.cwd(), 'content', 'insights');
    mkdirSync(contentDir, { recursive: true });

    const existingIds = loadExistingIds(contentDir);
    console.log(`Found ${existingIds.size} existing articles`);

    // 모든 소스에서 병렬 수집
    const [moefResult, fscResult, krxResult] = await Promise.allSettled([
        fetchMoef(),
        fetchFsc(),
        fetchKrx(),
    ]);

    const allArticles = [
        ...(moefResult.status === 'fulfilled' ? moefResult.value : []),
        ...(fscResult.status === 'fulfilled' ? fscResult.value : []),
        ...(krxResult.status === 'fulfilled' ? krxResult.value : []),
    ];

    // 실패한 소스 로그
    if (moefResult.status === 'rejected') console.error('[MOEF] Failed:', moefResult.reason);
    if (fscResult.status === 'rejected') console.error('[FSC] Failed:', fscResult.reason);
    if (krxResult.status === 'rejected') console.error('[KRX] Failed:', krxResult.reason);

    console.log(`Total fetched: ${allArticles.length} articles`);

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

        writeFileSync(join(contentDir, filename), JSON.stringify(article, null, 2), 'utf-8');
        existingIds.add(id); // 같은 실행 내 중복 방지
        newCount++;
        console.log(`  + [P${priority}] ${raw.source.toUpperCase()}: ${raw.title}`);
    }

    console.log(`\nDone: ${newCount} new articles collected`);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
