'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, HelpCircle, Briefcase, UserCheck } from 'lucide-react';
import { useHealthCalc, HealthCalcMode } from '@/hooks/useHealthCalc';
import { formatCurrency } from '@/utils/formatCurrency';

// ==========================================
// 공용 컴포넌트
// ==========================================
interface InputFieldProps {
    label: string; // 라벨
    value: number | string; // 값
    onChange: (val: number | string) => void; // 변경 핸들러
    unit: string; // 단위
    formatBadge: (value: number | string) => string; // 뱃지 포맷
    description?: string; // 툴팁 설명
    placeholder?: string; // 플레이스홀더
}

const InputField = ({
    label,
    value,
    onChange,
    unit,
    formatBadge,
    description,
    placeholder = "0"
}: InputFieldProps) => {
    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600">{label}</label>
                    {description && (
                        <div className="group/tooltip relative">
                            <HelpCircle size={12} className="text-slate-400 cursor-help" />
                            {/* 툴팁 위치 조정 및 z-index 상향 - group/tooltip 명명된 그룹을 사용하여 카드 호버와 격리 */}
                            <div className="absolute left-0 bottom-full mb-2 w-max max-w-[220px] invisible group-hover/tooltip:visible p-2.5 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl whitespace-pre-line z-[9999] opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none">
                                {description}
                                <div className="absolute left-1 top-full w-2 h-2 bg-slate-800 rotate-45 -mt-1"></div>
                            </div>
                        </div>
                    )}
                </div>
                {/* 입력값 뱃지 (0보다 클 때만 강조) */}
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${Number(value) > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                    {formatBadge(value)}
                </span>
            </div>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') { onChange(''); return; }
                        // 숫자 앞에 0 제거 로직 (소수점 고려 X -> 여기선 정수형만 다룸)
                        if (val.length > 1 && val.startsWith('0')) { onChange(val.replace(/^0+/, '')); return; }
                        onChange(val);
                    }}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 pr-10 bg-white border border-slate-200 rounded-lg text-right font-mono text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-slate-300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                    {unit}
                </span>
            </div>
        </div>
    );
};

// 카드 컨테이너
const Card = ({ title, children, icon, onReset }: { title: string, children: React.ReactNode, icon?: React.ReactNode, onReset?: () => void }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4 relative group/card">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            {onReset && (
                <button
                    onClick={onReset}
                    className="p-1.5 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all"
                    title="입력 초기화"
                >
                    <RefreshCw size={14} />
                </button>
            )}
        </div>
        {children}
    </div>
);

