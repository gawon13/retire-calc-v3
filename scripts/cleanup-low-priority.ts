/**
 * P2/P3 기사를 Blob과 로컬에서 삭제
 * 사용: BLOB_READ_WRITE_TOKEN=xxx npx tsx scripts/cleanup-low-priority.ts
 */

import { list, del } from '@vercel/blob';
import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { classify } from './lib/classifier';

async function main() {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        console.error('BLOB_READ_WRITE_TOKEN is required');
        process.exit(1);
    }

    // 1. Blob에서 P2/P3 삭제
    console.log('=== Blob cleanup ===');
    const { blobs } = await list({ prefix: 'insights/' });
    let blobDeleted = 0;

    for (const blob of blobs) {
        try {
            const res = await fetch(blob.url, { cache: 'no-store' });
            const article = await res.json();
            const { priority } = classify(article.title, article.rawSummary || '');

            if (priority !== 1) {
                await del(blob.url);
                blobDeleted++;
                console.log(`  - [P${priority}] ${article.title}`);
            }
        } catch (err) {
            console.error(`  ! Error: ${blob.pathname}:`, (err as Error).message);
        }
    }
    console.log(`Blob: deleted ${blobDeleted} / ${blobs.length} total\n`);

    // 2. 로컬에서 P2/P3 삭제
    console.log('=== Local cleanup ===');
    const contentDir = join(process.cwd(), 'content', 'insights');
    const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'));
    let localDeleted = 0;

    for (const file of files) {
        try {
            const filePath = join(contentDir, file);
            const article = JSON.parse(readFileSync(filePath, 'utf-8'));
            const { priority } = classify(article.title, article.rawSummary || '');

            if (priority !== 1) {
                unlinkSync(filePath);
                localDeleted++;
                console.log(`  - [P${priority}] ${file}`);
            }
        } catch (err) {
            console.error(`  ! Error: ${file}:`, (err as Error).message);
        }
    }
    console.log(`Local: deleted ${localDeleted} / ${files.length} total`);
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
