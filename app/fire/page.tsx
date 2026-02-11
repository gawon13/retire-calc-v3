import { Metadata } from 'next';
import FireCalculatorClient from './FireCalculatorClient';

export const metadata: Metadata = {
    title: '파이어족 계산기 | 조기 은퇴 자산 및 달성 시기 시뮬레이션',
    description: '파이어족(FIRE)을 위한 은퇴 자산 계산기입니다. 4% 룰을 기반으로 목표 자산(FI Number)과 조기 은퇴 가능 시기를 계산해 드립니다.',
};

export default function FireCalculatorPage() {
    return <FireCalculatorClient />;
}
