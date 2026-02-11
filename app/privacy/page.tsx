import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '개인정보처리방침 | 은퇴 자산 계산기',
    description: '은퇴 자산 계산기 서비스 개인정보처리방침입니다.',
};

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold mb-8 text-slate-900">개인정보처리방침</h1>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6">
                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">1. 개인정보의 처리 목적</h2>
                    <p>
                        '은퇴 자산 계산기'는(은) 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                    </p>
                    <ul className="list-disc pl-5 mt-2">
                        <li>서비스 제공 및 콘텐츠 이용</li>
                        <li>접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">2. 수집하는 개인정보의 항목</h2>
                    <p>
                        본 서비스는 별도의 회원가입 없이 이용 가능하며, 계산에 입력되는 정보(나이, 자산 등)는 브라우저 내에서만 처리되며 서버로 전송되거나 저장되지 않습니다.
                    </p>
                    <p className="mt-2">
                        단, 서비스 이용 과정에서 아래와 같은 정보들이 자동으로 생성되어 수집될 수 있습니다.
                    </p>
                    <ul className="list-disc pl-5 mt-2">
                        <li>IP Address, 쿠키, 방문 일시, 서비스 이용 기록, 불량 이용 기록</li>
                        <li>Google Analytics를 통한 비식별화된 통계 데이터</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">3. 쿠키(Cookie)의 운용</h2>
                    <p>
                        본 서비스는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
                        쿠키는 웹사이트를 운영하는데 이용되는 서버(http)가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC 컴퓨터내의 하드디스크에 저장되기도 합니다.
                    </p>
                    <ul className="list-disc pl-5 mt-2">
                        <li>쿠키의 사용 목적 : 이용자가 방문한 각 서비스와 웹 사이트들에 대한 방문 및 이용형태, 인기 검색어, 보안접속 여부, 등을 파악하여 이용자에게 최적화된 정보 제공을 위해 사용됩니다.</li>
                        <li>쿠키의 설치·운영 및 거부 : 웹브라우저 상단의 도구&gt;인터넷 옵션&gt;개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">4. 개인정보 보호책임자</h2>
                    <p>
                        서비스 이용과 관련하여 발생하는 모든 개인정보보호 관련 민원을 개인정보 보호책임자 혹은 담당 부서로 신고하실 수 있습니다.
                    </p>
                    <p className="mt-2">
                        이메일: jaelip@gmail.com <br />

                    </p>
                </section>
            </div>
        </div>
    );
}
