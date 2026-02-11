'use client';

import { useState } from 'react';
import { Baby, Wallet, TrendingUp, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useKidsCalc } from '@/hooks/useKidsCalc';
import { useChartReady } from '@/hooks/useChartReady';
import { formatCurrency } from '@/utils/formatCurrency';

import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

interface InputFieldProps {
    label: string;
    value: number | string;
    onChange: (val: number | string) => void;
    unit: string;
    step?: number;
    min?: number;
    max?: number;
    formatBadge: (value: number | string) => string;
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
}: InputFieldProps) => {
    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600">{label}</label>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-slate-400 bg-slate-50">
                    {formatBadge(value)}
                </span>
            </div>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                            onChange('');
                            return;
                        }
                        // 소수점이 있거나 '0.'으로 시작하는 경우는 그대로 허용
                        if (val.includes('.') || val === '0') {
                            onChange(val);
                            return;
                        }
                        // 그 외의 경우 (정수 입력 등) Leading zero 제거
                        if (val.length > 1 && val.startsWith('0')) {
                            onChange(val.replace(/^0+/, ''));
                            return;
                        }
                        onChange(val);
                    }}
                    placeholder="0"
                    step="any"
                    min={min}
                    max={max}
                    className="w-full px-3 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                    {unit}
                </span>
            </div>
        </div>
    );
};


