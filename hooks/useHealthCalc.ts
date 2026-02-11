import { useState, useMemo } from 'react';

export type HealthStatus = 'SAFE' | 'WARNING' | 'DANGER';
export type HealthCalcMode = 'DEPENDENT' | 'EMPLOYEE';

interface HealthCalcProps {
    mode: HealthCalcMode;
    isBizRegistered: boolean;
    hasSpouseJob: boolean; // 배우자 직장가입자 여부 (피부양자 모드 전용)
    annualRentalIncome: number;   // 만원 단위 (연간 주택임대소득) *변경됨
    bizIncome: number;      // 만원 단위 (연간 기타 사업소득)
    financialIncome: number; // 만원 단위 (연간 이자+배당)
    pensionIncome: number;   // 만원 단위 (연간 공적연금) *추가됨
    otherIncome: number;    // 만원 단위 (연간 기타 합산)
    propertyValue: number;  // 만원 단위 (재산세 과세표준)
    jeonseDeposit: number;  // 만원 단위 (전세 보증금 - 피부양자 모드 전용)
}

interface HealthCalcResult {
    status: HealthStatus;
    reasons: string[];
    description: string;
    monthlyPremium: number; // 월 추가 납부액 (직장인 모드 전용)
    calculations: {
        annualRentalIncome: number;
        finalProperty: number;
        totalIncome: number;
        incomeBreakdown: {
            financial: number;
            rental: number;
            biz: number;
            pension: number;
            other: number;
        };
    };
}

export const useHealthCalc = ({
    mode,
    isBizRegistered,
    hasSpouseJob,
    annualRentalIncome,
    bizIncome,
    financialIncome,
    pensionIncome,
    otherIncome,
    propertyValue,
    jeonseDeposit,
}: HealthCalcProps): HealthCalcResult => {

    return useMemo(() => {
        const reasons: string[] = [];
        let status: HealthStatus = 'SAFE';
        let monthlyPremium = 0;
        let description = '';

        // 1. 소득 변환 (월 -> 연) : 이미 연간 소득으로 입력받음
        // const annualRentalIncome = monthlyRentalIncome * 12;

        // 2. 재산 환산 (전세금 30% 합산)
        const finalProperty = propertyValue + (jeonseDeposit * 0.3);

        // 3. 소득 합계 (금융+임대+사업+연금+기타)
        const totalIncome = financialIncome + annualRentalIncome + bizIncome + pensionIncome + otherIncome;

        // ==========================================
        // 모드 1: 피부양자 자격 체크
        // ==========================================
        if (mode === 'DEPENDENT') {
            // A. 배우자 직장가입 여부 체크
            if (!hasSpouseJob) {
                status = 'DANGER';
                reasons.push('배우자가 직장가입자가 아니면 피부양자가 될 수 없습니다. (지역가입자 전환)');
            }

            // B. 사업자 등록 여부 및 소득 체크 (임대/사업)
            if (isBizRegistered) {
                // 사업자 등록 시 소득 0원 초과하면 박탈
                if (bizIncome > 0 || annualRentalIncome > 0) {
                    status = 'DANGER';
                    reasons.push('사업자 등록 상태에서 소득(사업/임대)이 발생하면 자격이 박탈됩니다.');
                }
            } else {
                // 사업자 미등록 시
                // 주택임대소득(월세) 체크: 연 400만원 (월 약 33.3만원) 기준
                if (annualRentalIncome > 400) {
                    status = 'WARNING';
                    reasons.push('미등록 주택임대소득이 연 400만원(월 33만원)을 초과하여 자격 박탈 위험이 있습니다. (공단 확인 필요)');
                }

                // 기타 사업소득 연 500만원 초과 시 박탈 (프리랜서 등)
                if (bizIncome > 500) {
                    status = 'DANGER';
                    reasons.push('프리랜서 등 사업소득이 연 500만원을 초과하여 자격이 박탈됩니다.');
                }
            }

            // C. 금융소득 (이자+배당) 체크
            if (financialIncome > 2000) {
                status = 'DANGER';
                reasons.push('연간 금융소득(이자+배당)이 2,000만원을 초과하여 자격이 박탈됩니다.');
            }

            // D. 소득 + 재산 요건 체크
            if (totalIncome > 2000) {
                status = 'DANGER';
                reasons.push('연간 합산 소득이 2,000만원을 초과하여 자격이 박탈됩니다.');
            }

            if (finalProperty > 90000) { // 9억원 초과
                status = 'DANGER';
                reasons.push('재산 환산액(과표 + 전세금30%)이 9억원을 초과하여 자격이 박탈됩니다.');
            } else if (finalProperty > 54000) { // 5.4억 ~ 9억
                if (totalIncome > 1000) { // 연 소득 1,000만원 초과
                    status = 'DANGER';
                    reasons.push('재산 환산액이 5.4억원을 초과하고 연 소득이 1,000만원을 넘어 자격이 박탈됩니다.');
                }
            }

            // 설명 생성
            if (status === 'DANGER') {
                description = '피부양자 자격 유지 불가능 (지역가입자 전환 대상)';
            } else if (status === 'WARNING') {
                description = '주의가 필요합니다. 소득이나 재산이 기준선에 근접해 있습니다.';
            } else {
                description = '현재 기준으로 피부양자 자격 유지가 가능합니다.';
            }
        }
        // ==========================================
        // 모드 2: 직장인 추가 보험료 계산
        // ==========================================
        else {
            // 직장인 추가 건보료는 '보수월액(월급) 포함여부'와 무관하게
            // "보수 외 소득" 이 연 2,000만원을 초과하는 경우에만 부과됨.

            // 연 2,000만원 초과분에 대해서만 부과
            if (totalIncome > 2000) {
                const excessIncome = totalIncome - 2000; // 초과금액 (만원)

                // 월 보험료 = (연간 초과소득 / 12) * 소득월액 보험료율 (2024년 기준 약 7.09%)
                monthlyPremium = Math.floor((excessIncome * 10000) / 12 * 0.0709);

                status = 'WARNING';
                description = `월급 외 소득이 연 2,000만원을 초과하여 추가 보험료가 발생합니다.`;
            } else {
                monthlyPremium = 0;
                status = 'SAFE';
                description = '월급 외 소득이 연 2,000만원 이하이므로 추가 보험료가 발생하지 않습니다.';
            }
        }

        return {
            status,
            reasons,
            description,
            monthlyPremium,
            calculations: {
                annualRentalIncome,
                finalProperty,
                totalIncome,
                incomeBreakdown: {
                    financial: financialIncome,
                    rental: annualRentalIncome,
                    biz: bizIncome,
                    pension: pensionIncome,
                    other: otherIncome,
                }
            }
        };
    }, [mode, isBizRegistered, hasSpouseJob, annualRentalIncome, bizIncome, financialIncome, pensionIncome, otherIncome, propertyValue, jeonseDeposit]);
};
