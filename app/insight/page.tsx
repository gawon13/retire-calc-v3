import { Metadata } from 'next';
import InsightPageClient from './InsightPageClient';

export const metadata: Metadata = {
    title: '은퇴 인사이트 | 최신 금융 뉴스 및 은퇴 전략',
    description: '연금, 투자, 절세, 부동산 등 은퇴 준비에 필요한 핵심 뉴스와 전문가 인사이트를 큐레이션하여 제공합니다.',
    openGraph: {
        title: '은퇴 인사이트 | 최신 금융 뉴스 및 은퇴 전략',
        description: '연금, 투자, 절세, 부동산 등 은퇴 준비에 필요한 핵심 뉴스와 전문가 인사이트를 큐레이션하여 제공합니다.',
    },
};

export default function InsightPage() {
    return <InsightPageClient />;
}
