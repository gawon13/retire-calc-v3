'use client';

import { useMemo } from 'react';

/**
 * 은퇴 계산기 입력 데이터 인터페이스
 */
export interface RetirementInputs {
    ageNow: number;           // 현재 나이
    ageRetire: number;        // 은퇴 목표 나이
    targetMonthly: number;    // 은퇴 후 목표 월 생활비 (만원)
    assetSafe: number;        // 안전 자산 (만원)
    assetInvest: number;      // 투자 자산 (만원)
    rateSafe: number;         // 안전 자산 수익률 (%)
    rateInvest: number;       // 투자 자산 수익률 (%)
    monthlyInvest: number;    // 매월 추가 투자 금액 (만원)
    withdrawalStrategy: 'uniform' | 'target'; // 인출 전략: 균등 분할 vs 목표 생활비
}

/**
 * 연도별 시뮬레이션 데이터 구조
 */
export interface YearData {
    age: number;        // 나이
    balance: number;    // 총 자산 잔액
    safe: number;       // 안전 자산 잔액
    invest: number;     // 투자 자산 잔액
    expense: number;    // 예상 월 생활비 (물가상승 반영)
    withdrawal: number; // 실제 월 인출 금액
    shortfall: number;  // 월 부족 금액
    isRetired: boolean; // 은퇴 여부
}

/**
 * 은퇴 시뮬레이션 결과 구조
 */
export interface RetirementResult {
    data: YearData[];               // 연도별 시뮬레이션 상세 데이터
    totalAssetsAtRetire: number;    // 은퇴 시점 총 자산
    avgMonthlyShortfall: number;    // 은퇴 기간 평균 월 부족 금액
    depletionAge: number | null;    // 자산 고갈 예상 나이
    score: number;                  // 은퇴 준비 점수 (0-150)
    error: boolean;                 // 에러 여부
    msg?: string;                   // 에러 메시지
}

const CONST_LIFE_EXPECTANCY = 85; // 예상 수명 (시뮬레이션 종료 지점)
const INFLATION_RATE = 2.5;       // 예상 연간 물가상승률 (%)

/**
 * 유효한 숫자인지 확인하고 최소 0을 반환하는 헬퍼 함수
 */
function safeNumber(val: number): number {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return 0;
    return Math.max(0, val);
}

/**
 * 은퇴 자산 시뮬레이션 커스텀 훅
 */
