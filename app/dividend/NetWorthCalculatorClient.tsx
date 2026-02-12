'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, Briefcase, MinusCircle, HelpCircle, UserCheck } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, Label } from 'recharts';
import { useChartReady } from '@/hooks/useChartReady';

// 입력 필드 컴포넌트
interface InputFieldProps {
    label: string;
    value: number | string;
    onChange: (val: number | string) => void;
    unit: string;
    step?: number;
    min?: number;
    max?: number;
    formatBadge: (value: number | string) => string;
    description?: string;
}

const InputField = ({
    label,
    value,
    onChange,
    unit,
    min = 0,
    max,
    formatBadge,
    description,
}: InputFieldProps) => {
    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                    <label className="text-[11px] font-bold text-slate-500">{label}</label>
                    {description && (
                        <div className="group/tooltip relative">
                            <HelpCircle size={10} className="text-slate-300 cursor-help" />
                            <div className="absolute left-0 bottom-full mb-1 w-max max-w-[150px] invisible group-hover/tooltip:visible p-2 bg-slate-800 text-white text-[9px] rounded shadow-xl whitespace-pre-line z-50 opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none">
                                {description}
                                <div className="absolute left-2 top-full w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-1"></div>
                            </div>
                        </div>
                    )}
                </div>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded text-slate-400 bg-slate-50">
                    {formatBadge(value)}
                </span>
            </div>
            <div className="relative">
                <input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => {
                        // 1. 입력된 원본 문자열을 그대로 가져옴
                        let val = e.target.value;
                        // 2. 빈 값 처리
                        if (val === '') {
                            onChange('');
                            return;
                        }
                        // 3. 소수점 입력 원천 차단 (정수만 허용하는 경우)
                        // 만약 소수점이 포함되어 있다면 제거함
                        val = val.replace(/[^0-9]/g, '');
                        // 4. 앞자리 0 제거 (Leading Zero)
                        // '0'만 있는 경우는 유지하되, '01'처럼 숫자가 이어지면 앞의 0을 제거
                        if (val.length > 1 && val.startsWith('0')) {
                            val = val.replace(/^0+/, '');
                        }
                        // 5. 최종 값이 빈 문자열이 되면 '0'이 아닌 빈 값으로 처리 (사용자 편의)
                        if (val === '') {
                            onChange('');
                        } else {
                            onChange(val);
                        }
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 pointer-events-none">
                    {unit}
                </span>
            </div>
        </div>
    );
};

