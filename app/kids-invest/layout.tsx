import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '자녀 투자 계산기 | 증여세 및 복리 효과',
    description: '자녀를 위한 장기 투자 시뮬레이션. 증여세 면제 한도 활용과 미국 직투 vs 연금저축의 세후 수익을 비교해보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
