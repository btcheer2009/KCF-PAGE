/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Notice, CheerTeam, KCFEvent, SafetyRule, Athlete, AssociationInfo, CompetitionPost, DonationRecord } from './types';

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    category: 'selection',
    title: '2027 ICU 세계치어리딩선수권대회 대한민국 국가대표선수 선발전 요강',
    content: '사단법인 한국치어리딩협회(KCF)에서는 2027년 미국 올랜도에서 개최되는 ICU 세계치어리딩선수권대회에 참가할 대한민국 국가대표 및 상비군 국가대표 선발전을 다음과 같이 개최합니다.\n\n■ 일시: 2026년 11월 14일 (토) 10:00\n■ 장소: 서울올림픽공원 핸드볼경기장\n■ 신청 기간: 2026년 10월 1일 ~ 10월 31일\n■ 대상: 협회 등록 선수 및 만 14세 이상 대한민국 국적 소유자\n■ 선발 부문:\n  - 팀 치어 코에드 (Coed Elite/Premier)\n  - 팀 치어 올피메일 (All Girl Elite/Premier)\n  - 더블 힙합 및 더블 프리스타일 폼\n\n상세 규정 및 음악 사용 동의서는 첨부파일을 참조하시기 바라며, 대한민국 치어리딩의 기상을 세계에 알릴 재능 있는 선수들의 많은 참여 바랍니다.',
    date: '2026-06-20',
    views: 342,
    isImportant: true,
  },
  {
    id: 'notice-2',
    category: 'education',
    title: '2026 하반기 치어리딩 지도자(Coaching) 자격 연수 및 안전 교육 프로그램 안내',
    content: '치어리딩의 안전한 보급과 전문 지도자 양성을 위한 2026년도 하반기 지도자 자격 연수를 진행합니다.\n\n■ 교육 일정: 2026년 9월 5일(토) ~ 9월 6일(일), 2일간\n■ 교육 장소: KCF 중앙연수원 (경기도 수원)\n■ 참가 대상:\n  - 치어리딩 팀 지도 희망자 및 현직 교사\n  - 협회 3급 자격 취득 후 1년 이상 경과자 (2급 승급 대상)\n■ 주요 과목: 스턴트 안전 보조법(Spotting), 피라미드 물리 설계, 종목별 채점 규정, 스포츠 인권\n■ 접수 기한: 2026년 8월 25일까지 온라인 접수',
    date: '2026-06-18',
    views: 189,
    isImportant: true,
  },
  {
    id: 'notice-3',
    category: 'competition',
    title: '제15회 삼척 전국 치어리딩 페스티벌 대회 일정 및 규정안 공고',
    content: '전국의 치어리딩 클럽 및 엘리트 팀들이 모여 실력을 겨루는 국내 최대의 축제, "제15회 삼척 전국 치어리딩 페스티벌"의 일정이 확정되었습니다.\n\n■ 대회 일자: 2026년 8월 21일(금) ~ 8월 23일(일)\n■ 대회 장소: 강원특별자치도 삼척시 해수욕장 특설무대\n■ 참가 부문:\n  - 프리스타일 폼 치어 (팀/더블)\n  - 힙합 치어 (팀/더블)\n  - 팀 치어 (클럽 디비전 / 엘리트 디비전)\n\n바다를 배경으로 펼쳐지는 이번 대회에 많은 참여 바랍니다.',
    date: '2026-06-15',
    views: 512,
    isImportant: false,
  },
  {
    id: 'notice-4',
    category: 'general',
    title: '체육동호회 치어리딩 교실 활성화 지원 사업 공모 안내',
    content: '문화체육관광부와 대한체육회가 후원하고 한국치어리딩협회가 주관하는 "체육동호회 치어리딩 교실"을 운영할 시·도지부를 모집합니다.\n\n■ 지원 예산: 동호회별 강사비 및 용품 구매비 전액 지원\n■ 신청 기간: 2026년 7월 10일 한\n■ 제출 서류: 사업 계획서 및 강사 이력서',
    date: '2026-06-10',
    views: 125,
    isImportant: false,
  },
  {
    id: 'notice-5',
    category: 'admin',
    title: 'KCF 공식 선수 등록 및 이적에 관한 규정 개정안 안내',
    content: '선수들의 공정한 이적 권리를 보장하고 학원 폭력 예방과 안전한 훈련 시스템을 안착시키기 위해 KCF 선수등록 및 이적 규정 제8조가 개정되었습니다. 상세 내용은 첨부 문서를 다운로드하여 숙지해 주시기 바랍니다.',
    date: '2026-06-01',
    views: 298,
    isImportant: false,
  }
];