export default function KidsInvestmentSimulatorClient() {

    const [chartRef, chartReady, chartW, chartH] = useChartReady();

    // 입력 상태
    const [ageNow, setAgeNow] = useState<number | string>(0);                  // 현재 나이
    const [ageTarget, setAgeTarget] = useState<number | string>(20);           // 목표 나이 (독립/성인)
    const [initialAmount, setInitialAmount] = useState<number | string>(2000); // 초기 증여 (만원) - 2천만원 비과세 한도 고려
    const [monthlyAmount, setMonthlyAmount] = useState<number | string>(10);   // 월 적립 (만원)
    const [rate, setRate] = useState<number | string>(5.0);                    // 수익률 (%)

    const [isTableOpen, setIsTableOpen] = useState(false);

    // 계산 로직
    const result = useKidsCalc({
        currentAge: Number(ageNow),
        targetAge: Number(ageTarget),
        initialAmount: Number(initialAmount),
        monthlyAmount: Number(monthlyAmount),
        rate: Number(rate),
    });

    // 배지 포맷팅
    const formatMoneyBadge = (val: number | string) => formatCurrency(Number(val) * 10000);
    const formatAgeBadge = (val: number | string) => `${val}세`;
    const formatRateBadge = (val: number | string) => `연 ${val}%`;

    // 축 포맷팅
    const formatAxisY = (value: number) => {
        if (value === 0) return '0';
        const maxBalance = Math.max(...result.yearlyData.map(d => d.amount));
        if (maxBalance >= 100000000) return `${(value / 100000000).toFixed(2)}억`;
        if (maxBalance >= 10000000) return `${(value / 10000000).toFixed(0)}천만`;
        return `${(value / 1000000).toFixed(0)}백만`;
    };

    // 툴팁
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 rounded-lg shadow-xl text-xs min-w-[180px]">
                    <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">
                        {data.age}세 자산 현황
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-bold">총 자산</span>
                            <span className="font-bold text-slate-800">{formatCurrency(data.amount)}</span>
                        </div>
                        <div className="border-t border-slate-100 my-1" />
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">원금(증여+적립)</span>
                            <span className="font-bold text-slate-500">{formatCurrency(data.principal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-500">이자 수익</span>
                            <span className="font-bold text-blue-500">{formatCurrency(data.totalInterest)}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // 초기화
    const clearInputs = () => {
        setAgeNow(0);
        setAgeTarget(20);
        setInitialAmount(2000);
        setMonthlyAmount(10);
        setRate(5.0);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 pt-2 pb-6">



                {/* 모바일 광고 (lg 미만) */}


                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ========== 좌측 입력 패널 ========== */}
                    <aside className="w-full lg:w-[320px] flex-none space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                                        <Baby size={16} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">자녀 및 투자 정보</h3>
                                </div>
                                <button
                                    onClick={clearInputs}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    title="입력 초기화"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 gap-y-4">
                                <InputField
                                    label="현재 나이"
                                    value={ageNow}
                                    onChange={setAgeNow}
                                    unit="세"
                                    formatBadge={formatAgeBadge}
                                />
                                <InputField
                                    label="목표 나이"
                                    value={ageTarget}
                                    onChange={setAgeTarget}
                                    unit="세"
                                    min={Number(ageNow) + 1}
                                    formatBadge={formatAgeBadge}
                                />
                                <InputField
                                    label="초기 증여"
                                    value={initialAmount}
                                    onChange={setInitialAmount}
                                    unit="만원"
                                    step={100}
                                    formatBadge={formatMoneyBadge}
                                />
                                <InputField
                                    label="월 적립액"
                                    value={monthlyAmount}
                                    onChange={setMonthlyAmount}
                                    unit="만원"
                                    step={5}
                                    formatBadge={formatMoneyBadge}
                                />
                                <InputField
                                    label="연 수익률"
                                    value={rate}
                                    onChange={setRate}
                                    unit="%"
                                    step={0.1}
                                    max={50}
                                    formatBadge={formatRateBadge}
                                />
                            </div>
                        </div>

                        {/* 데스크탑 광고 (lg 이상) */}

                    </aside>

                    {/* ========== 우측 출력 패널 ========== */}
                    <main className="flex-1 min-w-0 space-y-4">
                        {/* 결과 대시보드 */}
                        <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 text-white">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold">
                                        {ageTarget}세 예상 자산
                                    </span>
                                    <span className="text-xl font-bold text-emerald-400">
                                        {formatCurrency(result.finalAmount)}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-slate-700 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold">총 수익(이자)</span>
                                    <span className="text-xl font-bold text-blue-400">
                                        +{formatCurrency(result.totalInterest)}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-slate-700 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold">원금 합계</span>
                                    <span className="text-xl font-bold text-slate-300">
                                        {formatCurrency(result.totalPrincipal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 차트 섹션 */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" size={16} />
                                <h3 className="font-bold text-sm text-slate-800">자산을 운용(복리) vs 원금 비교</h3>
                            </div>

                            <div ref={chartRef} className="w-full h-[300px] lg:h-[400px]">
                                {chartReady ? (
                                    <ComposedChart width={chartW} height={chartH} data={result.yearlyData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                                        <defs>
                                            <linearGradient id="colorPrincipalKids" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="colorCompoundKids" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="age"
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `${val}세`}
                                        />
                                        <YAxis
                                            tickFormatter={formatAxisY}
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            width={55}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                                        {/* 복리 (보라색) - 뒤에 배치 */}
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#8b5cf6"
                                            strokeWidth={2}
                                            fill="url(#colorCompoundKids)"
                                            name="예상 자산 (복리)"
                                        />

                                        {/* 원금 (회색) - 앞에 배치 */}
                                        <Area
                                            type="monotone"
                                            dataKey="principal"
                                            stroke="#94a3b8"
                                            strokeWidth={2}
                                            fill="url(#colorPrincipalKids)"
                                            name="투자 원금"
                                        />
                                    </ComposedChart>
                                ) : (
                                    <div className="w-full h-full bg-slate-50 rounded-lg animate-pulse" />
                                )}
                            </div>
                        </div>

                        {/* 상세 테이블 */}
                        <div className="border-t border-slate-200 pt-4">
                            <button
                                onClick={() => setIsTableOpen(!isTableOpen)}
                                className="flex items-center justify-between w-full p-3 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <span>연도별 상세 자산 현황 [펼치기]</span>
                                {isTableOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {isTableOpen && (
                                <div className="mt-2 overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <table className="w-full text-xs text-slate-600 text-center">
                                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="p-2 whitespace-nowrap">나이 (경과)</th>
                                                <th className="p-2 whitespace-nowrap text-slate-500">원금</th>
                                                <th className="p-2 whitespace-nowrap text-blue-500">이자수익</th>
                                                <th className="p-2 whitespace-nowrap text-purple-600">총 자산</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {result.yearlyData.map((row) => (
                                                <tr key={row.age} className="hover:bg-slate-50">
                                                    <td className="p-2 font-bold">{row.age}세</td>
                                                    <td className="p-2 text-slate-500">{formatCurrency(row.principal)}</td>
                                                    <td className="p-2 text-blue-500">+{formatCurrency(row.totalInterest)}</td>
                                                    <td className="p-2 font-bold text-purple-600">{formatCurrency(row.amount)}</td>
                                                </tr>
                                            ))}
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
