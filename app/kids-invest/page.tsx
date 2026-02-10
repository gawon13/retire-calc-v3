'use client';

import { useState } from 'react';
import { Baby, Wallet, TrendingUp, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useKidsCalc } from '@/hooks/useKidsCalc';
import { useChartReady } from '@/hooks/useChartReady';
import { formatCurrency } from '@/utils/formatCurrency';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    Label,
    Legend
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



export default function KidsInvestmentSimulator() {

    const [chartRef, chartReady, chartW, chartH] = useChartReady();

    // 입력 상태
    const [currentAge, setCurrentAge] = useState<number | string>(0);    // 현재 나이 (0세)
    const [targetAge, setTargetAge] = useState<number | string>(20);     // 목표 나이 (성인)
    const [initialAmount, setInitialAmount] = useState<number | string>(2000); // 증여세 면제 한도 (2천만원)
    const [monthlyAmount, setMonthlyAmount] = useState<number | string>(10);   // 월 10만원
    const [rate, setRate] = useState<number | string>(8.0);              // 연 8% (장기 투자 가정)

    // 상세 보기 토글
    const [showDetail, setShowDetail] = useState(false);

    // 계산 로직 실행
    const result = useKidsCalc({
        currentAge: Number(currentAge),
        targetAge: Number(targetAge),
        initialAmount: Number(initialAmount),
        monthlyAmount: Number(monthlyAmount),
        rate: Number(rate),
    });

    // 배지 포맷팅
    const formatMoneyBadge = (val: number | string) => formatCurrency(Number(val) * 10000);
    const formatAgeBadge = (val: number | string) => `${val}세`;
    const formatRateBadge = (val: number | string) => `연 ${val}%`;

    // 축 포맷팅 (동적 단위)
    const formatAxisY = (value: number) => {
        if (value === 0) return '0';

        // 1억 이상 -> 억 단위
        if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
        // 1천만원 이상 -> 천만 단위
        if (value >= 10000000) return `${(value / 10000000).toFixed(0)}천만`;
        // 그 외 -> 백만 단위
        return `${(value / 1000000).toFixed(0)}백만`;
    };

    // 차트 툴팁
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 rounded-lg shadow-xl text-xs min-w-[200px]">
                    <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">
                        자녀 나이 {data.age}세 (세후 예상)
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-blue-600 font-bold">
                            <span>미국 직투 (22% 과세)</span>
                            <span>{formatCurrency(data.afterTaxUS)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 text-right -mt-1 mb-1">
                            *매년 250만원 공제 가정
                        </div>
                        <div className="flex justify-between items-center text-purple-600 font-bold">
                            <span>연금저축 (16.5% 과세)</span>
                            <span>{formatCurrency(data.afterTaxPension)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 text-right -mt-1">
                            *기타소득세(16.5%) 적용 시
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // 초기화
    const clearInputs = () => {
        setCurrentAge(0);
        setTargetAge(20);
        setInitialAmount(2000);
        setMonthlyAmount(10);
        setRate(8.0);
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
                                    <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
                                        <Baby size={16} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">자녀 투자 정보</h3>
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
                                    label="자녀 나이"
                                    value={currentAge}
                                    onChange={setCurrentAge}
                                    unit="세"
                                    min={0}
                                    max={30}
                                    formatBadge={formatAgeBadge}
                                />
                                <InputField
                                    label="목표 나이"
                                    value={targetAge}
                                    onChange={setTargetAge}
                                    unit="세"
                                    min={Number(currentAge) + 1}
                                    max={100}
                                    formatBadge={formatAgeBadge}
                                />
                                <InputField
                                    label="초기 증여액"
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
                                <div className="col-span-2">
                                    <InputField
                                        label="예상 수익률"
                                        value={rate}
                                        onChange={setRate}
                                        unit="%"
                                        step={0.5}
                                        max={50}
                                        formatBadge={formatRateBadge}
                                    />
                                </div>
                            </div>

                            {/* 증여세 알림 */}
                            <div className={`mt-4 p-3 rounded-lg text-xs leading-5 flex gap-2 ${result.isGiftLimitExceeded ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                <Wallet size={14} className="flex-shrink-0 mt-0.5" />
                                <span>{result.giftLimitMessage}</span>
                            </div>
                        </div>

                        {/* 데스크탑 광고 (lg 이상) */}

                    </aside>

                    {/* ========== 우측 출력 패널 ========== */}
                    <main className="flex-1 min-w-0 space-y-4">
                        {/* 결과 대시보드 */}
                        <div className="bg-slate-900 rounded-xl p-5 shadow-lg border border-slate-800 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Baby size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="mb-4">
                                    <p className="text-slate-400 text-xs font-bold mb-1">
                                        자녀가 <span className="text-white">{targetAge}세</span>가 되었을 때의 세후 수령액 비교
                                    </p>
                                    <div className="text-sm font-bold">
                                        {result.finalAfterTaxUS > result.finalAfterTaxPension ? (
                                            <span className="text-blue-400 flex items-center gap-1">
                                                <ChevronUp size={14} /> 미국 직투 유리 (+{formatCurrency(result.finalAfterTaxUS - result.finalAfterTaxPension)})
                                            </span>
                                        ) : (
                                            <span className="text-purple-400 flex items-center gap-1">
                                                <ChevronUp size={14} /> 연금저축 유리 (+{formatCurrency(result.finalAfterTaxPension - result.finalAfterTaxUS)})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                        <div className="text-xs text-slate-400 font-bold mb-1">미국 직투 (매년 250만 공제)</div>
                                        <div className="text-xl lg:text-3xl font-black text-white tracking-tight">
                                            {formatCurrency(result.finalAfterTaxUS)}
                                        </div>
                                        <div className="text-xs font-medium text-amber-300 mt-1 opacity-80">
                                            세금: {formatCurrency(result.finalAmount - result.finalAfterTaxUS)}
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                        <div className="text-xs text-slate-400 font-bold mb-1">연금저축 (기타소득세 16.5%)</div>
                                        <div className="text-xl lg:text-3xl font-black text-white tracking-tight">
                                            {formatCurrency(result.finalAfterTaxPension)}
                                        </div>
                                        <div className="text-xs font-medium text-amber-300 mt-1 opacity-80">
                                            세금: {formatCurrency(result.finalAmount - result.finalAfterTaxPension)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 차트 섹션 */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="text-blue-500" size={16} />
                                    <h3 className="font-bold text-sm text-slate-800">투자 방식별 세후 자산 성장 비교</h3>
                                </div>
                                <div className="text-xs text-slate-400 hidden sm:block">
                                    *실선: 미국 직투 / 점선: 연금저축
                                </div>
                            </div>

                            <div ref={chartRef} className="w-full h-[300px] lg:h-[400px]">
                                {chartReady ? (
                                    <LineChart
                                        width={chartW} height={chartH}
                                        data={result.yearlyData}
                                        margin={{ top: 20, right: 30, bottom: 0, left: 10 }}
                                    >
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
                                        <Line
                                            type="monotone"
                                            dataKey="afterTaxUS"
                                            stroke="#2563eb"
                                            strokeWidth={2}
                                            dot={false}
                                            name="미국 직투 (세후)"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="afterTaxPension"
                                            stroke="#9333ea"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="연금저축 (세후)"
                                        />
                                        {/* 주요 이벤트 마커 */}
                                        {Number(currentAge) < 20 && Number(targetAge) >= 20 && (
                                            <ReferenceLine
                                                x={20}
                                                stroke="#94a3b8"
                                                strokeDasharray="3 3"
                                                label={{
                                                    value: '성인(20세)',
                                                    position: 'insideTopLeft',
                                                    fill: '#64748b',
                                                    fontSize: 10,
                                                }}
                                            />
                                        )}
                                        {Number(currentAge) < 30 && Number(targetAge) >= 30 && (
                                            <ReferenceLine
                                                x={30}
                                                stroke="#94a3b8"
                                                strokeDasharray="3 3"
                                                label={{
                                                    value: '독립(30세)',
                                                    position: 'insideTopLeft',
                                                    fill: '#64748b',
                                                    fontSize: 10,
                                                }}
                                            />
                                        )}
                                    </LineChart>
                                ) : (
                                    <div className="w-full h-full bg-slate-50 rounded-lg animate-pulse" />
                                )}
                            </div>
                        </div>

                        {/* 상세 보기 토글 영역 */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setShowDetail(!showDetail)}
                                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-bold text-slate-700"
                            >
                                <span className="flex items-center gap-2">
                                    <RefreshCw size={14} className="text-slate-400" />
                                    연령별 자산 비교 상세보기
                                </span>
                                {showDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {showDetail && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-right border-t border-slate-100">
                                        <thead className="bg-slate-50 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-3 text-center w-[15%]">나이</th>
                                                <th className="px-4 py-3 text-blue-600 w-[30%]">미국 직투 (세후)</th>
                                                <th className="px-4 py-3 text-purple-600 w-[30%]">연금저축 (세후)</th>
                                                <th className="px-4 py-3 text-slate-700 w-[25%]">차이</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {result.yearlyData.map((data) => {
                                                const diff = data.afterTaxUS - data.afterTaxPension;
                                                const isUSBetter = diff > 0;
                                                const diffColor = isUSBetter ? 'text-blue-600' : 'text-purple-600';

                                                return (
                                                    <tr key={data.age} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3 text-center font-medium text-slate-600">{data.age}세</td>
                                                        <td className="px-4 py-3 font-mono text-slate-700">{formatCurrency(data.afterTaxUS)}</td>
                                                        <td className="px-4 py-3 font-mono text-slate-700">{formatCurrency(data.afterTaxPension)}</td>
                                                        <td className={`px-4 py-3 font-mono font-bold ${diffColor}`}>
                                                            {formatCurrency(Math.abs(diff))}
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
                </div >
            </div >
        </div >
    );
}
