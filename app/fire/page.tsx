import { Metadata } from 'next';
import FireCalculatorClient from './FireCalculatorClient';

export const metadata: Metadata = {
    title: 'FIRE 계산기 | 조기 은퇴 자금·4% 룰 계산기',
    description: '연간 생활비와 4% 룰을 기반으로 FIRE(Financial Independence, Retire Early) 달성 자금과 시기를 계산합니다.',
    openGraph: {
        title: 'FIRE 계산기 | 조기 은퇴 자금·4% 룰 계산기',
        description: '연간 생활비와 4% 룰을 기반으로 FIRE(Financial Independence, Retire Early) 달성 자금과 시기를 계산합니다.',
    },
};

export default function FireCalculatorPage() {
    return <FireCalculatorClient />;
}
