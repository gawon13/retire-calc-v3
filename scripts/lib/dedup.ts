import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export function loadExistingIds(contentDir: string): Set<string> {
    const ids = new Set<string>();

    try {
        const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'));
        for (const file of files) {
            try {
                const data = JSON.parse(readFileSync(join(contentDir, file), 'utf-8'));
                if (data.id) {
                    ids.add(data.id);
                }
            } catch {
                // 파손된 JSON 파일 무시
            }
        }
    } catch {
        // 디렉토리가 없으면 빈 Set 반환
    }

    return ids;
}

export function isDuplicate(id: string, existingIds: Set<string>): boolean {
    return existingIds.has(id);
}
