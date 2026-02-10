import { useMemo } from 'react';

export interface CompoundInputs {
    initialAmount: number; // 만원 단위
    monthlyAmount: number; // 만원 단위
    years: number; // 년
    rate: number; // % 단위
}

export interface YearData {
    year: number;
    amount: number;     // 총 자산 (복리: 원금 + 이자)
    principal: number;  // 원금 합계
    interest: number;   // 이자 합계 (복리)
    simpleAmount: number; // 단리 총 자산 (원금 + 단리 이자)
    simpleInterest: number; // 단리 이자
}

export interface CompoundResult {
    yearlyData: YearData[];
    totalAmount: number;
    totalPrincipal: number;
    totalInterest: number;
    totalSimpleInterest: number; // 단리 총 이자
}

export function useCompoundCalc(inputs: CompoundInputs): CompoundResult {
    return useMemo(() => {
        const { initialAmount, monthlyAmount, years, rate } = inputs;

        const data: YearData[] = [];

        // 초기값 설정 (0년차)
        let currentPrincipal = initialAmount * 10000;
        let currentAmount = initialAmount * 10000;
        let currentSimpleAmount = initialAmount * 10000;
        let currentInterest = 0;

        // 0년차 데이터 추가 (시작점)
        data.push({
            year: 0,
            amount: Math.round(currentAmount),
            principal: Math.round(currentPrincipal),
            interest: Math.round(currentInterest),
            simpleAmount: Math.round(currentSimpleAmount),
            simpleInterest: 0,
        });

        const monthlyRate = rate / 100 / 12;

        // 1년차부터 loop
        for (let y = 1; y <= years; y++) {
            // 1년(12개월) 동안 매월 적립 및 복리 계산
            for (let m = 0; m < 12; m++) {
                // 이자 발생 (월 복리)
                const interestEarned = currentAmount * monthlyRate;
                currentInterest += interestEarned;
                currentAmount += interestEarned;

                // 월 적립금 추가
                const contribution = monthlyAmount * 10000;
                currentPrincipal += contribution;
                currentAmount += contribution;
            }

            // 단리 계산
            // 1. 거치식 부분: 초기투자금 * (1 + 연이율 * 년수)
            // 2. 적립식 부분 (연이율/12 * 개월수 합계 적용)
            const totalMonths = y * 12;
            const simpleInterestLumpSum = (initialAmount * 10000) * (rate / 100) * y;

            // 적립식 단리 이자: 매월 납입금이 예치된 기간만큼 이자 발생
            // 첫달 납입금: 12*y - 1 개월간 거치? (월초 납입 가정시 12*y 개월?) -> 보통 월말 납입 가정시 12*y-1...
            // 여기서는 복리 계산이 월초/월말 중 어떻게 되었는지 확인 필요.
            // 위 복리 루프에서 이자먼저 계산하므로 '월초 자산에 이자 붙고, 월말에 추가 납입' 형태임.
            // 즉 납입금은 다음달부터 이자가 붙음.
            // 따라서 1년차: 1월 납입금 -> 11개월 이자, 2월 납입금 -> 10개월 이자 ... 12월 납입금 -> 0개월 이자.
            // 총 년수 y년.
            // k번째 달 납입금은 (12*y - k) 개월간 거치됨. (k=1..12*y)
            // 총 이자 = 월납입금 * (연이율/12) * ( (12*y-1) + (12*y-2) + ... + 0 )
            // 등차수열 합: n(n-1)/2 where n = 12*y

            const n = totalMonths;
            const simpleInterestMonthly = (monthlyAmount * 10000) * (rate / 100 / 12) * (n * (n - 1) / 2);

            const totalPrincipalY = (initialAmount * 10000) + (monthlyAmount * 10000 * totalMonths);
            const totalSimpleAmount = totalPrincipalY + simpleInterestLumpSum + simpleInterestMonthly;
            const simpleInterest = totalSimpleAmount - totalPrincipalY;

            data.push({
                year: y,
                amount: Math.round(currentAmount),
                principal: Math.round(currentPrincipal),
                interest: Math.round(currentAmount - currentPrincipal),
                simpleAmount: Math.round(totalSimpleAmount),
                simpleInterest: Math.round(simpleInterest),
            });
        }

        const totalAmount = Math.round(currentAmount);
        const totalPrincipal = Math.round(currentPrincipal);
        const totalInterest = Math.round(currentAmount - currentPrincipal);
        const lastData = data[data.length - 1];
        const totalSimpleInterest = Math.round(lastData.simpleAmount - lastData.principal);

        return {
            yearlyData: data,
            totalAmount,
            totalPrincipal,
            totalInterest,
            totalSimpleInterest,
        };
    }, [inputs]);
}
