import { createHash } from 'crypto';
import { Source } from './types';

const TERM_MAP: Record<string, string> = {
    'ISA': 'isa',
    'IRP': 'irp',
    '연금저축': 'pension-savings',
    '퇴직연금': 'retirement-pension',
    '세법': 'tax-law',
    '세제': 'tax-system',
    '기준금리': 'base-rate',
    'ETF': 'etf',
    '코스피': 'kospi',
    '코스닥': 'kosdaq',
    '환율': 'exchange-rate',
};

export function generateSlug(title: string, source: Source): string {
    let slug = title;

    // 알려진 금융 용어를 영어로 변환
    for (const [korean, english] of Object.entries(TERM_MAP)) {
        slug = slug.replace(new RegExp(korean, 'g'), english);
    }

    // 영문, 숫자, 하이픈만 남기기
    slug = slug
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

    // slug가 너무 짧으면 해시로 보충
    if (slug.length < 5) {
        const hash = createHash('sha256').update(title).digest('hex').slice(0, 8);
        slug = `${source}-${hash}`;
    } else {
        slug = `${source}-${slug}`;
    }

    return slug;
}

export function generateId(sourceUrl: string): string {
    return createHash('sha256').update(sourceUrl).digest('hex').slice(0, 12);
}
