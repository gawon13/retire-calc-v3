'use client';

import { useState } from 'react';
import { Flame, Wallet, TrendingUp, RefreshCw, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { useFireCalc } from '@/hooks/useFireCalc';
import { useChartReady } from '@/hooks/useChartReady';
import { formatCurrency } from '@/utils/formatCurrency';
import AdBanner from '@/components/AdBanner'; // Import AdBanner

import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer
} from 'recharts';

// Input Field Component (Reused from Retirement Simulator logic)
interface InputFieldProps {
    label: string;
    value: number | string;
    onChange: (val: number | string) => void;
    unit: string;
    step?: number;
    min?: number;
    max?: number;
    formatBadge: (value: number | string) => string;
    readOnly?: boolean;
    highlight?: boolean;
    tooltip?: string;
    className?: string; // Add className prop for grid layout
}

const InputField = ({
    label,
    value,
    onChange,
    unit,
    step = 1,
    min = 0,
    max,
    formatBadge,
    readOnly = false,
    highlight = false,
    tooltip,
    className = "",
}: InputFieldProps) => {
    return (
        <div className={`mb-3 ${className}`}>
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5">
                    <label className={`text-xs font-semibold ${highlight ? 'text-blue-600' : 'text-slate-600'}`}>{label}</label>
                    {tooltip && (
                        <div className="group relative flex items-center justify-center">
                            <Info size={12} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full mb-2 left-0 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                                {tooltip}
                                <div className="absolute bottom-[-4px] left-3 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>
                        </div>
                    )}
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${highlight ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-slate-50'}`}>
                    {formatBadge(value)}
                </span>
            </div>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        if (readOnly) return;
                        const val = e.target.value;
                        if (val === '') {
                            onChange('');
                            return;
                        }
                        if (val.includes('.') || val === '0') {
                            onChange(val);
                            return;
                        }
                        if (val.length > 1 && val.startsWith('0')) {
                            onChange(val.replace(/^0+/, ''));
                            return;
                        }
                        onChange(val);
                    }}
                    readOnly={readOnly}
                    placeholder="0"
                    step="any"
                    min={min}
                    max={max}
                    className={`w-full px-3 py-2 pr-8 bg-slate-50 border rounded-lg text-right font-mono text-sm font-bold focus:outline-none focus:ring-2 transition-all ${readOnly
                        ? 'text-slate-500 border-slate-200 cursor-default'
                        : 'text-slate-700 border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                        } ${highlight ? 'ring-2 ring-blue-50 border-blue-200 bg-blue-50/10' : 'border-slate-200'}`}
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                    {unit}
                </span>
            </div>
        </div>
    );
};