export const INITIAL_TEAMS: CheerTeam[] = [
  {
    id: 'team-1',
    name: '아레나 올스타즈 (Arena Allstars)',
    category: 'allstar',
    region: '서울',
    memberCount: 32,
    coach: '김현우',
    established: '2015-03-10',
    description: '대한민국 올스타 치어리딩의 선두주자로, ICU 세계대회 한국 대표로 다수 참가한 명문 팀입니다.',
    contact: '02-544-9892'
  },
  {
    id: 'team-2',
    name: '블랙 이글스 (Black Eagles)',
    category: 'allstar',
    region: '경기',
    memberCount: 24,
    coach: '이지원',
    established: '2018-05-20',
    description: '팀 치어 코에드 코어 스턴트와 정교한 아크로바틱을 전문으로 하는 강력한 엘리트 고등부/일반부 연합 팀입니다.',
    contact: '031-722-1209'
  },
  {
    id: 'team-3',
    name: '경희대학교 라온 (KHU LAON)',
    category: 'university',
    region: '서울',
    memberCount: 28,
    coach: '박서준',
    established: '2012-09-15',
    description: '대학 치어리딩 연맹의 핵심 주축으로, 대학부 대회에서 화려한 액션과 독창적인 퍼포먼스로 매년 대상을 휩쓰는 팀입니다.',
    contact: '010-8821-3944'
  },
  {
    id: 'team-4',
    name: '레인보우 주니어 (Rainbow Junior)',
    category: 'club',
    region: '부산',
    memberCount: 18,
    coach: '최예원',
    established: '2021-01-11',
    description: '초·중학생으로 구성된 클럽팀으로, 유소년들의 체력 단련과 협동심 기르기를 최우선 목표로 두고 활동하고 있습니다.',
    contact: '051-463-0091'
  },
  {
    id: 'team-5',
    name: '스카이 하이 (Sky High)',
    category: 'allstar',
    region: '대구',
    memberCount: 20,
    coach: '장도윤',
    established: '2020-07-04',
    description: '공중 토스(Basket Toss)와 3단 피라미드에서 압도적인 높이와 안전성을 자랑하는 남부권 최고의 올스타 팀입니다.',
    contact: '053-294-8831'
  }
];

export const EVENTS: KCFEvent[] = [
  {
    id: 'event-1',
    title: '제15회 삼척 전국 치어리딩 페스티벌',
    date: '2026-08-21 ~ 2026-08-23',
    type: 'domestic',
    location: '삼척해수욕장 야외 야외특설무대',
    status: 'upcoming',
    description: '바다와 치어리딩의 축제! 전 종목 야외 비치 페스티벌.'
  },
  {
    id: 'event-5',
    title: '2026 ICU 아시아 치어리딩 오픈',
    date: '2026-11-27 ~ 2026-11-29',
    type: 'international',
    location: '일본 도쿄 요요기 국립경기장',
    status: 'upcoming',
    description: '아시아 각국의 최정상급 치어리딩 팀들이 모이는 공식 국제대회.'
  },
  {
    id: 'event-2',
    title: '지도자 및 심판 보수 교육 (2학기)',
    date: '2026-09-05 ~ 2026-09-06',
    type: 'education',
    location: 'KCF 중앙훈련장 (경기도)',
    status: 'upcoming',
    description: '스턴트 안전 규칙 보강 및 고난도 피라미드 보조 규정 교육.'
  },
  {
    id: 'event-3',
    title: '2027 세계선수권 국가대표 1차 선발전',
    date: '2026-11-14',
    type: 'selection',
    location: '서울 올림픽공원 핸드볼경기장',
    status: 'upcoming',
    description: 'ICU 세계치어리딩선수권대회에 진출할 정예 대한민국 국가대표 선발.'
  },
  {
    id: 'event-4',
    title: '2026 KCF 정기 대의원 총회 및 포럼',
    date: '2026-06-28',
    type: 'seminar',
    location: '서울 스포 타임 세미나실',
    status: 'ongoing',
    description: '한국 치어리딩의 스포츠 안전화 방안 및 발전 로드맵 발표.'
  }
];

