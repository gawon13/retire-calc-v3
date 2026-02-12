import { Metadata } from 'next';
import LuckyClient from './LuckyClient';

export const metadata: Metadata = {
    title: '로또 당첨 시뮬레이터 | 인생 역전 확률 계산기',
    description: '매주 로또를 사면 1등 당첨까지 얼마나 걸릴까? 벼락 맞을 확률과 비교하고, 당첨금 수령액과 세금을 시뮬레이션해보세요.',
    openGraph: {
        title: '로또 당첨 시뮬레이터 | 인생 역전 확률 계산기',
        description: '매주 로또를 사면 1등 당첨까지 얼마나 걸릴까? 벼락 맞을 확률과 비교하고, 당첨금 수령액과 세금을 시뮬레이션해보세요.',
    },
};

export default function LuckyPage() {
    return <LuckyClient />;
}
