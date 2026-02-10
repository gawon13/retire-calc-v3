export default function InsightPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="text-center py-16">
                    <div className="mb-6">
                        <svg
                            className="mx-auto h-24 w-24 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        인사이트
                    </h1>

                    <p className="text-xl text-gray-600 mb-8">
                        준비 중입니다
                    </p>

                    <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-gray-700">
                            곧 유익한 금융 인사이트와 투자 전략을 공유할 예정입니다.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            조금만 기다려주세요! 🚀
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