export const SAFETY_RULES: SafetyRule[] = [
  {
    id: 'rule-1',
    level: 'Level 1 (기초)',
    category: 'stunt',
    title: '스턴트 기초 - 싸이 스트레치 및 프렙(Prep)',
    rules: [
      '스턴트 진행 시 반드시 최소 1명의 스포터(Spotter)가 헤드 및 숄더 영역을 보호해야 합니다.',
      '베이스 선수는 항시 플라이어 선수의 힙(Hip) 정렬 상태를 주시해야 합니다.',
      '어깨 이상 높이의 모든 릴리즈(Release) 기술은 전면 금지됩니다.'
    ],
    tips: '처음 스턴트를 배울 때는 힘보다는 베이스와 플라이어의 코어 긴장도를 맞춰 균형을 잡는 훈련이 필요합니다.',
    difficulty: 'low'
  },
  {
    id: 'rule-2',
    level: 'Level 2 (초급)',
    category: 'stunt',
    title: '익스텐션(Extension) 및 기본 크래들 하차',
    rules: [
      '익스텐션 스턴트 시에는 크래들 하차 전 반드시 머리와 어깨를 안전하게 받치는 백스포터가 필수적으로 동반됩니다.',
      '싱글 베이스 익스텐션 스턴트는 보조 스포터가 탑 플라이어 옆에 1명 이상 상주해야 허용됩니다.'
    ],
    tips: '익스텐션은 베이스의 팔을 수직으로 귀 옆에 완전히 잠그는(Lock) 잠금 장치가 관건입니다. 힘의 손실을 방지하세요.',
    difficulty: 'medium'
  },
  {
    id: 'rule-3',
    level: 'Level 3 (중급)',
    category: 'pyramid',
    title: '2.5단 피라미드 연결 및 릴리즈 전환',
    rules: [
      '피라미드의 최상층 플라이어는 반드시 하층 베이스와 지속적인 신체 접촉(Hand-to-Hand 또는 Hand-to-Foot)을 유지해야 합니다.',
      '트위스팅 회전을 동반한 피라미드 빌드업 시, 각 베이스는 회전 반경 내 보조 매트를 설치해야 합니다.'
    ],
    tips: '피라미드가 올라갈 때 전원 타이밍 싱크가 맞아야 흔들림을 막을 수 있습니다. 구령을 크고 확실하게 부르세요.',
    difficulty: 'high'
  },
  {
    id: 'rule-4',
    level: 'Level 4 (고급)',
    category: 'toss',
    title: '바스켓 토스(Basket Toss) 공중 회전 규정',
    rules: [
      '토스를 통해 방출되는 플라이어는 공중에서 1회전(Twist) 이내의 동작만 수행해야 합니다. (360도 초과 공중제비 금지)',
      '토스를 받는 베이스들은 최소 3명으로 구성되며, 플라이어의 등과 목 머리를 안전하게 캐치해야 합니다.'
    ],
    tips: '바스켓 토스에서는 베이스들의 팔 힘이 아니라 다리 굽힘과 팝(Pop) 에너지를 수직으로 전달하는 합이 중요합니다.',
    difficulty: 'high'
  },
  {
    id: 'rule-5',
    level: 'Level 5 (최고급/엘리트)',
    category: 'tumbling',
    title: '엘리트 아크로바틱 및 러닝 텀블링',
    rules: [
      '더블 트위스트를 포함한 러닝 텀블링은 반드시 스프링 플로어 혹은 규격화된 매트에서만 실행할 수 있습니다.',
      '훈련 도중 플라이어의 공중 텀블링 시에는 지도 자격증을 소지한 수석 지도자가 항시 감독해야 합니다.'
    ],
    tips: '목표 지점 착지 시 발목과 무릎 보호를 위해 고관절을 유연하게 활용하고 무리한 트위스트 회전각을 삼가야 합니다.',
    difficulty: 'expert'
  }
];

