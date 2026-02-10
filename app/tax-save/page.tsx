'use client';

import { useState } from 'react';
import { PiggyBank, RefreshCw, Wallet, TrendingUp } from 'lucide-react';
import { useTaxCalc } from '@/hooks/useTaxCalc';
import { useChartReady } from '@/hooks/useChartReady';
import { formatCurrency } from '@/utils/formatCurrency';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

interface InputFieldProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    unit: string;
    step?: number;
    min?: number;
    max?: number;
    formatBadge: (value: number) => string;
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
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    step={step}
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

export default function TaxSavingSimulator() {

    const [chartRef, chartReady, chartW, chartH] = useChartReady();

    // 입력 상태
    const [initialAmount, setInitialAmount] = useState(1000); // 만원
    const [monthlyAmount, setMonthlyAmount] = useState(100);  // 만원
    const [years, setYears] = useState(10);                   // 년
    const [rate, setRate] = useState(5.0);                    // %

    // 세금 설정 (일반 15.4%, 절세 0% - ISA/비과세 가정)
    const [taxRateGeneral, setTaxRateGeneral] = useState(15.4);
    const [taxRateSaving, setTaxRateSaving] = useState(0);

    // 계산 로직 실행
    const result = useTaxCalc({
        initialAmount,
        monthlyAmount,
        years,
        rate,
        taxRateGeneral, // 15.4%
        taxRateSaving,  // 0% (비과세)
    });

    // 배지 포맷팅
    const formatMoneyBadge = (val: number) => formatCurrency(val * 10000);
    const formatYearBadge = (val: number) => `${val}년 후`;
    const formatRateBadge = (val: number) => `연 ${val}%`;
    const formatTaxBadge = (val: number) => `${val}%`;

    // 축 포맷팅
    const formatAxisY = (value: number) => {
        if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
        if (value >= 10000) return `${Math.floor(value / 10000)}만`;
        return `${value}`;
    };

    // 차트 툴팁
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 rounded-lg shadow-xl text-xs min-w-[180px]">
                    <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">
                        {label}년차 세후 자산 비교
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-blue-600">절세 계좌</span>
                            <span className="font-bold text-blue-600">{formatCurrency(data.amountSaving)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">일반 계좌</span>
                            <span className="font-bold text-slate-500">{formatCurrency(data.amountGeneral)}</span>
                        </div>
                        <div className="border-t border-slate-100 my-1" />
                        <div className="flex justify-between items-center">
                            <span className="text-emerald-600 font-bold">절세 효과</span>
                            <span className="font-bold text-emerald-600">
                                +{formatCurrency(data.amountSaving - data.amountGeneral)}
                            </span>
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
        setTaxRateGeneral(15.4);
        setTaxRateSaving(0);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6">
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
                            <div className="grid grid-cols-2 gap-2 gap-y-4"> {/* gap-y-8 대신 gap-y-4 사용 (입력 필드 간격) */}
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
                                <InputField
                                    label="일반 세율"
                                    value={taxRateGeneral}
                                    onChange={setTaxRateGeneral}
                                    unit="%"
                                    step={0.1}
                                    max={100}
                                    formatBadge={formatTaxBadge}
                                />
                                <InputField
                                    label="절세 세율"
                                    value={taxRateSaving}
                                    onChange={setTaxRateSaving}
                                    unit="%"
                                    step={0.1}
                                    max={100}
                                    formatBadge={formatTaxBadge}
                                />
                            </div>
                        </div>

                        {/* 데스크탑 광고 (lg 이상) */}

                    </aside>

                    {/* ========== 우측 출력 패널 ========== */}
                    <main className="flex-1 min-w-0 space-y-4">
                        {/* 결과 대시보드 (은퇴/복리 시뮬레이터와 스타일 통일) */}
                        <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 text-white">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold">절세로 아낀 금액</span>
                                    <span className="text-xl font-bold text-emerald-400">
                                        +{formatCurrency(result.totalTaxSaved)}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-slate-700 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold">비과세 총액</span>
                                    <span className="text-xl font-bold text-blue-400">
                                        {formatCurrency(result.totalSaving)}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-slate-700 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold">일반 총액</span>
                                    <span className="text-xl font-bold text-slate-300">
                                        {formatCurrency(result.totalGeneral)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 차트 섹션 */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" size={16} />
                                <h3 className="font-bold text-sm text-slate-800">세금에 따른 자산 격차 (일반 vs 절세)</h3>
                            </div>

                            <div ref={chartRef} className="w-full h-[300px] lg:h-[400px]">
                                {chartReady ? (
                                        <AreaChart width={chartW} height={chartH} data={result.yearlyData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                                            <defs>
                                                <linearGradient id="colorGeneral" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1} />
                                                </linearGradient>
                                                <linearGradient id="colorSaving" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
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
                                                width={40}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                                            {/* 1. 절세 계좌 (파란색) - 더 높으므로 뒤에 배치 */}
                                            <Area
                                                type="monotone"
                                                dataKey="amountSaving"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fill="url(#colorSaving)"
                                                name="절세 계좌 (세후)"
                                            />

                                            {/* 2. 일반 계좌 (회색) - 더 낮으므로 앞에 배치 */}
                                            <Area
                                                type="monotone"
                                                dataKey="amountGeneral"
                                                stroke="#94a3b8"
                                                strokeWidth={2}
                                                fill="url(#colorGeneral)"
                                                name="일반 계좌 (세후)"
                                            />
                                        </AreaChart>
                                ) : (
                                    <div className="w-full h-full bg-slate-50 rounded-lg animate-pulse" />
                                )}
                            </div>
                        </div>

                        {/* 상세 테이블 */}
                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex items-center justify-between w-full p-3 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-700 mb-2">
                                <span>[참고] 연도별 세후 자산 비교</span>
                            </div>

                            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                                <table className="w-full text-xs text-slate-600 text-center">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-2 whitespace-nowrap">경과(년)</th>
                                            <th className="p-2 whitespace-nowrap text-slate-500">원금</th>
                                            <th className="p-2 whitespace-nowrap text-slate-400">일반(세후)</th>
                                            <th className="p-2 whitespace-nowrap text-blue-500">절세(세후)</th>
                                            <th className="p-2 whitespace-nowrap text-emerald-600">절세 효과</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {result.yearlyData.map((row) => (
                                            <tr key={row.year} className="hover:bg-slate-50">
                                                <td className="p-2 font-bold">{row.year}년</td>
                                                <td className="p-2">{formatCurrency(row.principal)}</td>
                                                <td className="p-2 text-slate-400">
                                                    {formatCurrency(row.amountGeneral)}
                                                </td>
                                                <td className="p-2 font-bold text-blue-500">
                                                    {formatCurrency(row.amountSaving)}
                                                </td>
                                                <td className="p-2 font-bold text-emerald-600">
                                                    +{formatCurrency(row.amountSaving - row.amountGeneral)}
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