export default function HealthInsuranceClient() {
    // 모드 선택
    const [mode, setMode] = useState<HealthCalcMode>('DEPENDENT');

    // 1. 기본 정보
    const [isBizRegistered, setIsBizRegistered] = useState(false);
    const [hasSpouseJob, setHasSpouseJob] = useState(true);
    const [currentSalary, setCurrentSalary] = useState<number | string>(0); // 직장인 모드 참고용

    // 2. 소득 정보 (연간) - 단, 임대소득은 월단위 입력 -> 연단위로 변경 (Phase 4)
    const [financialIncome, setFinancialIncome] = useState<number | string>(0);
    const [annualRentalIncome, setAnnualRentalIncome] = useState<number | string>(0); // 연 단위
    const [bizIncome, setBizIncome] = useState<number | string>(0);
    const [pensionIncome, setPensionIncome] = useState<number | string>(0);
    const [otherIncome, setOtherIncome] = useState<number | string>(0);

    // 3. 재산 정보 (만원 단위)
    const [propertyValue, setPropertyValue] = useState<number | string>(0);
    const [jeonseDeposit, setJeonseDeposit] = useState<number | string>(0);

    // 계산 훅 호출
    const result = useHealthCalc({
        mode,
        isBizRegistered,
        hasSpouseJob,
        annualRentalIncome: Number(annualRentalIncome),
        bizIncome: Number(bizIncome),
        financialIncome: Number(financialIncome),
        pensionIncome: Number(pensionIncome),
        otherIncome: Number(otherIncome),
        propertyValue: Number(propertyValue),
        jeonseDeposit: Number(jeonseDeposit),
    });

    // 만원 단위 포맷터
    const formatMoneyBadge = (val: number | string) => {
        const num = Number(val);
        if (num === 0) return '-';
        return formatCurrency(num * 10000);
    };

    // 부분 초기화 함수들
    const resetBasicInfo = () => {
        setIsBizRegistered(false);
        setHasSpouseJob(true);
        setCurrentSalary(0);
        setMode('DEPENDENT');
    };

    const resetIncomeInfo = () => {
        setFinancialIncome(0);
        setAnnualRentalIncome(0);
        setBizIncome(0);
        setPensionIncome(0);
        setOtherIncome(0);
    };

    const resetPropertyInfo = () => {
        setPropertyValue(0);
        setJeonseDeposit(0);
    };

    // 전체 초기화
    const clearInputs = () => {
        resetBasicInfo();
        resetIncomeInfo();
        resetPropertyInfo();
    };

    // 스택바 차트 데이터 계산 (총 소득 대비 비율)
    const totalIncomeForChart = result.calculations.totalIncome || 1; // 0으로 나누기 방지
    const getPercent = (val: number) => (val / totalIncomeForChart) * 100;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-6xl mx-auto px-6 pt-2 pb-6">

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ========== 좌측 입력 패널 (320px) ========== */}
                    <aside className="w-full lg:w-[320px] flex-none space-y-4">

                        {/* 1. 모드 선택 & 기본 정보 */}
                        <Card title="기본 정보" icon={<UserCheck size={16} className="text-blue-500" />} onReset={resetBasicInfo}>
                            {/* 모드 탭 */}
                            <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
                                <button
                                    onClick={() => setMode('DEPENDENT')}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mode === 'DEPENDENT'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    피부양자 자격
                                </button>
                                <button
                                    onClick={() => setMode('EMPLOYEE')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mode === 'EMPLOYEE'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    직장인 추가료
                                </button>
                            </div>

                            {/* 임대사업자 여부 */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-600 mb-2">임대/사업자 등록 여부</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsBizRegistered(true)}
                                        className={`flex-1 py-2 border rounded-lg text-xs font-bold transition-all ${isBizRegistered ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-500'
                                            }`}
                                    >
                                        등록함
                                    </button>
                                    <button
                                        onClick={() => setIsBizRegistered(false)}
                                        className={`flex-1 py-2 border rounded-lg text-xs font-bold transition-all ${!isBizRegistered ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-500'
                                            }`}
                                    >
                                        미등록
                                    </button>
                                </div>
                            </div>

                            {/* (피부양자용) 배우자 직장가입 여부 */}
                            {mode === 'DEPENDENT' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-2">배우자가 직장가입자인가요?</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setHasSpouseJob(true)}
                                            className={`flex-1 py-2 border rounded-lg text-xs font-bold transition-all ${hasSpouseJob ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-500'
                                                }`}
                                        >
                                            예
                                        </button>
                                        <button
                                            onClick={() => setHasSpouseJob(false)}
                                            className={`flex-1 py-2 border rounded-lg text-xs font-bold transition-all ${!hasSpouseJob ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-500'
                                                }`}
                                        >
                                            아니오
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* (직장인용) 월급 입력 */}
                            {mode === 'EMPLOYEE' && (
                                <div className="mt-4">
                                    <InputField
                                        label="현재 월급 (세후 실수령)"
                                        value={currentSalary}
                                        onChange={setCurrentSalary}
                                        unit="만원"
                                        formatBadge={formatMoneyBadge}
                                        description="참고용 정보입니다. 추가 보험료 계산에는 영향을 주지 않습니다."
                                    />
                                </div>
                            )}
                        </Card>

                        {/* 2. 소득 정보 (2열) */}
                        <Card title="연간 소득 정보" icon={<Briefcase size={16} className="text-emerald-500" />} onReset={resetIncomeInfo}>
                            <div className="grid grid-cols-2 gap-x-3">
                                <InputField
                                    label="금융소득"
                                    value={financialIncome}
                                    onChange={setFinancialIncome}
                                    unit="만원"
                                    formatBadge={formatMoneyBadge}
                                    placeholder="이자/배당"
                                />
                                <InputField
                                    label="임대소득(연)"
                                    value={annualRentalIncome}
                                    onChange={setAnnualRentalIncome}
                                    unit="만원"
                                    formatBadge={formatMoneyBadge}
                                    description={isBizRegistered ? "등록 시 1원이라도 발생하면 위험" : "미등록 시 연 400만원 초과 주의"}
                                    placeholder="연간임대"
                                />
                                <InputField
                                    label="사업소득"
                                    value={bizIncome}
                                    onChange={setBizIncome}
                                    unit="만원"
                                    formatBadge={formatMoneyBadge}
                                    placeholder="기타사업"
                                />
                                <InputField
                                    label="연금소득"
                                    value={pensionIncome}
                                    onChange={setPensionIncome}
                                    unit="만원"
                                    formatBadge={formatMoneyBadge}
                                    description="공적연금(국민/공무원/사학/군인) 총액 100% 반영"
                                    placeholder="공적연금"
                                />
                                <div className="col-span-2">
                                    <InputField
                                        label="기타 소득 합계"
                                        value={otherIncome}
                                        onChange={setOtherIncome}
                                        unit="만원"
                                        formatBadge={formatMoneyBadge}
                                        description="근로소득 + 기타소득 합계"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* 3. 재산 정보 (피부양자용) */}
                        {mode === 'DEPENDENT' && (
                            <Card title="재산 정보" icon={<Briefcase size={16} className="text-amber-500" />} onReset={resetPropertyInfo}>
                                <InputField
                                    label="재산세 과세표준"
                                    value={propertyValue}
                                    onChange={setPropertyValue}
                                    unit="만원"
                                    formatBadge={formatMoneyBadge}
                                    description="재산세 고지서상의 과세표준 금액 (공시가격의 약 60%)"
                                />
                                <InputField
                                    label="임차 보증금 (전/월세)"
                                    value={jeonseDeposit}
                                    onChange={setJeonseDeposit}
                                    unit="만원"
                                    formatBadge={formatMoneyBadge}
                                    description={"전세/월세 보증금의 30%가\n재산 점수에 합산됩니다."}
                                />
                            </Card>
                        )}
                    </aside>

                    {/* ========== 우측 결과 패널 ========== */}
                    <main className="flex-1 min-w-0">
                        {/* 상태 바 (Sticky) */}
                        <div className="sticky top-4 z-10 mb-6 shadow-xl rounded-2xl overflow-hidden">
                            <div className={`p-6 text-white transition-colors duration-500 ${result.status === 'SAFE' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                result.status === 'WARNING' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                    'bg-gradient-to-r from-rose-500 to-rose-600'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="inline-block px-2 py-1 bg-white/20 rounded text-[10px] font-bold mb-2 backdrop-blur-sm">
                                            {mode === 'DEPENDENT' ? '판정 결과' : '진단 결과'}
                                        </span>
                                        <h2 className="text-3xl font-black tracking-tight">
                                            {result.status === 'SAFE' ? '안전 (Safe)' :
                                                result.status === 'WARNING' ? '주의 (Warning)' :
                                                    '위험 (Danger)'}
                                        </h2>
                                    </div>
                                    {result.status === 'SAFE' ? <CheckCircle size={40} className="opacity-80" /> : <AlertTriangle size={40} className="opacity-80" />}
                                </div>
                                <p className="text-sm font-medium opacity-90 leading-relaxed">
                                    {result.description}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* 1. 소득 구성 분석 (Stacked Bar) */}
                            {result.calculations.totalIncome > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="text-sm font-bold text-slate-800 mb-6">소득 구성 분석</h3>

                                    {/* 그래프 바 */}
                                    <div className="h-4 rounded-full flex overflow-hidden w-full bg-slate-100 mb-4">
                                        {result.calculations.incomeBreakdown.financial > 0 && (
                                            <div style={{ width: `${getPercent(result.calculations.incomeBreakdown.financial)}%` }} className="bg-blue-400"></div>
                                        )}
                                        {result.calculations.incomeBreakdown.rental > 0 && (
                                            <div style={{ width: `${getPercent(result.calculations.incomeBreakdown.rental)}%` }} className="bg-amber-400"></div>
                                        )}
                                        {result.calculations.incomeBreakdown.biz > 0 && (
                                            <div style={{ width: `${getPercent(result.calculations.incomeBreakdown.biz)}%` }} className="bg-emerald-400"></div>
                                        )}
                                        {result.calculations.incomeBreakdown.pension > 0 && (
                                            <div style={{ width: `${getPercent(result.calculations.incomeBreakdown.pension)}%` }} className="bg-purple-400"></div>
                                        )}
                                        {result.calculations.incomeBreakdown.other > 0 && (
                                            <div style={{ width: `${getPercent(result.calculations.incomeBreakdown.other)}%` }} className="bg-slate-400"></div>
                                        )}
                                    </div>

                                    {/* 범례 */}
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span>금융: {formatCurrency(result.calculations.incomeBreakdown.financial * 10000)}</div>
                                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span>임대(연): {formatCurrency(result.calculations.incomeBreakdown.rental * 10000)}</div>
                                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>사업: {formatCurrency(result.calculations.incomeBreakdown.biz * 10000)}</div>
                                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span>연금: {formatCurrency(result.calculations.incomeBreakdown.pension * 10000)}</div>
                                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span>기타: {formatCurrency(result.calculations.incomeBreakdown.other * 10000)}</div>
                                    </div>
                                    <div className="mt-4 text-right">
                                        <span className="text-xs font-bold text-slate-400 mr-2">총 연소득 합계</span>
                                        <span className="text-lg font-black text-slate-800">{formatCurrency(result.calculations.totalIncome * 10000)}</span>
                                    </div>
                                </div>
                            )}

                            {/* 2. 상세 리포트 */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <h3 className="text-sm font-bold text-slate-800 mb-4">상세 분석 리포트</h3>

                                {mode === 'EMPLOYEE' ? (
                                    <div className="text-center py-8">
                                        <p className="text-slate-400 text-sm font-medium mb-2">월 예상 추가 납부액</p>
                                        <div className="text-5xl font-black text-slate-800 tracking-tight mb-2">
                                            {formatCurrency(result.monthlyPremium).replace('원', '')}
                                            <span className="text-2xl font-medium text-slate-400 ml-1">원</span>
                                        </div>
                                        {(result.monthlyPremium > 0) && (
                                            <p className="text-xs text-rose-500 mt-2 bg-rose-50 inline-block px-3 py-1 rounded-full">
                                                연간 {formatCurrency(result.monthlyPremium * 12)} 추가 부담 예상
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* 재산 환산액 표시 */}
                                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                            <span className="text-xs font-bold text-slate-600">재산 환산액 (과표+보증금30%)</span>
                                            <span className="text-sm font-black text-slate-800">{formatCurrency(result.calculations.finalProperty * 10000)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* 경고 사유 */}
                                {result.reasons.length > 0 && (
                                    <div className="mt-6 bg-rose-50 border border-rose-100 rounded-xl p-4">
                                        <h4 className="text-rose-600 font-bold text-xs mb-3 flex items-center gap-1.5">
                                            <AlertTriangle size={14} />
                                            위험 요인 발견
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.reasons.map((reason, idx) => (
                                                <li key={idx} className="text-xs text-rose-500 flex items-start gap-2 leading-relaxed">
                                                    <XCircle size={14} className="mt-0.5 flex-none opacity-60" />
                                                    <span>{reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="text-center text-[11px] text-slate-400 py-4 leading-relaxed">
                                본 시뮬레이션 결과는 단순 참고용이며, 정확한 보험료 산정 및 자격 판정은<br />
                                <strong className="text-slate-500">국민건강보험공단 (1577-1000)</strong>을 통해 확인하시기 바랍니다.
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