// 섹션 카드 컴포넌트
const SectionCard = ({ title, icon, onReset, children }: { title: string, icon: React.ReactNode, onReset: () => void, children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
        <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                    {icon}
                </div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            </div>
            <button
                onClick={onReset}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="초기화"
            >
                <RefreshCw size={14} />
            </button>
        </div>
        {children}
    </div>
);

export default function NetWorthCalculatorClient() {
    // 1. 기본 정보
    const [ageGroup, setAgeGroup] = useState<'20' | '30' | '40' | '50'>('30');
    const [gender, setGender] = useState<'male' | 'female'>('male');

    // 2. 자산 정보
    const [financialAssets, setFinancialAssets] = useState<number | string>(5000);
    const [realEstate, setRealEstate] = useState<number | string>(30000);
    const [rentDeposit, setRentDeposit] = useState<number | string>(10000);
    const [otherAssets, setOtherAssets] = useState<number | string>(5000);

    // 3. 부채 정보
    const [loans, setLoans] = useState<number | string>(0);
    const [tenantDeposit, setTenantDeposit] = useState<number | string>(0);

    // 포맷팅 함수
    const formatMoneyBadge = (val: number | string) => formatCurrency(Number(val) * 10000);

    // 총 순자산 계산
    const totalAssets = Number(financialAssets) + Number(realEstate) + Number(rentDeposit) + Number(otherAssets);
    const totalLiabilities = Number(loans) + Number(tenantDeposit);
    const netWorth = totalAssets - totalLiabilities;

    // 티어 판정 함수 (색상 가독성 및 명도 대조 개선)
    const getTier = (value: number) => {
        // 다이아몬드: 30억 이상
        if (value >= 300000) return {
            name: '다이아몬드',
            percent: 1,
            bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900',
            text: 'text-white',
            accent: 'text-cyan-400',
            badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        };
        // 골드: 10억 이상
        if (value >= 100000) return {
            name: '골드',
            percent: 10,
            bg: 'bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600',
            text: 'text-white',
            accent: 'text-yellow-200',
            badge: 'bg-black/20 text-yellow-100 border-yellow-400/30'
        };
        // 브론즈: 그 외
        return {
            name: '브론즈',
            percent: 65,
            bg: 'bg-gradient-to-br from-slate-200 to-slate-200',
            text: 'text-slate-800',
            accent: 'text-blue-700',
            badge: 'bg-slate-800/10 text-slate-600 border-slate-400/30'
        };
    };

    const tier = getTier(netWorth);
    const [chartRef, chartReady, chartW] = useChartReady();

    // 대한민국 자산 분포 종 모양 데이터 (Percentile 기반 시각화용)
    const distData = Array.from({ length: 51 }, (_, i) => {
        const x = i * 2;
        const y = Math.exp(-Math.pow(x - 50, 2) / (2 * Math.pow(22, 2))) * 100;
        return { x, y };
    });

    // 정밀 퍼센타일 계산 (단순 3단계가 아닌 연속적인 값으로 시각화 개선)
    const getDetailedPercentile = (nw: number) => {
        const val = nw;
        if (val >= 300000) return Math.max(0.1, 1 - (val - 300000) / 1000000); // 30억 이상 상위 1% 미만
        if (val >= 100000) return 1 + (9 * (300000 - val)) / 200000; // 10억~30억 -> 상위 1%~10%
        if (val >= 30000) return 10 + (30 * (100000 - val)) / 70000; // 3억~10억 -> 상위 10%~40%
        if (val >= 10000) return 40 + (25 * (30000 - val)) / 20000; // 1억~3억 -> 상위 40%~65%
        if (val >= 0) return 65 + (30 * (10000 - val)) / 10000; // 0~1억 -> 상위 65%~95%
        return 98; // 부채 가구
    };

    const continuousPercent = getDetailedPercentile(netWorth);
    // 1. userX 좌표 보정 (양 끝 짤림 방지)
    const userX = Math.min(99, Math.max(1, 100 - continuousPercent));
    const userY = Math.exp(-Math.pow(userX - 50, 2) / (2 * Math.pow(22, 2))) * 100;

    // 승급 로드맵 계산
    const nextGoal = netWorth < 100000 ? { name: '골드', target: 100000 } : { name: '다이아몬드', target: 300000 };
    const isTopTier = netWorth >= 300000;
    const amountNeeded = nextGoal.target - netWorth;

    const calculateRoadmap = (monthlySavingsKRW: number) => {
        if (isTopTier || amountNeeded <= 0) return 0;
        const P = monthlySavingsKRW / 10000; // 만원 단위
        const r = 0.05 / 12; // 연 5% -> 월리 단위
        const target = nextGoal.target;
        const pv = netWorth;

        const numer = target + P / r;
        const denom = pv + P / r;
        if (denom <= 0) return 9999;

        const months = Math.log(numer / denom) / Math.log(1 + r);
        return isFinite(months) ? Math.ceil(months) : 9999;
    };

    const formatRoadmapTime = (m: number) => {
        if (m <= 0) return '달성 완료';
        if (m >= 9999) return '달성 불가 (이자 부담 과다)';
        const years = Math.floor(m / 12);
        const months = m % 12;
        if (years === 0) return `${months}개월`;
        if (months === 0) return `${years}년`;
        return `${years}년 ${months}개월`;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 pt-2 pb-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ========== 좌측 입력 패널 ========== */}
                    <aside className="w-full lg:w-[320px] flex-none">
                        {/* 1. 기본 정보 */}
                        <SectionCard
                            title="기본 정보"
                            icon={<UserCheck size={16} strokeWidth={2} />}
                            onReset={() => { setAgeGroup('30'); setGender('male'); }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 mb-2 block">연령대</label>
                                    <div className="grid grid-cols-4 gap-1">
                                        {(['20', '30', '40', '50'] as const).map((age) => (
                                            <button
                                                key={age}
                                                onClick={() => setAgeGroup(age)}
                                                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all border ${ageGroup === age
                                                    ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                {age === '50' ? '50+' : `${age}대`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 mb-2 block">성별</label>
                                    <div className="grid grid-cols-2 gap-1">
                                        {(['male', 'female'] as const).map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setGender(g)}
                                                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all border ${gender === g
                                                    ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                {g === 'male' ? '남성' : '여성'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* 2. 자산 정보 */}
                        <SectionCard
                            title="자산 정보"
                            icon={<Briefcase size={16} strokeWidth={2} />}
                            onReset={() => { setFinancialAssets(0); setRealEstate(0); setRentDeposit(0); setOtherAssets(0); }}
                        >
                            <div className="grid grid-cols-2 gap-x-3">
                                <InputField label="금융 자산" value={financialAssets} onChange={setFinancialAssets} unit="만원" formatBadge={formatMoneyBadge} description="현금, 예적금, 주식, 채권, 코인, 보험 해약환급금 등" />
                                <InputField label="부동산" value={realEstate} onChange={setRealEstate} unit="만원" formatBadge={formatMoneyBadge} description="실거주 주택, 오피스텔, 분양권, 토지 등 (거래 시세 기준)" />
                                <InputField label="임차보증금" value={rentDeposit} onChange={setRentDeposit} unit="만원" formatBadge={formatMoneyBadge} description="내가 전/월세로 거주하며 집주인에게 맡긴 보증금" />
                                <InputField label="기타 실물" value={otherAssets} onChange={setOtherAssets} unit="만원" formatBadge={formatMoneyBadge} description="자동차(중고차 시세), 골드바, 명품, 명목 가치가 있는 동산 등" />
                            </div>
                        </SectionCard>

                        {/* 3. 부채 정보 */}
                        <SectionCard
                            title="부채 정보"
                            icon={<MinusCircle size={16} strokeWidth={2} />}
                            onReset={() => { setLoans(0); setTenantDeposit(0); }}
                        >
                            <div className="grid grid-cols-2 gap-x-3">
                                <InputField label="대출금" value={loans} onChange={setLoans} unit="만원" formatBadge={formatMoneyBadge} description="주택담보대출, 신용대출, 마이너스 통장 잔액 등" />
                                <InputField label="임대보증금" value={tenantDeposit} onChange={setTenantDeposit} unit="만원" formatBadge={formatMoneyBadge} description="내가 집주인으로서 세입자에게 받은 보증금 (돌려줘야 할 돈)" />
                            </div>
                        </SectionCard>
                    </aside>

                    {/* ========== 우측 출력 패널 ========== */}
                    <main className="flex-1 min-w-0">
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="space-y-4"
                        >
                            {/* 등급 요약 카드 (높이 60% 축소 버전) */}
                            <div className={`relative overflow-hidden rounded-xl p-5 shadow-lg ${tier.bg} border border-white/10 transition-colors duration-500`}>
                                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-md ${tier.text}`}>
                                            <Trophy size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${tier.badge}`}>
                                                    {tier.name}
                                                </span>
                                                <span className={`text-xs font-bold opacity-80 ${tier.text}`}>경제적 위치</span>
                                            </div>
                                            <h2 className={`text-2xl font-black ${tier.text}`}>
                                                상위 <span className={tier.accent}>{tier.percent}%</span> 수준
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6">
                                        <p className={`text-[10px] font-bold opacity-60 mb-0.5 ${tier.text}`}>현재 순자산 합계</p>
                                        <p className={`text-xl font-black ${tier.text}`}>
                                            {formatCurrency(netWorth * 10000)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 자산 분포 차트 (종 모양 곡선 + 내 위치) */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                        자산 분포 곡선 (나의 위치)
                                    </h3>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        상위 {tier.percent}%
                                    </span>
                                </div>
                                <div ref={chartRef} className="h-32 w-full relative">
                                    {chartReady && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={distData} margin={{ top: 35, right: 15, left: 15, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    type="monotone"
                                                    dataKey="y"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill="url(#colorDist)"
                                                    isAnimationActive={false}
                                                />
                                                <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
                                                <YAxis hide domain={[0, 130]} />
                                                <Tooltip content={<div className="hidden" />} />

                                                {/* 현재 위치 수직 보조선 */}
                                                <ReferenceLine
                                                    x={userX}
                                                    stroke="#ef4444"
                                                    strokeDasharray="3 3"
                                                    // @ts-ignore
                                                    ifOverflow="extend"
                                                    // @ts-ignore
                                                    isFront={true}
                                                />

                                                {/* 현재 위치 도트 */}
                                                <ReferenceDot
                                                    x={userX}
                                                    y={userY}
                                                    r={6}
                                                    fill="#ef4444"
                                                    stroke="white"
                                                    // @ts-ignore
                                                    ifOverflow="extend"
                                                    // @ts-ignore
                                                    isFront={true}
                                                >
                                                    <Label
                                                        value="현재 내 위치"
                                                        position="top"
                                                        offset={10}
                                                        fill="#ef4444"
                                                        fontSize={11}
                                                        fontWeight="bold"
                                                    />
                                                </ReferenceDot>
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                                <div className="flex justify-between mt-1 px-1 border-t border-slate-50 pt-2">
                                    <span className="text-[9px] font-medium text-slate-400">자산 하위권</span>
                                    <span className="text-[9px] font-medium text-slate-400">자산 상위권</span>
                                </div>
                            </div>

                            {/* 승급 로드맵 (신규) */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                                        <RefreshCw size={14} className="text-blue-500" />
                                        승급 로드맵
                                    </h3>
                                    {!isTopTier && (
                                        <span className="text-[10px] font-bold text-slate-500">
                                            {nextGoal.name}까지 <span className="text-blue-600">+{formatCurrency(amountNeeded * 10000)}</span>
                                        </span>
                                    )}
                                </div>
                                {isTopTier ? (
                                    <div className="py-4 text-center">
                                        <p className="text-[11px] font-bold text-slate-400">이미 최상위 등급인 다이아몬드입니다! 💎</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {[1000000, 2000000, 3000000].map(savings => (
                                            <div key={savings} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-blue-300"></div>
                                                    월 {savings / 10000}만 원 저축 시
                                                </span>
                                                <span className="text-xs font-black text-blue-600">{formatRoadmapTime(calculateRoadmap(savings))}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!isTopTier && (
                                    <p className="mt-3 text-[9px] text-slate-400 text-center">
                                        * 연 수익률 5% 복리를 적용한 시뮬레이션 결과입니다.
                                    </p>
                                )}
                            </div>

                            {/* 세부 자산 현황 (한 줄 2개 배치로 높이 축소) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Briefcase size={16} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500">총 자산</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{formatCurrency(totalAssets * 10000)}</span>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                            <MinusCircle size={16} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500">총 부채</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{formatCurrency(totalLiabilities * 10000)}</span>
                                </div>
                            </div>

                            {/* 안내 문구 (슬림화) */}
                            <div className="bg-white/50 border border-slate-100 rounded-xl p-4">
                                <div className="flex items-start gap-2 text-slate-400">
                                    <HelpCircle size={14} className="mt-0.5 flex-none" />
                                    <p className="text-[10px] leading-relaxed">
                                        2024 통계청 가계금융복지조사 기준 데이터입니다.
                                        입력하신 정보는 별도로 수집되지 않으며, 브라우저 세션에만 임시 보관됩니다.
                                        동일 연령대({ageGroup}대) 정밀 비교 기능은 업데이트 예정입니다.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
}
