import { Metadata } from 'next';
import TaxSavingSimulatorClient from './TaxSavingSimulatorClient';

export const metadata: Metadata = {
    title: '절세 계산기 | ISA·연금 절세 효과 비교 계산기',
    description: 'ISA, 연금저축, IRP 등 절세 상품을 활용했을 때 세금 부담이 얼마나 달라지는지 세후 기준으로 비교합니다.',
    openGraph: {
        title: '절세 계산기 | ISA·연금 절세 효과 비교 계산기',
        description: 'ISA, 연금저축, IRP 등 절세 상품을 활용했을 때 세금 부담이 얼마나 달라지는지 세후 기준으로 비교합니다.',
    },
};

export default function TaxSavingSimulatorPage() {
    return <TaxSavingSimulatorClient />;
}
