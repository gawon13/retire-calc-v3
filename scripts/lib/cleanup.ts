import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const MAX_AGE_DAYS = 10;

export function cleanupOldArticles(contentDir: string): number {
    const now = Date.now();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    try {
        const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'));

        for (const file of files) {
            try {
                const filePath = join(contentDir, file);
                const data = JSON.parse(readFileSync(filePath, 'utf-8'));

                // 게시된 기사는 삭제하지 않음
                if (data.status === 'published') continue;

                const collectedAt = new Date(data.collectedAt || data.publishedAt).getTime();
                const age = now - collectedAt;

                if (age > maxAge) {
                    unlinkSync(filePath);
                    deletedCount++;
                    console.log(`  - Deleted (${Math.floor(age / 86400000)}d old): ${data.title}`);
                }
            } catch {
                // 파손된 파일 무시
            }
        }
    } catch {
        // 디렉토리 없으면 무시
    }

    return deletedCount;
}
