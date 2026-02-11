'use client';

import { useState } from 'react';
import { TrendingUp, UserPlus, Wallet, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useRetirement } from '@/hooks/useRetirement';
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
    ReferenceLine,
} from 'recharts';


// 입력 필드 컴포넌트 - 외부로 분리하여 포커스 이탈 버그 수정
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
                {/* 배지 톤 연하게 조정 */}
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
                        // 예: "05" -> "5", "0100" -> "100"
                        // 단, "0" 그 자체는 위에서 처리됨.
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
                {/* 단위를 우측에 최대한 밀착 */}
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                    {unit}
                </span>
            </div>
        </div>
    );
};

export default function RetirementSimulator() {

    const [chartRef, chartReady, chartW, chartH] = useChartReady();

    // 기본 정보
    const [ageNow, setAgeNow] = useState<number | string>(35);
    const [ageRetire, setAgeRetire] = useState<number | string>(55);
    const [targetMonthly, setTargetMonthly] = useState<number | string>(200);
    const [monthlyInvest, setMonthlyInvest] = useState<number | string>(150);

    // 자산 정보
    const [assetSafe, setAssetSafe] = useState<number | string>(1000);
    const [assetInvest, setAssetInvest] = useState<number | string>(1000);
    const [rateSafe, setRateSafe] = useState<number | string>(2.0);
    const [rateInvest, setRateInvest] = useState<number | string>(5.0);

    // 인출 전략
    const [withdrawalStrategy, setWithdrawalStrategy] = useState<'uniform' | 'target'>('uniform');
    const [isTableOpen, setIsTableOpen] = useState(false);

    // 시뮬레이션 실행 (계산 시 number로 변환)
    const result = useRetirement({
        ageNow: Number(ageNow),
        ageRetire: Number(ageRetire),
        targetMonthly: Number(targetMonthly),
        monthlyInvest: Number(monthlyInvest),
        assetSafe: Number(assetSafe),
        assetInvest: Number(assetInvest),
        rateSafe: Number(rateSafe),
        rateInvest: Number(rateInvest),
        withdrawalStrategy,
    });

    // 단위 배지 포맷팅
    const formatBadge = (value: number | string) => {
        const val = Number(value);
        return formatCurrency(val * 10000);
    };

    // 나이 배지 포맷팅 (단위 제거)
    const formatAgeBadge = (value: number | string) => {
        return `${value}세`;
    };

    // 축 포맷팅
    // 축 포맷팅 (동적 단위)
    const formatAxisY = (value: number) => {
        if (value === 0) return '0';

        // 데이터의 최대값 확인 (동적 단위를 위해)
        const maxBalance = Math.max(...result.data.map(d => d.balance));

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
                        {label}세 자산 현황
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">총 자산</span>
                            <span className="font-bold text-slate-800">{formatCurrency(data.balance)}</span>
                        </div>
                        {data.isRetired && (
                            <>
                                <div className="border-t border-slate-100 my-1" />
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">필요 생활비</span>
                                    <span className="font-bold text-slate-700">{formatCurrency(data.expense)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-600">인출 생활비</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(data.withdrawal)}</span>
                                </div>
                                {data.shortfall > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-rose-600">부족액</span>
                                        <span className="font-bold text-rose-600">{formatCurrency(data.shortfall)}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    // 기본 정보 초기화
    const clearBasicInfo = () => {
        setAgeNow(35);
        setAgeRetire(55);
        setTargetMonthly(200);
        setMonthlyInvest(150);
    };

    // 자산 정보 초기화
    const clearAssets = () => {
        setAssetSafe(1000);
        setAssetInvest(1000);
        setRateSafe(2.0);
        setRateInvest(5.0);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 pt-2 pb-6">
                {/* 모바일 광고 (lg 미만) */}


                {/* 좌우 레이아웃 */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ========== 좌측 입력 패널 (320px 고정) ========== */}
                    <aside className="w-full lg:w-[320px] flex-none space-y-4">
                        {/* 기본 정보 */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                                        <UserPlus size={16} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">기본 정보</h3>
                                </div>
                                <button
                                    onClick={clearBasicInfo}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    title="기본 정보 초기화"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <InputField label="현재 나이" value={ageNow} onChange={setAgeNow} unit="세" formatBadge={formatAgeBadge} />
                                <InputField
                                    label="은퇴 목표"
                                    value={ageRetire}
                                    onChange={setAgeRetire}
                                    unit="세"
                                    min={Number(ageNow) + 1}
                                    formatBadge={formatAgeBadge}
                                />
                                <InputField
                                    label="매월 투자"
                                    value={monthlyInvest}
                                    onChange={setMonthlyInvest}
                                    unit="만원"
                                    step={10}
                                    formatBadge={formatBadge}
                                />
                                <InputField
                                    label="월 생활비"
                                    value={targetMonthly}
                                    onChange={setTargetMonthly}
                                    unit="만원"
                                    step={10}
                                    formatBadge={formatBadge}
                                />
                            </div>
                        </div>

                        {/* 자산 정보 */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                                        <Wallet size={16} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">자산 및 저축</h3>
                                </div>
                                <button
                                    onClick={clearAssets}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    title="자산 정보 초기화"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {/* 안전 자산 */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-500 mb-2">안전 자산</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <InputField
                                            label="보유액"
                                            value={assetSafe}
                                            onChange={setAssetSafe}
                                            unit="만원"
                                            step={100}
                                            formatBadge={formatBadge}
                                        />
                                        <InputField
                                            label="수익률"
                                            value={rateSafe}
                                            onChange={setRateSafe}
                                            unit="%"
                                            step={0.1}
                                            max={20}
                                            formatBadge={formatBadge}
                                        />
                                    </div>
                                </div>

                                {/* 투자 자산 */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-500 mb-2">투자 자산</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <InputField
                                            label="보유액"
                                            value={assetInvest}
                                            onChange={setAssetInvest}
                                            unit="만원"
                                            step={100}
                                            formatBadge={formatBadge}
                                        />
                                        <InputField
                                            label="수익률"
                                            value={rateInvest}
                                            onChange={setRateInvest}
                                            unit="%"
                                            step={0.1}
                                            max={50}
                                            formatBadge={formatBadge}
                                        />
                                    </div>
                                </div>
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
                                    <span className="text-slate-400 text-sm font-bold">은퇴 시점 자산</span>
                                    <span className="text-xl font-bold text-emerald-400">
                                        {formatCurrency(result.totalAssetsAtRetire)}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-slate-700 hidden md:block"></div>
                                <div className="flex items-center  gap-2">
                                    <span className="text-slate-400 text-sm font-bold">월 부족 생활비</span>
                                    <span
                                        className={`text-xl font-bold ${result.avgMonthlyShortfall > 0 ? 'text-rose-400' : 'text-blue-400'
                                            }`}
                                    >
                                        {result.avgMonthlyShortfall > 0
                                            ? `-${formatCurrency(result.avgMonthlyShortfall)}`
                                            : '자산 충분'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 차트 섹션 */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="text-blue-600" size={16} />
                                    <h3 className="font-bold text-sm text-slate-800">자산 흐름 예측</h3>
                                </div>
                                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                    <button
                                        onClick={() => setWithdrawalStrategy('uniform')}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${withdrawalStrategy === 'uniform'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-400'
                                            }`}
                                    >
                                        균등 분할
                                    </button>
                                    <button
                                        onClick={() => setWithdrawalStrategy('target')}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${withdrawalStrategy === 'target'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-400'
                                            }`}
                                    >
                                        목표 생활비 맞춤
                                    </button>
                                </div>
                            </div>

                            <div ref={chartRef} className="w-full h-[300px] lg:h-[400px]">
                                {chartReady ? (
                                    <ComposedChart width={chartW} height={chartH} data={result.data} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                                        <defs>
                                            <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="age"
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={formatAxisY}
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            width={55}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <ReferenceLine
                                            x={Number(ageRetire)}
                                            stroke="#94a3b8"
                                            strokeDasharray="3 3"
                                            label={{
                                                value: '은퇴',
                                                position: 'insideTopLeft',
                                                fill: '#64748b',
                                                fontSize: 10,
                                            }}
                                        />
                                        <Area type="monotone" dataKey="safe" stackId="1" fill="url(#colorSafe)" stroke="none" />
                                        <Area
                                            type="monotone"
                                            dataKey="invest"
                                            stackId="1"
                                            fill="url(#colorInvest)"
                                            stroke="none"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="balance"
                                            stroke="#475569"
                                            strokeWidth={2}
                                            dot={false}
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
                                <span>연도별 자산 변화 [상세보기]</span>
                                {isTableOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {isTableOpen && (
                                <div className="mt-2 overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <table className="w-full text-xs text-slate-600 text-center">
                                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="p-2 whitespace-nowrap">나이</th>
                                                <th className="p-2 whitespace-nowrap text-emerald-600">안전자산</th>
                                                <th className="p-2 whitespace-nowrap text-amber-600">투자자산</th>
                                                <th className="p-2 whitespace-nowrap text-slate-800">총 자산</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {result.data.map((row) => (
                                                <tr key={row.age} className={`hover:bg-slate-50 ${row.isRetired ? 'bg-blue-50/30' : ''}`}>
                                                    <td className="p-2 font-bold">{row.age}세</td>
                                                    <td className="p-2">{formatCurrency(row.safe)}</td>
                                                    <td className="p-2">{formatCurrency(row.invest)}</td>
                                                    <td className="p-2 font-bold text-slate-800">{formatCurrency(row.balance)}</td>
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
