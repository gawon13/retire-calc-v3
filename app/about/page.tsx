import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '서비스 소개 | 은퇴 자산 계산기 개발 스토리',
    description: '복잡한 은퇴 준비를 더 쉽고 명확하게. 누구나 자신의 미래를 직접 설계할 수 있도록 돕는 은퇴 자산 계산기 프로젝트를 소개합니다.',
    openGraph: {
        title: '서비스 소개 | 은퇴 자산 계산기 개발 스토리',
        description: '복잡한 은퇴 준비를 더 쉽고 명확하게. 누구나 자신의 미래를 직접 설계할 수 있도록 돕는 은퇴 자산 계산기 프로젝트를 소개합니다.',
    },
};

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-md p-8">


                <div className="prose prose-lg max-w-none">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        더 나은 미래를 설계하는 뼈때리는 금융 도구
                    </h2>

                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                        🎯 우리의 미션
                    </h3>
                    <p className="text-gray-700 mb-6">
                        금융 지식의 장벽을 낮추고, 모든 사람이 데이터 기반의 현명한 재정 결정을
                        내릴 수 있도록 돕습니다. '뼈때리는' 현실적인 시뮬레이션을 통해
                        장밋빛 환상이 아닌 실질적인 계획을 세울 수 있습니다.
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                        💡 제공하는 계산기
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                        <li><strong>은퇴자금 계산기:</strong> 은퇴 후 필요한 자산과 현재 준비 상황 분석</li>
                        <li><strong>복리 계산기:</strong> 장기 투자의 복리 효과 계산</li>
                        <li><strong>절세 계산기:</strong> 세금 최적화 전략 수립</li>
                        <li><strong>자녀계좌 계산기:</strong> 자녀를 위한 장기 투자 계획</li>
                        <li><strong>FIRE 계산기:</strong> 조기 은퇴(FIRE)를 위한 4% 룰 계산</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                        ⚡ 핵심 원칙
                    </h3>
                    <div className="bg-gray-50 border-l-4 border-blue-600 p-4 mb-6">
                        <ul className="list-none space-y-2 text-gray-700">
                            <li>✅ <strong>현실적인 시뮬레이션:</strong> 과장 없는 정직한 계산</li>
                            <li>✅ <strong>쉬운 사용성:</strong> 복잡한 금융 지식 없이도 사용 가능</li>
                            <li>✅ <strong>데이터 중심:</strong> 감이 아닌 수치로 말하기</li>
                            <li>✅ <strong>투명성:</strong> 모든 계산 로직 공개</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 text-sm italic">
                        당신의 재정적 미래를 위한 첫 걸음, 지금 시작하세요.
                    </p>
                </div>
            </div>
        </div>
    );
}
