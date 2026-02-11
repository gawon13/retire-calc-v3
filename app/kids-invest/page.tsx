import { Metadata } from 'next';
import KidsInvestmentSimulatorClient from './KidsInvestmentSimulatorClient';

export const metadata: Metadata = {
    title: '자녀계좌 계산기 | 증여·적립 자녀투자 계산기',
    description: '자녀계좌에 일시금/월 적립을 했을 때, 증여세 면제 한도를 고려하여 성인이 되었을 때 얼마가 될지 시뮬레이션합니다.',
    openGraph: {
        title: '자녀계좌 계산기 | 증여·적립 자녀투자 계산기',
        description: '자녀계좌에 일시금/월 적립을 했을 때, 증여세 면제 한도를 고려하여 성인이 되었을 때 얼마가 될지 시뮬레이션합니다.',
    },
};

export default function KidsInvestmentSimulatorPage() {
    return <KidsInvestmentSimulatorClient />;
}
