/**
 * 로컬 content/insights/*.json 파일들을 Vercel Blob에 일괄 업로드
 * 사용: BLOB_READ_WRITE_TOKEN=xxx npx tsx scripts/sync-to-blob.ts
 */

import { put, list } from '@vercel/blob';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

async function main() {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        console.error('BLOB_READ_WRITE_TOKEN is required');
        process.exit(1);
    }

    const contentDir = join(process.cwd(), 'content', 'insights');
    const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'));

    // 이미 Blob에 있는 파일 확인
    const { blobs } = await list({ prefix: 'insights/' });
    const existingIds = new Set(blobs.map((b) => b.pathname.replace('insights/', '').replace('.json', '')));

    console.log(`Local files: ${files.length}`);
    console.log(`Already in Blob: ${existingIds.size}`);

    let uploaded = 0;
    let skipped = 0;

    for (const file of files) {
        try {
            const content = readFileSync(join(contentDir, file), 'utf-8');
            const article = JSON.parse(content);

            if (existingIds.has(article.id)) {
                skipped++;
                continue;
            }

            await put(`insights/${article.id}.json`, content, {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false,
                allowOverwrite: true,
            });

            uploaded++;
            console.log(`  + ${article.id}: ${article.title}`);
        } catch (err) {
            console.error(`  ! Error: ${file}:`, (err as Error).message);
        }
    }

    console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped (already exists)`);
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
