import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '이용약관 | 은퇴 계산기',
    description: '은퇴 계산기 서비스 이용약관입니다.',
};

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold mb-8 text-slate-900">이용약관</h1>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6">
                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">제1조 (목적)</h2>
                    <p>
                        본 약관은 '은퇴 계산기' (이하 "회사")가 제공하는 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원의 권리, 의무 및 책임사항 등 기타 필요한 사항을 규정함을 목적으로 합니다.
                    </p>
                </section>
                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">제2조 (서비스의 제공)</h2>
                    <p>
                        1. 회사는 다음과 같은 서비스를 제공합니다.<br />
                        - 은퇴 자산 시뮬레이션<br />
                        - 복리 및 투자 수익 계산<br />
                        - 절세 효과 분석<br />
                        2. 서비스의 내용은 회사의 정책에 따라 변경될 수 있습니다.
                    </p>
                </section>
                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">제3조 (책임의 한계)</h2>
                    <p>
                        본 서비스에서 제공하는 모든 계산 결과와 데이터는 시뮬레이션에 불과하며, 실제 투자 결과나 미래의 자산 가치를 보장하지 않습니다. 회사는 서비스 이용으로 인해 발생한 손해에 대해 법적 책임을 지지 않습니다. 모든 투자의 책임은 사용자 본인에게 있습니다.
                    </p>
                </section>
                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">제4조 (개인정보보호)</h2>
                    <p>
                        회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
                    </p>
                </section>
                {/* 추가 약관 내용이 필요하면 여기에 작성 */}
            </div>
        </div>
    );
}
