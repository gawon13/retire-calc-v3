import { Metadata } from 'next';
import CompoundCalculatorClient from './CompoundCalculatorClient';

export const metadata: Metadata = {
    title: '복리 계산기 | 월 적립·수익률 복리 계산기',
    description: '월 투자액(적립식/일시금)과 기간, 기대수익률을 입력하면 복리로 자산이 얼마나 늘어나는지 연도별로 계산합니다.',
    openGraph: {
        title: '복리 계산기 | 월 적립·수익률 복리 계산기',
        description: '월 투자액(적립식/일시금)과 기간, 기대수익률을 입력하면 복리로 자산이 얼마나 늘어나는지 연도별로 계산합니다.',
    },
};

export default function CompoundCalculatorPage() {
    return <CompoundCalculatorClient />;
}
