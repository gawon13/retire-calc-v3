import { Category, Priority } from './types';
import { PRIORITY_KEYWORDS, CATEGORY_KEYWORDS } from './config';

export function classify(title: string, rawSummary: string): { category: Category; priority: Priority } {
    const text = `${title} ${rawSummary}`;

    // 우선순위 결정
    let priority: Priority = 3;
    for (const p of [1, 2, 3] as Priority[]) {
        for (const keyword of PRIORITY_KEYWORDS[p]) {
            if (text.includes(keyword)) {
                priority = p;
                break;
            }
        }
        if (priority === p && p < 3) break;
    }

    // 카테고리 결정
    let category: Category = 'general';
    let maxMatches = 0;

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        let matches = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) matches++;
        }
        if (matches > maxMatches) {
            maxMatches = matches;
            category = cat as Category;
        }
    }

    return { category, priority };
}
