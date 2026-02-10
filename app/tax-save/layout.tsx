import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '절세 계산기 | ISA/연금저축 세제혜택',
    description: 'ISA(개인종합자산관리계좌)와 연금저축의 절세 효과를 일반 계좌와 비교하여 세후 자산의 차이를 확인하세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