export default function FireCalculatorClient() {

    const [chartRef, chartReady, chartW, chartH] = useChartReady();

    // Inputs
    const [currentAge, setCurrentAge] = useState<number | string>(30);
    const [withdrawalRate, setWithdrawalRate] = useState<number | string>(4.0);
    const [monthlyIncome, setMonthlyIncome] = useState<number | string>(500);
    const [monthlyExpense, setMonthlyExpense] = useState<number | string>(300);
    const [currentAssets, setCurrentAssets] = useState<number | string>(10000);
    const [expectedReturn, setExpectedReturn] = useState<number | string>(5.0);
    const [targetRetireMonthly, setTargetRetireMonthly] = useState<number | string>(300);

    // Toggle for details
    const [isTableOpen, setIsTableOpen] = useState(false);

    // Calculate
    const result = useFireCalc({
        monthlyIncome: Number(monthlyIncome),
        monthlyExpense: Number(monthlyExpense),
        currentAssets: Number(currentAssets),
        expectedReturn: Number(expectedReturn),
        targetRetireMonthly: Number(targetRetireMonthly),
        currentAge: Number(currentAge),
        withdrawalRate: Number(withdrawalRate)
    });

    // Reset
    const clearInputs = () => {
        setCurrentAge(30);
        setWithdrawalRate(4.0);
        setMonthlyIncome(500);
        setMonthlyExpense(300);
        setCurrentAssets(10000);
        setExpectedReturn(5.0);
        setTargetRetireMonthly(300);
    };

    // Formatters
    const formatMoneyBadge = (val: number | string) => formatCurrency(Number(val) * 10000);
    const formatPercentBadge = (val: number | string) => `${Number(val).toFixed(1)}%`;
    const formatAgeBadge = (val: number | string) => `${val}세`;

    // Y Axis Formatter
    const formatAxisY = (value: number) => {
        if (value === 0) return '0';

        // Dynamic unit based on max value in data
        const maxVal = Math.max(...result.data.map(d => d.assets), result.fiNumber);

        if (maxVal >= 100000000) return `${(value / 100000000).toFixed(2)}억`;
        if (maxVal >= 10000000) return `${(value / 10000000).toFixed(0)}천만`;
        return `${(value / 1000000).toFixed(0)}백만`;
    };

    // Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 rounded-lg shadow-xl text-xs min-w-[180px]">
                    <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">
                        {data.year}년 ({data.age}세) 예측
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">총 자산 (현재가치)</span>
                            <span className="font-bold text-slate-800">{formatCurrency(data.assets)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-500">목표 자산(FI)</span>
                            <span className="font-bold text-blue-500">{formatCurrency(data.fiNumber)}</span>
                        </div>
                        {data.isAchieved && (
                            <div className="mt-2 text-center font-bold text-emerald-600 bg-emerald-50 rounded py-1">
                                🎉 파이어 달성 구간
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 pt-2 pb-6">

                {/* Mobile Ad (Hidden on Desktop) */}
                <div className="lg:hidden mb-6">
                    <AdBanner />
                </div>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left Sidebar (Inputs) */}
                    <aside className="w-full lg:w-[320px] flex-none space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
                                        <Flame size={16} strokeWidth={2} className="fill-orange-500" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">파이어족 정보 입력</h3>
                                </div>
                                <button
                                    onClick={clearInputs}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    title="입력 초기화"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {/* 1. Current Age (Span 2) */}
                                <InputField
                                    label="현재 나이"
                                    value={currentAge}
                                    onChange={setCurrentAge}
                                    unit="세"
                                    step={1}
                                    formatBadge={formatAgeBadge}
                                    className="col-span-2"
                                />

                                {/* 2. Income / Expense */}
                                <InputField
                                    label="월 수입 (세후)"
                                    value={monthlyIncome}
                                    onChange={setMonthlyIncome}
                                    unit="만원"
                                    step={10}
                                    formatBadge={formatMoneyBadge}
                                />
                                <InputField
                                    label="월 지출"
                                    value={monthlyExpense}
                                    onChange={setMonthlyExpense}
                                    unit="만원"
                                    step={10}
                                    formatBadge={formatMoneyBadge}
                                />

                                {/* 3. Savings / Rate (Calculated) */}
                                <InputField
                                    label="월 저축액"
                                    value={Math.floor(result.monthlySavings / 10000)}
                                    onChange={() => { }}
                                    unit="만원"
                                    readOnly={true}
                                    highlight={true}
                                    formatBadge={(val) => '자동계산'}
                                />
                                <InputField
                                    label="저축률"
                                    value={result.savingsRate.toFixed(1)}
                                    onChange={() => { }}
                                    unit="%"
                                    readOnly={true}
                                    highlight={true}
                                    formatBadge={(val) => '비중'}
                                />

                                {/* 4. Current Assets (Span 2) */}
                                <InputField
                                    label="현재 투자 자산"
                                    value={currentAssets}
                                    onChange={setCurrentAssets}
                                    unit="만원"
                                    step={100}
                                    formatBadge={formatMoneyBadge}
                                    tooltip="현금, 주식, 부동산 등 현재 보유하고 있는 순자산을 입력하세요."
                                    className="col-span-2"
                                />

                                {/* 5. Return / Withdrawal Rate */}
                                <InputField
                                    label="기대 연 수익률"
                                    value={expectedReturn}
                                    onChange={setExpectedReturn}
                                    unit="%"
                                    step={0.1}
                                    max={100}
                                    formatBadge={formatPercentBadge}
                                    tooltip="물가상승률(2.5%)을 상회하는 투자를 가정합니다."
                                />
                                <InputField
                                    label="인출률 (4% 룰)"
                                    value={withdrawalRate}
                                    onChange={setWithdrawalRate}
                                    unit="%"
                                    step={0.1}
                                    max={100}
                                    formatBadge={formatPercentBadge}
                                    tooltip="은퇴 자산의 N%를 매년 생활비로 사용해도 자산이 고갈되지 않는다는 이론입니다."
                                />

                                {/* 6. Target Expense (Span 2) */}
                                <div className="col-span-2 pt-2 border-t border-slate-100 mt-1">
                                    <InputField
                                        label="은퇴 후 목표 월 생활비"
                                        value={targetRetireMonthly}
                                        onChange={setTargetRetireMonthly}
                                        unit="만원"
                                        step={10}
                                        formatBadge={formatMoneyBadge}
                                        highlight={true}
                                        tooltip="현재 가치 기준으로 은퇴 후에 필요한 월 생활비를 입력하세요."
                                        className="mb-0"
                                    />
                                    <div className="text-[10px] text-slate-400 text-right mt-1 px-1">
                                        * 물가상승률 2.5%가 반영된 실질가치 기준
                                    </div>
                                </div>
                            </div>
                        </div>


                    </aside>

                    {/* Right Main Content */}
                    <main className="flex-1 min-w-0 space-y-4">

                        {/* Hero Summary */}
                        <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <Flame size={120} />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-lg md:text-2xl font-bold leading-relaxed">
                                    당신의 파이어 달성 시기 <br className="md:hidden" />
                                    {result.isPossible && result.fireDate ? (
                                        <span className="text-orange-400">
                                            {result.fireDate.year}년 ({result.fireDate.month}월)
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">계산 불가</span>
                                    )}
                                </h2>
                                <p className="text-slate-400 text-sm mt-2">
                                    {result.isPossible ? (
                                        <>
                                            현재로부터 <span className="text-white font-bold">{result.timeToFire.years}년 {result.timeToFire.months}개월</span> 뒤, 경제적 자유를 달성할 수 있습니다.
                                        </>
                                    ) : (
                                        "현재 조건으로는 목표 자산 달성이 어렵습니다. 저축액이나 수익률을 높여보세요."
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="text-blue-600" size={16} />
                                    <h3 className="font-bold text-sm text-slate-800">자산 성장 및 파이어 달성 예측</h3>
                                </div>

                                {/* FI Number Display with Tooltip */}
                                <div className="flex bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 items-center gap-2">
                                    <span className="text-xs text-slate-500 font-bold">목표 자산(FI Number)</span>
                                    <span className="text-sm font-bold text-slate-800">{formatCurrency(result.fiNumber)}</span>
                                </div>
                            </div>

                            <div ref={chartRef} className="w-full h-[300px] lg:h-[400px]">
                                {chartReady ? (
                                    <ComposedChart width={chartW} height={chartH} data={result.data} margin={{ top: 10, right: 30, bottom: 0, left: -10 }}>
                                        <defs>
                                            <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="year"
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            tickLine={false}
                                            axisLine={false}
                                            minTickGap={30}
                                        />
                                        <YAxis
                                            tickFormatter={formatAxisY}
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            width={55}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="assets"
                                            stroke="#2563eb"
                                            strokeWidth={2}
                                            fill="url(#colorAssets)"
                                            activeDot={{ r: 6 }}
                                        />
                                        <ReferenceLine
                                            y={result.fiNumber}
                                            stroke="#f59e0b"
                                            strokeDasharray="3 3"
                                            label={{
                                                value: 'FI 목표선',
                                                position: 'insideTopRight',
                                                fill: '#d97706',
                                                fontSize: 10,
                                                fontWeight: 'bold'
                                            }}
                                        />
                                        {result.achievedYear && (
                                            <ReferenceLine
                                                x={result.achievedYear}
                                                stroke="#f97316"
                                                strokeWidth={2}
                                                label={{
                                                    value: '파이어 달성',
                                                    position: 'insideTopLeft',
                                                    fill: '#f97316',
                                                    fontSize: 12,
                                                    fontWeight: 'bold',
                                                    dy: -10
                                                }}
                                            />
                                        )}
                                    </ComposedChart>
                                ) : (
                                    <div className="w-full h-full bg-slate-50 rounded-lg animate-pulse" />
                                )}
                            </div>
                        </div>

                        {/* Detail Table Toggle */}
                        <div className="border-t border-slate-200 pt-4">
                            <button
                                onClick={() => setIsTableOpen(!isTableOpen)}
                                className="flex items-center justify-between w-full p-3 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Wallet size={16} className="text-slate-400" />
                                    연도별 자산 변화 [상세보기]
                                </span>
                                {isTableOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {isTableOpen && (
                                <div className="mt-2 overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm max-h-[500px]">
                                    <table className="w-full text-xs text-center relative">
                                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0 z-10">
                                            <tr>
                                                <th className="p-3 whitespace-nowrap">연도</th>
                                                <th className="p-3 whitespace-nowrap hidden sm:table-cell">나이(추정)</th>
                                                <th className="p-3 whitespace-nowrap text-right">예상 자산(실질)</th>
                                                <th className="p-3 whitespace-nowrap text-right">달성률</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {result.data.map((row) => {
                                                const progress = Math.min(100, (row.assets / result.fiNumber) * 100);
                                                return (
                                                    <tr key={`${row.year}-${row.month}`} className={`hover:bg-slate-50 ${row.isAchieved ? 'bg-orange-50/30' : ''}`}>
                                                        <td className="p-3 font-medium text-slate-600">
                                                            {row.year}년
                                                            {row.isAchieved && row.month !== 1 && <span className="text-xs text-orange-500 ml-1">({row.month}월)</span>}
                                                        </td>
                                                        <td className="p-3 text-slate-400 hidden sm:table-cell">{row.age}세</td>
                                                        <td className="p-3 text-right font-mono font-bold text-slate-700">{formatCurrency(row.assets)}</td>
                                                        <td className="p-3 text-right font-mono">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className={progress >= 100 ? 'text-orange-500 font-bold' : 'text-slate-500'}>
                                                                    {progress.toFixed(1)}%
                                                                </span>
                                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${progress >= 100 ? 'bg-orange-400' : 'bg-blue-400'}`}
                                                                        style={{ width: `${progress}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
