/**
 * 숫자를 한국 통화 형식으로 변환
 * 1억 원 이상: "X.X억원"
 * 1만 원 이상: "X,XXX만원"
 * 1만 원 미만: "X,XXX원"
 */
export function formatCurrency(amount: number): string {
    if (amount >= 100000000) {
        // 1억 이상
        const eok = amount / 100000000;
        return `${eok.toFixed(2)}억원`;
    } else if (amount >= 10000) {
        // 1만 이상
        const man = Math.floor(amount / 10000);
        return `${man.toLocaleString('ko-KR')}만원`;
    } else {
        // 1만 미만
        return `${amount.toLocaleString('ko-KR')}원`;
    }
}

/**
 * 숫자를 천 단위로 콤마 구분
 */
export function formatNumber(num: number): string {
    return num.toLocaleString('ko-KR');
}
