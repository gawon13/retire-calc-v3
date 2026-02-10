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
} as const;

export const PRIORITY_KEYWORDS: Record<1 | 2 | 3, string[]> = {
    1: ['ISA', 'IRP', '연금저축', '세법 개정', '세제 개편', '퇴직연금', '개인연금', '납입한도', '비과세'],
    2: ['기준금리', 'ETF 상장', '신규 상장', 'ETF', '연금', '절세', '금리', '규제'],
    3: ['코스피', '코스닥', '환율', '소비자물가', 'GDP', '고용률', '경제성장률'],
};

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'tax-reform': ['세법', '세제', '세금', '과세', '비과세', '공제', '납입한도'],
    'pension-regulation': ['ISA', 'IRP', '연금저축', '퇴직연금', '개인연금', '연금'],
    'interest-rate': ['기준금리', '금리', '한국은행', '통화정책'],
    'etf-listing': ['ETF', '상장', '신규 상장'],
    'market-volatility': ['코스피', '코스닥', '주가', '급락', '급등', '변동성'],
    'economic-indicator': ['소비자물가', 'GDP', '고용', '경제성장', '수출', '수입'],
};
