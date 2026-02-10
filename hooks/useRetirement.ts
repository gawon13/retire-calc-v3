'use client';

import { useMemo } from 'react';

export interface RetirementInputs {
    ageNow: number;
    ageRetire: number;
    targetMonthly: number; // 만원 단위
    assetSafe: number; // 만원 단위
    assetInvest: number; // 만원 단위
    rateSafe: number; // % 단위
    rateInvest: number; // % 단위
    monthlyInvest: number; // 만원 단위
    withdrawalStrategy: 'uniform' | 'target';
}

export interface YearData {
    age: number;
    balance: number;
    safe: number;
    invest: number;
    expense: number;
    withdrawal: number;
    shortfall: number;
    isRetired: boolean;
}

export interface RetirementResult {
    data: YearData[];
    totalAssetsAtRetire: number;
    avgMonthlyShortfall: number;
    depletionAge: number | null;
    score: number;
    error: boolean;
    msg?: string;
}

const CONST_LIFE_EXPECTANCY = 85;
const INFLATION_RATE = 2.5; // 물가상승률 %

function safeNumber(val: number): number {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return 0;
    return Math.max(0, val);
}

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

        // Validation
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

        // Convert to actual currency (만원 -> 원)
        const effMonthlyInvest = monthlyInvest * 10000;
        const effTargetMonthly = targetMonthly * 10000;

        // Initial asset allocation ratio
        let totalInitial = assetSafe * 10000 + assetInvest * 10000;
        let ratioInvest = totalInitial > 0 ? (assetInvest * 10000) / totalInitial : 0.5;
        let ratioSafe = 1.0 - ratioInvest;

        // Asset pools
        let pool_safe = safeNumber(assetSafe * 10000);
        let pool_invest = safeNumber(assetInvest * 10000);

        const data: YearData[] = [];
        let totalShortfall = 0;
        let retiredMonths = 0;
        let depletionAge: number | null = null;
        let totalAssetsAtRetire = 0;

        // Simulate from current age to 85
        for (let age = ageNow; age <= CONST_LIFE_EXPECTANCY; age++) {
            const isRetired = age >= ageRetire;
            const yearIndex = age - ageNow;

            // Inflation adjustment
            const inflationFactor = Math.pow(1 + INFLATION_RATE / 100, yearIndex);
            const annualExpenseNeed = effTargetMonthly * 12 * inflationFactor;

            // Market fluctuation simulation (deterministic)
            const marketTrend = Math.sin(yearIndex * 0.5);
            const marketNoise = Math.cos(yearIndex * 1.5) * 0.3;
            const marketFactor = (marketTrend + marketNoise) * 0.05;

            const rate_safe_applied = rateSafe;
            const rate_invest_applied = rateInvest + marketFactor * 100;

            const applyGrowth = (pool: number, rate: number) => pool * (1 + rate / 100);

            let withdrawal = 0;
            let yearlyShortfall = 0;

            if (!isRetired) {
                // Accumulation phase: Add monthly investments
                const annualCont = effMonthlyInvest * 12;
                const contSafe = annualCont * ratioSafe;
                const contInvest = annualCont * ratioInvest;

                pool_safe = safeNumber(applyGrowth(pool_safe + contSafe, rate_safe_applied));
                pool_invest = safeNumber(applyGrowth(pool_invest + contInvest, rate_invest_applied));
            } else {
                // Retirement phase: Withdraw to meet expenses
                retiredMonths += 12;

                // Apply growth first
                pool_safe = safeNumber(applyGrowth(pool_safe, rate_safe_applied));
                pool_invest = safeNumber(applyGrowth(pool_invest, rate_invest_applied));

                let totalLiquid = pool_safe + pool_invest;

                if (totalLiquid > 0) {
                    if (withdrawalStrategy === 'uniform') {
                        // Uniform strategy: divide remaining assets evenly over remaining years
                        const monthsRemaining = Math.max(1, (CONST_LIFE_EXPECTANCY - age + 1) * 12);
                        const monthlyWithdrawal = totalLiquid / monthsRemaining;
                        withdrawal = monthlyWithdrawal * 12;
                    } else {
                        // Target strategy: try to meet target monthly expense
                        withdrawal = Math.min(totalLiquid, annualExpenseNeed);
                    }

                    // Withdraw proportionally from each pool
                    const safeShare = totalLiquid > 0 ? pool_safe / totalLiquid : 0.5;
                    pool_safe = safeNumber(pool_safe - withdrawal * safeShare);
                    pool_invest = safeNumber(pool_invest - withdrawal * (1 - safeShare));
                } else {
                    // No assets left
                    if (depletionAge === null) depletionAge = age;
                }

                yearlyShortfall = Math.max(0, annualExpenseNeed - withdrawal);
                totalShortfall += yearlyShortfall / inflationFactor;
            }

            // Save retirement time assets
            if (age === ageRetire) {
                totalAssetsAtRetire = Math.round(pool_safe + pool_invest);
            }

            const totalBal = Math.round(pool_safe + pool_invest);
            data.push({
                age,
                balance: totalBal,
                safe: Math.round(pool_safe),
                invest: Math.round(pool_invest),
                expense: Math.round(annualExpenseNeed / 12), // Monthly
                withdrawal: Math.round(withdrawal / 12), // Monthly
                shortfall: Math.round(yearlyShortfall / 12), // Monthly
                isRetired,
            });
        }

        // Calculate average monthly shortfall
        const avgMonthlyShortfall =
            retiredMonths > 0 ? Math.round(totalShortfall / (retiredMonths / 12) / 12) : 0;

        // Score calculation (rule of thumb: 25x annual expense)
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
