import { useMemo } from 'react';

interface LuckyCalcProps {
    weeklyGames: number; // 주당 구매 게임 수
    prizeAmount: number; // 1등 당첨 금액 (단위: 억원)
}

export const useLuckyCalc = ({ weeklyGames, prizeAmount }: LuckyCalcProps) => {
    return useMemo(() => {
        // 1. 기본 확률 상수 (로또 6/45 기준)
        const TOTAL_COMBINATIONS = 8145060;

        // 2. 주당 당첨 확률 (%)
        // 내가 구매한 게임 수 / 전체 조합 수 * 100
        const weeklyProbability = (weeklyGames / TOTAL_COMBINATIONS) * 100;

        // 3. 1등 당첨까지 걸리는 예상 기간 (년)
        // (전체 조합 수 / 주당 구매 게임 수) / 52주
        // 예: 1게임 구매 시 -> 8,145,060주 소요 -> 약 156,635년
        const yearsToWin = (TOTAL_COMBINATIONS / Math.max(1, weeklyGames)) / 52;

        // 4. 세금 및 실수령액 계산 (단위: 원)
        // 당첨금: 억원 단위 입력 -> 원 단위 변환
        const prizeAmountRaw = prizeAmount * 100_000_000;

        let tax = 0;

        // 3억원까지 22%
        if (prizeAmountRaw > 0) {
            const taxBase1 = Math.min(prizeAmountRaw, 300_000_000);
            tax += taxBase1 * 0.22;
        }

        // 3억원 초과분 33%
        if (prizeAmountRaw > 300_000_000) {
            const taxBase2 = prizeAmountRaw - 300_000_000;
            tax += taxBase2 * 0.33;
        }

        const afterTaxAmount = prizeAmountRaw - tax;

        // 추가 통계: 벼락 맞을 확률 비교 (약 1/6,000,000 ~ 1/15,000,000 등 다양하지만 대략 1/600만 가정)
        // 로또 1장(1/8,145,060) vs 벼락
        const lightningOdds = 6000000;
        const lottoOdds = TOTAL_COMBINATIONS / Math.max(1, weeklyGames);
        const relativeToLightning = lottoOdds / lightningOdds; // 예: 1.35배 더 어려움

        return {
            probability: weeklyProbability,
            yearsToWin,
            prizeAmountRaw,
            totalTax: tax,
            afterTaxAmount,
            stats: {
                lottoOdds,
                relativeToLightning
            }
        };
    }, [weeklyGames, prizeAmount]);
};
