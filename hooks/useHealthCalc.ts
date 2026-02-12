import { useState, useMemo } from 'react';

// 건강보험 상태 타입: 안전(SAFE), 주의(WARNING), 위험(DANGER)
export type HealthStatus = 'SAFE' | 'WARNING' | 'DANGER';
// 계산 모드 타입: 피부양자(DEPENDENT), 직장가입자(EMPLOYEE)
export type HealthCalcMode = 'DEPENDENT' | 'EMPLOYEE';

/**
 * 건강보험료 계산기 속성 인터페이스
 */
interface HealthCalcProps {
    mode: HealthCalcMode;
    isBizRegistered: boolean;      // 사업자 등록 여부
    hasSpouseJob: boolean;         // 배우자 직장가입자 여부 (피부양자 모드 전용)
    annualRentalIncome: number;    // 연간 주택임대소득 (만원)
    bizIncome: number;             // 연간 기타 사업소득 (만원)
    financialIncome: number;       // 연간 금융소득 (이자+배당, 만원)
    pensionIncome: number;         // 연간 공적연금 소득 (만원)
    otherIncome: number;           // 연간 기타 합산 소득 (만원)
    propertyValue: number;         // 재산세 과세표준 (만원)
    jeonseDeposit: number;         // 전세 보증금 (만원, 피부양자 모드 전용)
}

/**
 * 건강보험료 계산 결과 인터페이스
 */
interface HealthCalcResult {
    status: HealthStatus;          // 자격/비용 상태
    reasons: string[];             // 사유 목록
    description: string;           // 요약 설명
    monthlyPremium: number;        // 월 추가 납부액 (직장인 모드 전용)
    calculations: {                // 상세 계산값
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

/**
 * 대한민국 국민건강보험 규정에 따른 자격 및 보험료 시뮬레이션 훅
 */
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

        // 1. 재산 환산 (전세금의 30%를 재산으로 합산)
        const finalProperty = propertyValue + (jeonseDeposit * 0.3);

        // 2. 소득 합계 산출 (금융+임대+사업+연금+기타)
        const totalIncome = financialIncome + annualRentalIncome + bizIncome + pensionIncome + otherIncome;

        // ==========================================
        // 모드 1: 피부양자 자격 유지 여부 체크
        // ==========================================
        if (mode === 'DEPENDENT') {
            // A. 기초 요건: 배우자(또는 직계가족)가 직장가입자여야 함
            if (!hasSpouseJob) {
                status = 'DANGER';
                reasons.push('배우자가 직장가입자가 아니면 피부양자가 될 수 없습니다. (지역가입자 전환)');
            }

            // B. 사업소득 요건: 사업자 등록 여부에 따라 기준 상이
            if (isBizRegistered) {
                // 사업자 등록 시: 사업/임대 소득이 1원이라도 있으면 자격 박탈
                if (bizIncome > 0 || annualRentalIncome > 0) {
                    status = 'DANGER';
                    reasons.push('사업자 등록 상태에서 소득(사업/임대)이 발생하면 자격이 박탈됩니다.');
                }
            } else {
                // 사업자 미등록 시: 연간 주택임대소득 400만원 초과 시 박탈 위험
                if (annualRentalIncome > 400) {
                    status = 'WARNING';
                    reasons.push('미등록 주택임대소득이 연 400만원(월 33만원)을 초과하여 자격 박탈 위험이 있습니다. (공단 확인 필요)');
                }

                // 사업 미등록 시: 기타 사업소득(프리랜서 등) 500만원 초과 시 박탈
                if (bizIncome > 500) {
                    status = 'DANGER';
                    reasons.push('프리랜서 등 사업소득이 연 500만원을 초과하여 자격이 박탈됩니다.');
                }
            }

            // C. 금융소득 요건: 연간 2,000만원 초과 시 박탈
            if (financialIncome > 2000) {
                status = 'DANGER';
                reasons.push('연간 금융소득(이자+배당)이 2,000만원을 초과하여 자격이 박탈됩니다.');
            }

            // D. 소득 및 재산 복합 요건 (2022년 건강보험료 개편안 반영)
            // 연간 전체 합산 소득 2,000만원 초과 시 박탈
            if (totalIncome > 2000) {
                status = 'DANGER';
                reasons.push('연간 합산 소득이 2,000만원을 초과하여 자격이 박탈됩니다.');
            }

            // 재산 요건: 과표 기준 9억원 초과 시 박탈
            if (finalProperty > 90000) {
                status = 'DANGER';
                reasons.push('재산 환산액(과표 + 전세금30%)이 9억원을 초과하여 자격이 박탈됩니다.');
            }
            // 재산이 5.4억 ~ 9억 사이인 경우, 연 소득 1,000만원 초과 시 박탈
            else if (finalProperty > 54000) {
                if (totalIncome > 1000) {
                    status = 'DANGER';
                    reasons.push('재산 환산액이 5.4억원을 초과하고 연 소득이 1,000만원을 넘어 자격이 박탈됩니다.');
                }
            }

            // 최종 설명 생성
            if (status === 'DANGER') {
                description = '피부양자 자격 유지 불가능 (지역가입자 전환 대상)';
            } else if (status === 'WARNING') {
                description = '주의가 필요합니다. 소득이나 재산이 기준선에 근접해 있습니다.';
            } else {
                description = '현재 기준으로 피부양자 자격 유지가 가능합니다.';
            }
        }
        // ==========================================
        // 모드 2: 직장가입자 (소득월액 보험료) 추가 보험료 계산
        // ==========================================
        else {
            // 직장인은 월급 외 소득(보수 외 소득)이 연 2,000만원을 초과하는 경우에만 추가 보험료 부과
            // 부과 대상액 = (연간 외 소득 - 2,000만원)

            if (totalIncome > 2000) {
                const excessIncome = totalIncome - 2000;

                // 월 추가 보험료 = (초과액 / 12) * 소득월액 보험료율 (2024년 기준 7.09%)
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
