import { useMemo } from 'react';

export interface TaxYearData {
    year: number;
    amountGeneral: number; // 일반 계좌 총액 (세후)
    amountSaving: number;  // 절세 계좌 총액 (세후)
    principal: number;     // 원금
    taxGeneral: number;    // 일반 계좌 발생 세금
    taxSaving: number;     // 절세 계좌 발생 세금
}

export interface TaxCalcProps {
    initialAmount: number; // 초기 투자금 (만원)
    monthlyAmount: number; // 월 적립액 (만원)
    rate: number;          // 연 수익률 (%)
    years: number;         // 투자 기간 (년)
    taxRateGeneral?: number; // 일반 과세율 (기본 15.4%)
    taxRateSaving?: number;  // 절세 계좌 과세율 (기본 0% or ISA 9.9%)
}

export const useTaxCalc = ({
    initialAmount,
    monthlyAmount,
    rate,
    years,
    taxRateGeneral = 15.4,
    taxRateSaving = 0,
}: TaxCalcProps) => {
    return useMemo(() => {
        const yearlyData: TaxYearData[] = [];
        let currentPrincipal = initialAmount * 10000;
        let currentAmount = initialAmount * 10000;
        const monthly = monthlyAmount * 10000;
        const monthlyRate = rate / 100 / 12;

        // 0년차 초기화
        yearlyData.push({
            year: 0,
            amountGeneral: Math.round(currentAmount),
            amountSaving: Math.round(currentAmount),
            principal: Math.round(currentPrincipal),
            taxGeneral: 0,
            taxSaving: 0,
        });

        for (let year = 1; year <= years; year++) {
            // 1년치 월 복리 계산
            for (let month = 1; month <= 12; month++) {
                currentAmount = (currentAmount + monthly) * (1 + monthlyRate);
                currentPrincipal += monthly;
            }

            // 총 이자
            const totalInterest = currentAmount - currentPrincipal;

            // 세금 계산 (수익에 대해서만 과세)
            // 일반 계좌: 전체 이자에 대해 매년 과세한다고 가정하지 않고, "최종 인출 시" 또는 "평가 금액 기준" 비교를 위해
            // 단순하게 총 자산에서 (총 이자 * 세율)을 뺀 가치를 비교.
            // *실제로는 매년 배당소득세가 나가지만, 여기서는 '만기 일시 인출' 가정 시의 세후 수령액 비교가 직관적임.

            const taxGen = totalInterest > 0 ? totalInterest * (taxRateGeneral / 100) : 0;
            const taxSav = totalInterest > 0 ? totalInterest * (taxRateSaving / 100) : 0;

            const amountGen = currentAmount - taxGen;
            const amountSav = currentAmount - taxSav;

            yearlyData.push({
                year: year,
                amountGeneral: Math.round(amountGen),
                amountSaving: Math.round(amountSav),
                principal: Math.round(currentPrincipal),
                taxGeneral: Math.round(taxGen),
                taxSaving: Math.round(taxSav),
            });
        }

        const finalData = yearlyData[yearlyData.length - 1];
        const totalTaxSaved = finalData.amountSaving - finalData.amountGeneral;

        return {
            yearlyData,
            totalGeneral: finalData.amountGeneral,
            totalSaving: finalData.amountSaving,
            totalPrincipal: finalData.principal,
            totalTaxSaved,
        };
    }, [initialAmount, monthlyAmount, rate, years, taxRateGeneral, taxRateSaving]);
};
