import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '복리 계산기 | 자산 성장 그래프',
    description: '복리 효과를 시각적으로 확인하고 초기 투자금, 월 적립액, 수익률에 따른 자산 증식을 시뮬레이션해보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
