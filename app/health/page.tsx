import { Metadata } from 'next';
import HealthInsuranceClient from './HealthInsuranceClient';

export const metadata: Metadata = {
    title: '건강보험료 계산기 | 피부양자 자격 & 직장인 추가 건보료 판독',
    description: '임대소득 33만원의 함정과 재산세 과세표준 기준을 반영한 정밀 건보료 시뮬레이터. 지역가입자 전환 가능성과 직장인 추가 납부액을 계산해보세요.',
    openGraph: {
        title: '건강보험료 계산기 | 피부양자 조건·지역가입 보험료 시뮬레이터',
        description: '피부양자 가능성을 먼저 확인하고, 지역가입 전환 시 예상 건강보험료를 범위로 계산합니다. 배당·이자·임대소득 조건에 따른 변화를 확인하세요.',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 630,
                type: 'image/png',
            },
        ],
    },
};

export default function HealthPage() {
    return <HealthInsuranceClient />;
}
