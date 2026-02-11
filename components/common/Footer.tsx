import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-8 bg-slate-50 border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="flex justify-center space-x-6 mb-4 text-sm text-slate-500">
                    <Link href="/terms" className="hover:text-slate-800 transition-colors">
                        이용약관
                    </Link>
                    <Link href="/privacy" className="hover:text-slate-800 transition-colors">
                        개인정보처리방침
                    </Link>
                </div>
                <p className="text-xs text-slate-400">
                    © 2026 은퇴 자산 계산기. All rights reserved.
                </p>
                <p className="text-[10px] text-slate-300 mt-2">
                    본 서비스는 모의 계산 결과를 제공하며, 실제 투자 결과와 다를 수 있습니다.
                    <br />
                    투자의 책임은 본인에게 있습니다.
                </p>
            </div>
        </footer>
    );
}
