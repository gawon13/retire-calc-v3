import { useMemo } from 'react';

/**
 * 차트 시각화를 위한 데이터 포인트 인터페이스
 */
export interface FireDataPoint {
    monthIndex: number;  // 시뮬레이션 시작 후 경과 개월수
    year: number;        // 년
    month: number;       // 월
    age: number;         // 시뮬레이션 시점의 예상 나이
    assets: number;      // 예상 순자산 (원)
    fiNumber: number;    // 목표 FIRE 자산 (원)
    isAchieved: boolean; // 목표 달성 여부
}

/**
 * FIRE 계산기 입력 속성 인터페이스
 */
export interface UseFireCalcProps {
    monthlyIncome: number;      // 월 소득 (만원)
    monthlyExpense: number;     // 월 소비 (만원)
    currentAssets: number;      // 현재 순자산 (만원)
    expectedReturn: number;     // 연 예상 투자 수익률 (%)
    targetRetireMonthly: number; // 은퇴 후 희망 월 생활비 (만원)
    currentAge?: number;        // 현재 나이
    withdrawalRate?: number;    // 안전 인출률 (%), 기본값 4%
}

/**
 * FIRE(Financial Independence, Retire Early) 목표 달성 시점 계산 커스텀 훅
 */
export const useFireCalc = ({
    monthlyIncome,
    monthlyExpense,
    currentAssets,
    expectedReturn,
    targetRetireMonthly,
    currentAge = 35,
    withdrawalRate = 4.0,
}: UseFireCalcProps) => {

    return useMemo(() => {
        // 만원 단위를 원 단위로 변환해 정확도 계산
        const incomeRaw = monthlyIncome * 10000;
        const expenseRaw = monthlyExpense * 10000;
        const assetsRaw = currentAssets * 10000;
        const targetRaw = targetRetireMonthly * 10000;

        // 1. 기초 계산
        // 월 저축 가능 금액 및 저축률 산출
        const monthlySavings = Math.max(0, incomeRaw - expenseRaw);
        const savingsRate = incomeRaw > 0 ? (monthlySavings / incomeRaw) * 100 : 0;

        // FI Number (목표 은퇴 자산) 계산
        // 공식: 연간 목표 생활비 / 안전 인출률
        // 예: 인출률 4% 시 연 생활비의 25배, 3% 시 약 33배 필요
        const annualRetireExpense = targetRaw * 12;
        const safeWithdrawalRate = withdrawalRate / 100;
        const fiNumber = safeWithdrawalRate > 0 ? annualRetireExpense / safeWithdrawalRate : 0;

        // 2. 자산 성장 시뮬레이션 (물가상승률 반영한 실질 수익률 사용)
        // 자산과 비용 모두 현재가치(Present Value) 기준으로 시뮬레이션하기 위해
        // '실질 수익률(Real Return Rate)'을 적용합니다.
        // 실질 수익률 = (1 + 명목 수익률) / (1 + 물가상승률) - 1

        const inflationRate = 0.025; // 고정 인플레이션 2.5% 가정
        const nominalReturnRate = expectedReturn / 100;
        const realReturnRate = (1 + nominalReturnRate) / (1 + inflationRate) - 1;
        const monthlyRealReturn = realReturnRate / 12;

        let currentBalance = assetsRaw;
        let achievedMonthIndex = -1;

        const outputData: FireDataPoint[] = [];

        const now = new Date();
        const startYear = now.getFullYear();
        const startMonth = now.getMonth() + 1;

        // 최대 시뮬레이션 기간 설정 (최대 100년 = 1200개월)
        const MAX_MONTHS = 1200;

        // 월별 시뮬레이션 루프
        for (let i = 0; i < MAX_MONTHS; i++) {
            const totalMonths = (startMonth - 1) + i;
            const year = startYear + Math.floor(totalMonths / 12);
            const month = (totalMonths % 12) + 1;
            const age = currentAge + Math.floor(i / 12);

            // 데이터 기록 시점: 시작 시점, 매년 초, 그리고 목표 달성 시점
            const isStartOfYear = month === 1;
            const isStartOfSim = i === 0;

            // 목표 달성 여부 확인
            if (achievedMonthIndex === -1 && currentBalance >= fiNumber) {
                achievedMonthIndex = i;
                // 달성 시점의 데이터를 명시적으로 기록
                outputData.push({
                    monthIndex: i,
                    year,
                    month,
                    age,
                    assets: Math.round(currentBalance),
                    fiNumber: Math.round(fiNumber),
                    isAchieved: true
                });
            } else if (achievedMonthIndex !== -1) {
                // 이미 달성한 경우, 시각화를 위해 달성 후 20년까지만 더 시뮬레이션 후 종료
                if ((i - achievedMonthIndex) >= 240) {
                    break;
                }
            }

            // 정기적인 차트 데이터 포인트 기록 (연 단위)
            const lastPoint = outputData[outputData.length - 1];
            const isDuplicate = lastPoint && lastPoint.monthIndex === i;

            if ((isStartOfYear || isStartOfSim) && !isDuplicate) {
                outputData.push({
                    monthIndex: i,
                    year,
                    month,
                    age,
                    assets: Math.round(currentBalance),
                    fiNumber: Math.round(fiNumber),
                    isAchieved: achievedMonthIndex !== -1 && achievedMonthIndex <= i
                });
            }

            // 복리 수익 적용 및 저축액 합산
            const investmentReturn = currentBalance * monthlyRealReturn;
            currentBalance += investmentReturn + monthlySavings;
        }

        // 3. 결과 포맷팅
        let timeToFire = { years: 0, months: 0 };
        let fireDateObj = null;

        if (achievedMonthIndex !== -1) {
            // 달성까지 걸리는 시간 계산
            timeToFire = {
                years: Math.floor(achievedMonthIndex / 12),
                months: achievedMonthIndex % 12
            };

            // 예상 달성 날짜 계산
            const d = new Date();
            d.setMonth(d.getMonth() + achievedMonthIndex);
            fireDateObj = {
                year: d.getFullYear(),
                month: d.getMonth() + 1
            };
        }

        return {
            monthlySavings,    // 월 저축 가능액 (원)
            savingsRate,       // 저축률 (%)
            fiNumber,          // 목표 FIRE 자산 (원)
            data: outputData,  // 시뮬레이션 기반 차트 데이터
            timeToFire,        // 달성까지 소요 시간
            fireDate: fireDateObj, // 예상 달성 일자
            isPossible: achievedMonthIndex !== -1, // 달성 가능 여부
            achievedYear: fireDateObj?.year        // 달성 연도 (차트 참조선용)
        };

    }, [monthlyIncome, monthlyExpense, currentAssets, expectedReturn, targetRetireMonthly, currentAge, withdrawalRate]);
};

