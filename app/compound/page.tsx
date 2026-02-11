'use client';

import { useState } from 'react';
import { TrendingUp, UserPlus, Wallet, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useCompoundCalc } from '@/hooks/useCompoundCalc';
import { useChartReady } from '@/hooks/useChartReady';
import { formatCurrency } from '@/utils/formatCurrency';

import {
    AreaChart,
    ComposedChart,
    Area,
    Line,
    Legend,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

// 입력 필드 컴포넌트 (Page.tsx와 동일한 디자인 유지)
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



export default function CompoundCalculator() {

    const [chartRef, chartReady, chartW, chartH] = useChartReady();

    // 입력 상태
    const [initialAmount, setInitialAmount] = useState<number | string>(1000); // 만원
    const [monthlyAmount, setMonthlyAmount] = useState<number | string>(100);  // 만원
    const [years, setYears] = useState<number | string>(10);                   // 년
    const [rate, setRate] = useState<number | string>(5.0);                    // %

    const [isTableOpen, setIsTableOpen] = useState(false);

    // 계산 로직 실행
    const result = useCompoundCalc({
        initialAmount: Number(initialAmount),
        monthlyAmount: Number(monthlyAmount),
        years: Number(years),
        rate: Number(rate),
    });

    // InputField에 전달할 래퍼 함수들
    const formatMoneyBadge = (val: number | string) => formatCurrency(Number(val) * 10000);
    const formatYearBadge = (val: number | string) => `${val}년 후`;
    const formatRateBadge = (val: number | string) => `연 ${val}%`;

    // 축 포맷팅 (동적 단위)
    const formatAxisY = (value: number) => {
        if (value === 0) return '0';

        // 데이터의 최대값 확인 (동적 단위를 위해)
        const maxBalance = Math.max(...result.yearlyData.map(d => d.amount));

        // 1억 이상 -> 억 단위
        if (maxBalance >= 100000000) {
            return `${(value / 100000000).toFixed(2)}억`;
        }
        // 1천만원 이상 -> 천만 단위
        if (maxBalance >= 10000000) {
            return `${(value / 10000000).toFixed(0)}천만`;
        }
        // 그 외 -> 백만 단위
        return `${(value / 1000000).toFixed(0)}백만`;
    };

    // 차트 툴팁
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 rounded-lg shadow-xl text-xs min-w-[180px]">
                    <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">
                        {label}년차 자산 현황
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">총 자산</span>
                            <span className="font-bold text-slate-800">{formatCurrency(data.amount)}</span>
                        </div>
                        <div className="border-t border-slate-100 my-1" />
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">원금 합계</span>
                            <span className="font-bold text-slate-600">{formatCurrency(data.principal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-600">이자 수익</span>
                            <span className="font-bold text-blue-600">{formatCurrency(data.interest)}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };
    // 초기화
    const clearInputs = () => {
        setInitialAmount(1000);
        setMonthlyAmount(100);
        setYears(10);
        setRate(5.0);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 pt-2 pb-6">
                {/* 모바일 광고 (lg 미만) */}


                {/* 좌우 레이아웃 */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ========== 좌측 입력 패널 (320px 고정) ========== */}
                    <aside className="w-full lg:w-[320px] flex-none space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                                        <Wallet size={16} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">투자 정보</h3>
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
                                <InputField
                                    label="초기 투자금"
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
                                    step={10}
                                    formatBadge={formatMoneyBadge}
                                />
                                <InputField
                                    label="투자 기간"
                                    value={years}
                                    onChange={setYears}
                                    unit="년"
                                    max={100}
                                    formatBadge={formatYearBadge}
                                />
                                <InputField
                                    label="연 수익률"
                                    value={rate}
                                    onChange={setRate}
                                    unit="%"
                                    step={0.1}
                                    max={100}
                                    formatBadge={formatRateBadge}
                                />
                            </div>
                        </div>

                        {/* 데스크탑 광고 (lg 이상) */}

                    </aside>

                    {/* ========== 우측 출력 패널 ========== */}
                    <main className="flex-1 min-w-0 space-y-4">
                        {/* 결과 대시보드 (은퇴 시뮬레이터 스타일 통일) */}
                        <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 text-white">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold">최종 수령액</span>
                                    <span className="text-xl font-bold text-emerald-400">
                                        {formatCurrency(result.totalAmount)}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-slate-700 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold">총 이자</span>
                                    <span className="text-xl font-bold text-orange-400">
                                        +{formatCurrency(result.totalInterest)}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-slate-700 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold">원금</span>
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
                                <h3 className="font-bold text-sm text-slate-800">자산 성장 그래프 (단리 vs 복리)</h3>
                            </div>

                            <div ref={chartRef} className="w-full h-[300px] lg:h-[400px]">
                                {chartReady ? (
                                    <ComposedChart width={chartW} height={chartH} data={result.yearlyData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                                        <defs>
                                            <linearGradient id="colorSimple" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="colorCompound" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="year"
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `${val}년`}
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

                                        {/* 1. 복리 (전체 영역 - 주황색) */}
                                        {/* 가장 뒤에 그려져야 하므로 먼저 선언 (fill이 덮이지 않게 하려면 순서 중요) */}
                                        {/* SVG layer 순서: 먼저 그린게 아래. */}
                                        {/* 복리(큰 영역)를 먼저 그리고, 단리(작은 영역)를 그 위에 그리면 -> 단리 영역이 복리 위를 덮음. */}
                                        {/* 그러면 단리 부분은 파란색, 그 위로 튀어나온 복리 부분만 주황색이 됨. 시각적으로 좋음. */}

                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#f97316"
                                            strokeWidth={2}
                                            fill="url(#colorCompound)"
                                            name="복리 (원금+이자)"
                                        />

                                        {/* 2. 단리 (부분 영역 - 파란색) */}
                                        <Area
                                            type="monotone"
                                            dataKey="simpleAmount"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="url(#colorSimple)"
                                            name="단리 (원금+이자)"
                                        />
                                    </ComposedChart>
                                ) : (
                                    <div className="w-full h-full bg-slate-50 rounded-lg animate-pulse" />
                                )}
                            </div>
                        </div>

                        {/* 상세 테이블 */}
                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex items-center justify-between w-full p-3 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-700 mb-2">
                                <span>[참고] 연 간 단리 복리 총액 비교</span>
                            </div>

                            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                                <table className="w-full text-xs text-slate-600 text-center">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-2 whitespace-nowrap">경과(년)</th>
                                            <th className="p-2 whitespace-nowrap text-slate-500">원금</th>
                                            <th className="p-2 whitespace-nowrap text-blue-400">단리 총액</th>
                                            <th className="p-2 whitespace-nowrap text-rose-500">복리 총액</th>
                                            <th className="p-2 whitespace-nowrap text-emerald-600">복리 효과 (+차액)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {result.yearlyData.map((row) => (
                                            <tr key={row.year} className="hover:bg-slate-50">
                                                <td className="p-2 font-bold">{row.year}년</td>
                                                <td className="p-2">{formatCurrency(row.principal)}</td>
                                                <td className="p-2 text-blue-400">{formatCurrency(row.simpleAmount)}</td>
                                                <td className="p-2 font-bold text-rose-500">{formatCurrency(row.amount)}</td>
                                                <td className="p-2 font-bold text-emerald-600">
                                                    +{formatCurrency(row.amount - row.simpleAmount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
