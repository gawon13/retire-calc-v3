import NetWorthCalculatorClient from './NetWorthCalculatorClient';

export const metadata = {
    title: '순자산 등급 판독기 | 내 자산 위치 확인',
    description: '나의 순자산을 입력하고 대한민국 상위 몇 %인지 확인해보세요.',
};

export default function NetWorthRankingPage() {
    return <NetWorthCalculatorClient />;
}
