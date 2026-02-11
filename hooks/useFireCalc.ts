import { useMemo } from 'react';

export interface FireDataPoint {
    monthIndex: number; // 0, 1, 2...
    year: number;
    month: number;
    age: number; // currentAge + floor(monthIndex / 12)
    assets: number;
    fiNumber: number;
    isAchieved: boolean;
}

export interface UseFireCalcProps {
    monthlyIncome: number; // Man-won unit
    monthlyExpense: number; // Man-won unit
    currentAssets: number; // Man-won unit
    expectedReturn: number; // Annual return rate in %
    targetRetireMonthly: number; // Man-won unit
    currentAge?: number; // Update: User input
    withdrawalRate?: number; // Update: User input, default 4%
}

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
        // Convert inputs to raw Won (x10000)
        const incomeRaw = monthlyIncome * 10000;
        const expenseRaw = monthlyExpense * 10000;
        const assetsRaw = currentAssets * 10000;
        const targetRaw = targetRetireMonthly * 10000;

        // 1. Basic Calculations
        const monthlySavings = Math.max(0, incomeRaw - expenseRaw);
        const savingsRate = incomeRaw > 0 ? (monthlySavings / incomeRaw) * 100 : 0;

        // FI Number
        // Formula: Annual Expense / Withdrawal Rate
        // If Withdrawal Rate is 4%, it is * 25.
        // If Withdrawal Rate is 3%, it is * 33.33...
        const annualRetireExpense = targetRaw * 12;
        const safeWithdrawalRate = withdrawalRate / 100;
        const fiNumber = safeWithdrawalRate > 0 ? annualRetireExpense / safeWithdrawalRate : 0;

        // 2. Projection (Real Value / Inflation Adjusted)
        // Assumption: "Assets are Present Value" & "Expenses are Present Value"
        // To keep everything in Present Value, we use "Real Return Rate".
        // Real Return = (1 + Nominal Return) / (1 + Inflation) - 1
        // Inflation is fixed at 2.5%

        const inflationRate = 0.025;
        const nominalReturnRate = expectedReturn / 100;
        const realReturnRate = (1 + nominalReturnRate) / (1 + inflationRate) - 1;
        const monthlyRealReturn = realReturnRate / 12;

        let currentBalance = assetsRaw;
        let achievedMonthIndex = -1;

        const outputData: FireDataPoint[] = [];

        const now = new Date();
        const startYear = now.getFullYear();
        const startMonth = now.getMonth() + 1; // 1-12

        // Max simulation months (e.g. 100 years = 1200 months)
        const MAX_MONTHS = 1200;

        // Simulation Loop
        for (let i = 0; i < MAX_MONTHS; i++) {
            // Calculate date
            const totalMonths = (startMonth - 1) + i;
            const year = startYear + Math.floor(totalMonths / 12);
            const month = (totalMonths % 12) + 1;
            const age = currentAge + Math.floor(i / 12);

            // Record data: Start of simulation, Start of each year, and the exact achievement month.
            const isStartOfYear = month === 1;
            const isStartOfSim = i === 0;

            // Check achievement

            // Check if achieved at START (or current state)
            if (achievedMonthIndex === -1 && currentBalance >= fiNumber) {
                achievedMonthIndex = i;
                // Make sure we record this specific month
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
                // Already achieved

                // Stop if we have gone 20 years past achievement
                if ((i - achievedMonthIndex) >= 240) { // 20 years * 12 months
                    break;
                }
            }

            // Record regular data points (Yearly)
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
                    // If achieved index is set and it is <= current index, then it is achieved
                    isAchieved: achievedMonthIndex !== -1 && achievedMonthIndex <= i
                });
            }

            // Compound interest + Savings
            const investmentReturn = currentBalance * monthlyRealReturn;
            currentBalance += investmentReturn + monthlySavings;
        }

        // 3. Result formatting
        let timeToFire = { years: 0, months: 0 };
        let fireDateObj = null;

        if (achievedMonthIndex !== -1) {
            timeToFire = {
                years: Math.floor(achievedMonthIndex / 12),
                months: achievedMonthIndex % 12
            };

            // Calculate exact date
            const d = new Date();
            d.setMonth(d.getMonth() + achievedMonthIndex);
            fireDateObj = {
                year: d.getFullYear(),
                month: d.getMonth() + 1
            };
        }

        return {
            monthlySavings, // In Won
            savingsRate,
            fiNumber,       // In Won
            data: outputData, // In Won
            timeToFire,
            fireDate: fireDateObj,
            isPossible: achievedMonthIndex !== -1,
            achievedYear: fireDateObj?.year // For chart reference line
        };

    }, [monthlyIncome, monthlyExpense, currentAssets, expectedReturn, targetRetireMonthly, currentAge, withdrawalRate]);
};

