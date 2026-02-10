export const SOURCES = {
    moef: {
        rssUrl: 'https://www.moef.go.kr/com/detailRssTagService.do?bbsId=MOSFBBS_000000000028',
        backupRssUrl: 'https://www.korea.kr/rss/dept_moef.xml',
        name: '기획재정부',
    },
    fsc: {
        rssUrl: 'https://www.fsc.go.kr/about/fsc_bbs_rss/?fid=0111',
        backupRssUrl: 'https://www.korea.kr/rss/dept_fsc.xml',
        name: '금융위원회',
    },
    krx: {
        apiUrl: 'https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo',
        name: '한국거래소',
    },
    naver: {
        apiUrl: 'https://openapi.naver.com/v1/search/news.json',
        name: '네이버 뉴스',
    },
} as const;

// 네이버 검색 키워드 (각 키워드별로 최신 뉴스 5건씩 수집)
export const NAVER_SEARCH_QUERIES = [
    'ISA IRP 연금저축',
    '절세 재테크',
    'ETF 신규 상장',
    '비트코인 가상자산',
    '미국증시 나스닥 S&P500',
    '코스피 코스닥 증시',
    '자산관리 재테크',
    '기준금리 한국은행',
];

export const PRIORITY_KEYWORDS: Record<1 | 2 | 3, string[]> = {
    1: ['ISA', 'IRP', '연금저축', '세법 개정', '세제 개편', '퇴직연금', '개인연금', '납입한도', '비과세'],
    2: ['기준금리', 'ETF 상장', '신규 상장', 'ETF', '연금', '절세', '금리', '규제'],
    3: ['코스피', '코스닥', '환율', '소비자물가', 'GDP', '고용률', '경제성장률'],
};

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'tax-reform': ['세법', '세제', '세금', '과세', '비과세', '공제', '납입한도', '연말정산'],
    'pension-regulation': ['ISA', 'IRP', '연금저축', '퇴직연금', '개인연금', '연금'],
    'interest-rate': ['기준금리', '금리', '한국은행', '통화정책'],
    'etf-listing': ['ETF', '상장', '신규 상장'],
    'market-volatility': ['코스피', '코스닥', '주가', '급락', '급등', '변동성'],
    'economic-indicator': ['소비자물가', 'GDP', '고용', '경제성장', '수출', '수입'],
    'crypto': ['비트코인', '이더리움', '가상자산', '암호화폐', '코인'],
    'us-market': ['나스닥', 'S&P500', '다우존스', '미국증시', '월가', 'Fed', '연준'],
    'asset-management': ['재테크', '자산관리', '투자', '배당', '부동산'],
};
