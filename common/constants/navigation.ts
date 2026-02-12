/**
 * 네비게이션 메뉴 설정을 관리하는 상수 파일
 */

/**
 * 서비스에서 제공하는 주요 계산기 도구 목록
 */
export const CALCULATORS = [
    { name: '은퇴 계산기', href: '/', icon: 'Home', isNew: false },
    { name: '복리 계산기', href: '/compound', icon: 'TrendingUp', isNew: false },
    { name: '절세 계산기', href: '/tax-save', icon: 'Percent', isNew: false },
    { name: '자녀계좌 계산기', href: '/kids-invest', icon: 'Baby', isNew: false },
    { name: 'FIRE 계산기', href: '/fire', icon: 'Flame', isNew: false },
    { name: '건보료 판독기', href: '/health', icon: 'Stethoscope', isNew: false },
    { name: '배당주 로드맵', href: '/dividend', icon: 'DollarSign', isNew: true },
];

/**
 * 계산기 외에 제공되는 기타 메뉴 목록 (인사이트, 소개 등)
 */
export const OTHER_MENU = [
    { name: '인사이트', href: '/insight', icon: 'BookOpen' },
    { name: '소개', href: '/about', icon: 'User' },
    { name: '이용약관', href: '/terms', icon: 'FileText' },
    { name: '개인정보처리방침', href: '/privacy', icon: 'Lock' },
];