export const INITIAL_ATHLETES: Athlete[] = [
  {
    id: 'athlete-1',
    name: 'ooo',
    regNumber: 'KCF-2026-0101',
    birthDate: '2005-08-14',
    gender: '남',
    teamName: '아레나 올스타즈 (Arena Allstars)',
    category: '치어리딩',
    level: '지도자 (클래스2)',
    registerDate: '2026-01-10',
    validUntil: '2027-02-28',
    status: '정상등록'
  },
  {
    id: 'athlete-2',
    name: '이서연',
    regNumber: 'KCF-2026-0102',
    birthDate: '2004-12-05',
    gender: '여',
    teamName: '경희대학교 라온 (KHU LAON)',
    category: '치어리딩',
    level: '일반선수',
    registerDate: '2026-01-15',
    validUntil: '2027-02-28',
    status: '정상등록'
  },
  {
    id: 'athlete-3',
    name: '박지훈',
    regNumber: 'KCF-2026-0103',
    birthDate: '2007-03-22',
    gender: '남',
    teamName: '블랙 이글스 (Black Eagles)',
    category: '치어리딩',
    level: '지도자 (클래스1)',
    registerDate: '2026-01-20',
    validUntil: '2027-02-28',
    status: '정상등록'
  },
  {
    id: 'athlete-4',
    name: '최예린',
    regNumber: 'KCF-2026-0104',
    birthDate: '2012-05-18',
    gender: '여',
    teamName: '레인보우 주니어 (Rainbow Junior)',
    category: '치어리딩',
    level: '일반선수',
    registerDate: '2026-03-01',
    validUntil: '2027-02-28',
    status: '정상등록'
  },
  {
    id: 'athlete-5',
    name: '정우진',
    regNumber: 'KCF-2026-0105',
    birthDate: '2006-11-30',
    gender: '남',
    teamName: '스카이 하이 (Sky High)',
    category: '치어리딩',
    level: '지도자 (클래스1)',
    registerDate: '2026-02-05',
    validUntil: '2027-02-28',
    status: '정상등록'
  },
  {
    id: 'athlete-6',
    name: '한소희',
    regNumber: 'KCF-2026-0106',
    birthDate: '2005-01-25',
    gender: '여',
    teamName: '아레나 올스타즈 (Arena Allstars)',
    category: '치어리딩',
    level: '지도자 (클래스2)',
    registerDate: '2026-01-12',
    validUntil: '2027-02-28',
    status: '정상등록'
  },
  {
    id: 'athlete-7',
    name: '강동현',
    regNumber: 'KCF-2026-0107',
    birthDate: '2003-07-09',
    gender: '남',
    teamName: '블랙 이글스 (Black Eagles)',
    category: '치어리딩',
    level: '지도자 (클래스2)',
    registerDate: '2026-01-22',
    validUntil: '2027-02-28',
    status: '갱신필요'
  },
  {
    id: 'athlete-8',
    name: '윤아름',
    regNumber: 'KCF-2026-0108',
    birthDate: '2004-09-17',
    gender: '여',
    teamName: '경희대학교 라온 (KHU LAON)',
    category: '치어리딩',
    level: '일반선수',
    registerDate: '2026-01-18',
    validUntil: '2027-02-28',
    status: '정상등록'
  }
];

export const INITIAL_ASSOCIATION_INFO: AssociationInfo = {
  officeName: 'KCF 서울 중앙 사무국',
  address: '서울특별시 송파구 올림픽로 424 올림픽공원 한라관 203호',
  phone: '02-421-8890',
  fax: '02-421-8891',
  email: 'kcf_office@cheerleading.or.kr',
  permitNumber: '제2013-11-0043호',
  businessNumber: '220-82-14881',
  representative: '이성규'
};

