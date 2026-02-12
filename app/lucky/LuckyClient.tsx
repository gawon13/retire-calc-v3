'use client';

import { useState } from 'react';
import { Clover, RotateCcw, Sparkles, AlertCircle, Info, Zap } from 'lucide-react';
import { useLuckyCalc } from '@/hooks/useLuckyCalc';
import { formatCurrency } from '@/utils/formatCurrency';

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
                    className="w-full px-3 py-2 pr-12 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                    {unit}
                </span>
            </div>
        </div>
    );
};

export default function LuckyClient() {
    // 입력 상태
    const [weeklyGames, setWeeklyGames] = useState<number | string>(5);   // 주 5게임 (5천원)
    const [prizeAmount, setPrizeAmount] = useState<number | string>(20);  // 1등 당첨금 20억

    // 계산 로직 실행
    const luck = useLuckyCalc({
        weeklyGames: Number(weeklyGames),
        prizeAmount: Number(prizeAmount)
    });

    // 배지 포맷팅
    const formatGamesBadge = (val: number | string) => `매주 ${val}게임`;
    const formatMoneyBadge = (val: number | string) => `${val}억`;

    // 초기화
    const clearInputs = () => {
        setWeeklyGames(5);
        setPrizeAmount(20);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6">


                {/* 좌우 레이아웃 */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ========== 좌측 입력 패널 (320px 고정) ========== */}
                    <aside className="w-full lg:w-[320px] flex-none space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
                                        <Clover size={16} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">로또 계산기</h3>
                                </div>
                                <button
                                    onClick={clearInputs}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    title="입력 초기화"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <InputField
                                    label="매주 구매 수량"
                                    value={weeklyGames}
                                    onChange={setWeeklyGames}
                                    unit="게임"
                                    step={1}
                                    min={1}
                                    max={100}
                                    formatBadge={formatGamesBadge}
                                />
                                <InputField
                                    label="1등 예상 당첨금"
                                    value={prizeAmount}
                                    onChange={setPrizeAmount}
                                    unit="억원"
                                    step={1}
                                    formatBadge={formatMoneyBadge}
                                />
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-500 mb-2">구매 비용 요약</h4>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">주간 비용</span>
                                    <span className="font-bold text-slate-800">{formatCurrency(Number(weeklyGames) * 1000)}원</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
                                    <span className="text-slate-600">연간 비용</span>
                                    <span className="font-bold text-slate-800">{formatCurrency(Number(weeklyGames) * 1000 * 52)}원</span>
                                </div>
                                <div className="mt-3 text-[10px] text-slate-400 leading-tight">
                                    * 로또 1게임 1,000원 기준<br />
                                    * 매주 빠짐없이 구매한다고 가정
                                </div>
                            </div>
                        </div>


                    </aside>

                    {/* ========== 우측 출력 패널 ========== */}
                    <main className="flex-1 min-w-0 space-y-4">
                        {/* 결과 대시보드 */}
                        <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                <Sparkles size={140} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-slate-400 text-sm font-bold mb-1">
                                    1등 당첨 시 최종 수령액
                                </p>
                                <p className="text-[10px] text-slate-500 mb-4">
                                    * 세금 33% (3억 초과분) + 22% (3억 이하) 공제 후
                                </p>

                                <div className="text-5xl lg:text-6xl font-black text-blue-400 tracking-tight mb-2">
                                    {formatCurrency(luck.afterTaxAmount)}
                                </div>
                                <div className="text-sm font-medium text-slate-400 mb-6">
                                    (총 세금: {formatCurrency(luck.totalTax)})
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2 text-yellow-500">
                                            <Zap size={16} />
                                            <span className="text-xs font-bold">당첨될 확률</span>
                                        </div>
                                        <div className="text-xl font-bold text-white">
                                            {luck.probability.toFixed(7)}%
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-1">
                                            814만분의 1 (기본) / 매주 {weeklyGames}게임 도전
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                                            <RotateCcw size={16} />
                                            <span className="text-xs font-bold">당첨까지 걸리는 시간</span>
                                        </div>
                                        <div className="text-xl font-bold text-white">
                                            {luck.yearsToWin > 10000 ? '약 1만년 이상' : `${Math.ceil(luck.yearsToWin).toLocaleString()}년`}
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-1">
                                            매주 {weeklyGames}게임 구매 시 통계적 기대값
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 인포그래픽 / 재미 요소 */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Info size={16} className="text-slate-400" />
                                얼마나 어려운 도전인가요?
                            </h3>

                            <div className="space-y-6">
                                {/* 벼락 vs 로또 */}
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="font-bold text-slate-600">벼락 맞을 확률 vs 로또 당첨 확률</span>
                                        <span className="text-slate-400">
                                            벼락이 {luck.stats.relativeToLightning > 1
                                                ? `${luck.stats.relativeToLightning.toFixed(1)}배 더 쉬움`
                                                : `${(1 / luck.stats.relativeToLightning).toFixed(1)}배 더 어려움`}
                                        </span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                                        {/* 로그 스케일 등 복잡한 시각화 대신 단순 비율 바는 0에 수렴하므로, 
                                            상징적인 아이콘/텍스트 매핑으로 대체 */}
                                        <div className="w-full h-full bg-gradient-to-r from-yellow-300 to-blue-500 relative">
                                            <div className="absolute top-0 left-0 h-full flex items-center px-3 text-[10px] font-bold text-yellow-800">
                                                ⚡️ 벼락
                                            </div>
                                            <div className="absolute top-0 right-0 h-full flex items-center px-3 text-[10px] font-bold text-white">
                                                🍀 로또
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 text-right">
                                        * 벼락 맞을 확률 (약 1/600만) 기준 비교
                                    </p>
                                </div>

                                {/* 수명 비교 */}
                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-lg text-3xl">
                                            🐢
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 mb-1">
                                                당첨되려면 {Math.ceil(luck.yearsToWin / 100).toLocaleString()}번 다시 태어나야 해요
                                            </h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                사람의 평균 수명을 100세라고 가정했을 때, 매주 {weeklyGames}게임씩 구매한다면
                                                통계적으로 <b>{Math.ceil(luck.yearsToWin / 100).toLocaleString()}번</b>의 인생을 살아야
                                                한 번 당첨될 수 있는 확률입니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