export function useRetirement(inputs: RetirementInputs): RetirementResult {
    return useMemo(() => {
        const {
            ageNow,
            ageRetire,
            targetMonthly,
            assetSafe,
            assetInvest,
            rateSafe,
            rateInvest,
            monthlyInvest,
            withdrawalStrategy,
        } = inputs;

        // 1. 유효성 검사: 현재 나이가 은퇴 나이보다 많으면 에러 처리
        if (ageNow >= ageRetire) {
            return {
                error: true,
                msg: '현재 나이가 은퇴 목표 나이보다 많거나 같습니다.',
                data: [],
                totalAssetsAtRetire: 0,
                avgMonthlyShortfall: 0,
                depletionAge: null,
                score: 0,
            };
        }

        // 만원 단위를 원 단위로 변환해 계산 정확도 향상
        const effMonthlyInvest = monthlyInvest * 10000;
        const effTargetMonthly = targetMonthly * 10000;

        // 초기 자산 배분 비율 설정 (추후 인출 시 동일 비율로 사용)
        let totalInitial = assetSafe * 10000 + assetInvest * 10000;
        let ratioInvest = totalInitial > 0 ? (assetInvest * 10000) / totalInitial : 0.5;
        let ratioSafe = 1.0 - ratioInvest;

        // 자산 풀 초기화
        let pool_safe = safeNumber(assetSafe * 10000);
        let pool_invest = safeNumber(assetInvest * 10000);

        const data: YearData[] = [];
        let totalShortfall = 0;
        let retiredMonths = 0;
        let depletionAge: number | null = null;
        let totalAssetsAtRetire = 0;

        // 2. 현재 나이부터 85세까지 연도별 시뮬레이션 수행
        for (let age = ageNow; age <= CONST_LIFE_EXPECTANCY; age++) {
            const isRetired = age >= ageRetire;
            const yearIndex = age - ageNow;

            // 물가상승률 반영한 연간 필요 생활비 산출
            const inflationFactor = Math.pow(1 + INFLATION_RATE / 100, yearIndex);
            const annualExpenseNeed = effTargetMonthly * 12 * inflationFactor;

            // 시장 변동성 시뮬레이션 (결정론적 사인파로 시각적 흥미 제공)
            const marketTrend = Math.sin(yearIndex * 0.5);
            const marketNoise = Math.cos(yearIndex * 1.5) * 0.3;
            const marketFactor = (marketTrend + marketNoise) * 0.05;

            const rate_safe_applied = rateSafe;
            const rate_invest_applied = rateInvest + marketFactor * 100;

            const applyGrowth = (pool: number, rate: number) => pool * (1 + rate / 100);

            let withdrawal = 0;
            let yearlyShortfall = 0;

            if (!isRetired) {
                // [자산 축적기]: 매년 저축액 추가 및 운용 수익 반영
                const annualCont = effMonthlyInvest * 12;
                const contSafe = annualCont * ratioSafe;
                const contInvest = annualCont * ratioInvest;

                pool_safe = safeNumber(applyGrowth(pool_safe + contSafe, rate_safe_applied));
                pool_invest = safeNumber(applyGrowth(pool_invest + contInvest, rate_invest_applied));
            } else {
                // [은퇴기]: 생활비 인출 및 잔여 자산 운용 수익 반영
                retiredMonths += 12;

                // 자산 성장 먼저 반영
                pool_safe = safeNumber(applyGrowth(pool_safe, rate_safe_applied));
                pool_invest = safeNumber(applyGrowth(pool_invest, rate_invest_applied));

                let totalLiquid = pool_safe + pool_invest;

                if (totalLiquid > 0) {
                    if (withdrawalStrategy === 'uniform') {
                        // 균등 방식: 남은 기대 수명 동안 자산을 똑같이 나누어 인출
                        const monthsRemaining = Math.max(1, (CONST_LIFE_EXPECTANCY - age + 1) * 12);
                        const monthlyWithdrawal = totalLiquid / monthsRemaining;
                        withdrawal = monthlyWithdrawal * 12;
                    } else {
                        // 목표 방식: 매달 필요한 생활비만큼 인출 시도
                        withdrawal = Math.min(totalLiquid, annualExpenseNeed);
                    }

                    // 안전/투자 자산에서 기존 비율대로 인출
                    const safeShare = totalLiquid > 0 ? pool_safe / totalLiquid : 0.5;
                    pool_safe = safeNumber(pool_safe - withdrawal * safeShare);
                    pool_invest = safeNumber(pool_invest - withdrawal * (1 - safeShare));
                } else {
                    // 자산 고갈 시점 기록
                    if (depletionAge === null) depletionAge = age;
                }

                // 부족 금액 계산
                yearlyShortfall = Math.max(0, annualExpenseNeed - withdrawal);
                totalShortfall += yearlyShortfall / inflationFactor;
            }

            // 은퇴 시점의 총 자산 규모 저장
            if (age === ageRetire) {
                totalAssetsAtRetire = Math.round(pool_safe + pool_invest);
            }

            const totalBal = Math.round(pool_safe + pool_invest);
            data.push({
                age,
                balance: totalBal,
                safe: Math.round(pool_safe),
                invest: Math.round(pool_invest),
                expense: Math.round(annualExpenseNeed / 12), // 월평균 필요액
                withdrawal: Math.round(withdrawal / 12),     // 월평균 인출액
                shortfall: Math.round(yearlyShortfall / 12), // 월평균 부족액
                isRetired,
            });
        }

        // 은퇴 기간 평균 월 부족액 산출
        const avgMonthlyShortfall =
            retiredMonths > 0 ? Math.round(totalShortfall / (retiredMonths / 12) / 12) : 0;

        // 은퇴 준비 점수 계산 (경험적 규칙: 4% 룰 - 연 생활비의 25배 기준)
        const neededLumpSum = effTargetMonthly * 12 * 25;
        const score = totalAssetsAtRetire > 0 ? Math.round((totalAssetsAtRetire / neededLumpSum) * 100) : 0;

        return {
            data,
            totalAssetsAtRetire,
            avgMonthlyShortfall,
            depletionAge,
            score: Math.max(0, Math.min(150, score)),
            error: false,
        };
    }, [inputs]);
}