export const INITIAL_COMPETITIONS: CompetitionPost[] = [
  {
    id: 'comp-1',
    category: 'domestic',
    title: '제15회 삼진제약배 전국 치어리딩 챔피언십 개최 요강 및 신청 안내',
    content: '전국의 치어리딩 동호인 및 엘리트 선수들의 화합의 장, 제15회 전국 치어리딩 챔피언십이 개최됩니다.\n\n■ 일시: 2026년 9월 12일 (토)\n■ 장소: 서울 장충체육관\n■ 주최: 사단법인 한국치어리딩협회 (KCF)\n■ 참가 부문:\n  - 클럽팀 부문 (올스타, 대학, 일반)\n  - 학교팀 부문 (초등, 중등, 고등, 대학)\n  - 퍼포먼스 치어 (프리스타일 폼, 힙합, 재즈)\n\n■ 시상 내역:\n  - 종합 우승: 트로피, 상장 및 훈련지원금 200만 원\n  - 각 부문 1~3위: 상장 및 메달 수여\n\n■ 참가 신청:\n  - 기간: 2026년 8월 1일 ~ 8월 25일\n  - 방법: KCF 홈페이지 내 온라인 접수\n\n선수 여러분의 많은 관심과 참여를 부탁드리며, 안전 규정을 준수한 멋진 연기를 기대합니다.',
    date: '2026-06-22',
    views: 124,
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
    organizer: '사단법인 한국치어리딩협회 (KCF)',
    location: '서울 장충체육관',
    compDate: '2026-09-12'
  },
  {
    id: 'comp-2',
    category: 'domestic',
    title: '2026 한국치어리딩협회장배 전국 학교 치어리딩 대회 개최',
    content: '청소년들의 건강한 신체 발달과 치어리딩 스포츠 문화 대중화를 위한 학교 치어리딩 대회가 열립니다.\n\n■ 일시: 2026년 10월 24일 (토) 13:00\n■ 장소: 경기 수원실내체육관\n■ 참가 자격: 전국 초·중·고등학교 소속 치어리딩 동아리 및 방과 후 팀\n■ 경기 규정: KCF 학교 치어리딩 가이드라인 준수 (안전 레벨 1~2 제한)\n\n체육 교육 활성화 및 스포츠맨십 고취를 목표로 하는 이번 대회에 각급 학교 지도자 및 학생분들의 적극적인 관심 바랍니다.',
    date: '2026-06-18',
    views: 89,
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    organizer: '한국치어리딩협회 경기도지부',
    location: '경기 수원실내체육관',
    compDate: '2026-10-24'
  },
  {
    id: 'comp-3',
    category: 'international',
    title: '2026 ICU 아시아 치어리딩 오픈 챔피언십 국가대표단 출정 안내',
    content: '일본 도쿄에서 개최되는 2026 ICU 아시아 치어리딩 오픈에 대한민국 국가대표 파견 및 응원 안내단 일정을 공지합니다.\n\n■ 개최 기간: 2026년 11월 27일 ~ 11월 29일 (3일간)\n■ 개최 장소: 일본 도쿄 요요기 국립경기장\n■ 파견 규모: 선수 24명, 임원 및 코칭스태프 6명 (총 30명)\n\n아시아 최정상급 팀들이 모이는 이번 무대에서 대한민국 국가대표팀이 최고의 기량을 펼칠 수 있도록, 전국의 치어리딩 가족 여러분들의 뜨거운 격려와 응원 부탁드립니다.',
    date: '2026-06-25',
    views: 156,
    imageUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=800',
    organizer: '세계치어리딩연맹 (ICU), 아시아치어리딩연맹',
    location: '일본 도쿄 요요기 국립경기장',
    compDate: '2026-11-27 ~ 2026-11-29'
  }
];

export const INITIAL_DONATION_RECORDS: DonationRecord[] = [
  {
    id: 'donation-2026',
    year: 2026,
    donationAmount: '해당 연도 종료 후 공개 예정',
    usedAmount: '해당 연도 종료 후 공개 예정',
    usageDetails: '자료 준비 중',
    status: 'pending',
    docUrl: ''
  },
  {
    id: 'donation-2025',
    year: 2025,
    donationAmount: '12,500,000원',
    usedAmount: '12,500,000원',
    usageDetails: '국가대표 유소년 훈련 지원 및 피라미드 보조 장비 구입',
    status: 'public',
    docUrl: 'https://www.nts.go.kr'
  },
  {
    id: 'donation-2024',
    year: 2024,
    donationAmount: '8,400,000원',
    usedAmount: '8,400,000원',
    usageDetails: '전국 학교 스포츠클럽 치어리딩 교실 안전 매트 지원',
    status: 'public',
    docUrl: 'https://www.nts.go.kr'
  }
];




