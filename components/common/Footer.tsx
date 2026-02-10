export default function Footer() {
    return (
        <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center space-y-2">
                    {/* Service Name */}
                    <div className="text-lg font-black text-white">
                        은퇴계산기 - 뼈때리는 은퇴 & 자산 시뮬레이터
                    </div>

                    {/* Disclaimer */}
                    <div className="max-w-2xl text-xs text-slate-400 leading-relaxed">
                        본 서비스의 계산 결과는 시뮬레이션 수치이며, 실제 결과나 법적 효력을 보장하지 않습니다.
                    </div>

                    {/* Legal Links */}
                    <div className="flex items-center gap-4 text-xs">
                        <a
                            href="/terms"
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            이용약관
                        </a>
                        <span className="text-slate-600">|</span>
                        <a
                            href="/privacy"
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            개인정보 처리방침
                        </a>
                    </div>

                    {/* Creator & Copyright */}
                    <div className="flex flex-col items-center gap-1 text-xs text-slate-500">
                        <div>Made by <span className="font-semibold text-slate-400">gigi</span></div>
                        <div>ⓒ 2026 gigi. All rights reserved.</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
