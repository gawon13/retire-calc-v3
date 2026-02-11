/**
 * 기존 content/insights/*.json 파일들을 Vercel Blob에 업로드하는 마이그레이션 스크립트
 *
 * 사용법:
 *   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx npx tsx scripts/migrate-to-blob.ts
 */

import { put } from '@vercel/blob';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

async function main() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('❌ BLOB_READ_WRITE_TOKEN 환경변수가 필요합니다.');
        console.error('   Vercel Dashboard > Storage > Blob > Token에서 발급하세요.');
        process.exit(1);
    }

    const contentDir = join(process.cwd(), 'content', 'insights');
    const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'));

    console.log(`📦 ${files.length}개 파일을 Blob에 업로드합니다...\n`);

    let success = 0;
    let failed = 0;

    for (const file of files) {
        try {
            const data = JSON.parse(readFileSync(join(contentDir, file), 'utf-8'));
            const blobPath = `insights/${data.id}.json`;

            await put(blobPath, JSON.stringify(data, null, 2), {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false,
                allowOverwrite: true,
            });

            success++;
            console.log(`  ✅ ${file} → ${blobPath}`);
        } catch (err) {
            failed++;
            console.error(`  ❌ ${file}:`, err);
        }
    }

    console.log(`\n완료: ${success}개 성공, ${failed}개 실패`);
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
