import { useMemo } from 'react';

export interface KidsYearData {
    age: number;
    amount: number;             // 세전 총 자산
    principal: number;          // 원금 합계
    totalInterest: number;      // 총 이자 (세전)
    // 세후 예상 수령액 (Liquidation Value)
    afterTaxUS: number;         // 미국 직투 (매년 250만원 공제 시뮬레이션 후 22% 과세)
    afterTaxPension: number;    // 연금저축 (기타소득세 16.5% 과세 - 중도인출 가정)
    // 상세 세금 정보
    taxUS: number;
    taxPension: number;
}

export interface KidsCalcProps {
    currentAge: number;
    targetAge: number;
    initialAmount: number;
    monthlyAmount: number;
    rate: number;
}

export const useKidsCalc = ({
    currentAge,
    targetAge,
    initialAmount,
    monthlyAmount,
    rate,
}: KidsCalcProps) => {
    return useMemo(() => {
        const yearlyData: KidsYearData[] = [];
        let currentPrincipal = initialAmount * 10000;
        let currentAmount = initialAmount * 10000;

        // 미국 직투 시뮬레이션 변수
        // 매년 250만원 실현손익 공제를 위해 "매수 단가(Cost Basis)"를 250만원씩 높여줌
        let usCostBasis = initialAmount * 10000;

        const monthly = monthlyAmount * 10000;
        const monthlyRate = rate / 100 / 12;
        const duration = Math.max(0, targetAge - currentAge);

        // 0년차 초기화
        yearlyData.push({
            age: currentAge,
            amount: Math.round(currentAmount),
            principal: Math.round(currentPrincipal),
            totalInterest: 0,
            afterTaxUS: Math.round(currentAmount),
            afterTaxPension: Math.round(currentAmount),
            taxUS: 0,
            taxPension: 0,
        });

        for (let year = 1; year <= duration; year++) {
            // 1. 자산 성장 (연 복리)
            for (let month = 1; month <= 12; month++) {
                currentAmount = (currentAmount + monthly) * (1 + monthlyRate);
                currentPrincipal += monthly;
                // 매월 적립금만큼 코스트 베이시스 증가 (직투)
                usCostBasis += monthly;
            }

            const totalInterestRaw = currentAmount - currentPrincipal;

            // 2. 미국 직투 "매년 250만원 비과세" 시뮬레이션
            // *가정: 매년 말 평가익이 있다면 250만원만큼 매도 후 재매수하여 '취득가액(Cost Basis)'을 높임.
            // 실제 평가익: currentAmount - usCostBasis
            const unrealizedGain = Math.max(0, currentAmount - usCostBasis);
            const harvestedAmount = Math.min(unrealizedGain, 2500000); // 연 최대 250만원

            // 공제받은 만큼 취득가액 상승
            usCostBasis += harvestedAmount;

            // 최종 매도 시 세금 계산
            // Taxable Gain = 총 자산 - (원금 + 누적된 공제액 + 재투자된 금액)
            // = currentAmount - usCostBasis
            const finalTaxableGainUS = Math.max(0, currentAmount - usCostBasis);
            const taxUS = finalTaxableGainUS * 0.22; // 22% 양도소득세

            // 3. 연금저축펀드 세금 계산 (미성년/청년기 중도 인출 가정)
            // *가정: 세액공제를 받지 않은 원금은 과세 제외. 운용 수익에 대해서만 16.5% 기타소득세.
            // *만약 55세 이후 연금 수령이라면 3.3~5.5%지만, 자녀 투자는 보통 성인 시점(20~30세) 활용이 목적이므로 16.5% 적용.
            const taxableGainPension = Math.max(0, totalInterestRaw);
            const taxPension = taxableGainPension * 0.165; // 16.5% 기타소득세

            yearlyData.push({
                age: currentAge + year,
                amount: Math.round(currentAmount),
                principal: Math.round(currentPrincipal),
                totalInterest: Math.round(totalInterestRaw),
                afterTaxUS: Math.round(currentAmount - taxUS),
                afterTaxPension: Math.round(currentAmount - taxPension),
                taxUS: Math.round(taxUS),
                taxPension: Math.round(taxPension),
            });
        }

        const finalData = yearlyData[yearlyData.length - 1];

        // 증여세 체크 로직 (기존 유지)
        const tenYearPrincipal = (initialAmount * 10000) + (monthly * 12 * 10);
        let giftLimit = 20000000;
        if (currentAge >= 19) giftLimit = 50000000;

        const isGiftLimitExceeded = tenYearPrincipal > giftLimit;
        const giftLimitMessage = isGiftLimitExceeded
            ? `10년 간 납입 원금이 증여세 면제 한도(${currentAge < 19 ? '2천' : '5천'}만원)를 초과할 수 있습니다.`
            : '증여세 면제 한도 내에서 안전하게 증여 가능합니다.';

        return {
            yearlyData,
            finalAmount: finalData.amount,
            finalAfterTaxUS: finalData.afterTaxUS,
            finalAfterTaxPension: finalData.afterTaxPension,
            totalPrincipal: finalData.principal,
            totalInterest: finalData.totalInterest,
            isGiftLimitExceeded,
            giftLimitMessage,
        };
    }, [currentAge, targetAge, initialAmount, monthlyAmount, rate]);
};
