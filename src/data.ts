/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Notice, CheerTeam, KCFEvent, SafetyRule, Athlete, AssociationInfo, CompetitionPost, DonationRecord, MediaPost } from './types';

export const INITIAL_NOTICES: Notice[] = [];

export const INITIAL_TEAMS: CheerTeam[] = [];

export const SAFETY_RULES: SafetyRule[] = [];

export const INITIAL_ATHLETES: Athlete[] = [];

export const EVENTS: KCFEvent[] = [];

export const INITIAL_DONATION_RECORDS: DonationRecord[] = [];

export const INITIAL_MEDIA_POSTS: MediaPost[] = [
  {
    id: 'photo-1',
    type: 'photo',
    title: '2026 전국 치어리딩 챔피언십 현장 포토 갤러리',
    date: '2026-06-15',
    views: 142,
    isImportant: true,
    content: '2026 전국 치어리딩 챔피언십 무대 현장 스케치 사진입니다. 열정적인 국가대표 및 전국 올스타 팀들의 화려한 퍼포먼스 순간을 전합니다.',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&q=80&w=1200'
    ]
  },
  {
    id: 'video-1',
    type: 'video',
    title: '대한민국 치어리딩 국가대표 팀 ICU 세계선수권 하이라이트',
    date: '2026-05-20',
    views: 310,
    isImportant: true,
    videoDescription: 'ICU 세계 치어리딩 선수권 대회에 출전한 대한민국 대표팀의 웅장하고 역동적인 고난도 피라미드 및 스턴트 퍼포먼스 영상입니다.',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube'
  },
  {
    id: 'press-1',
    type: 'press',
    title: '[스포츠한국] 한국치어리딩협회, 2026 아시아 치어리딩 대회 유치 확정',
    date: '2026-04-10',
    views: 228,
    pressName: '스포츠한국',
    summary: '사단법인 한국치어리딩협회(KCF)가 2026 아시아 치어리딩 챔피언십 공식 유치에 성공했다고 밝혔다. 이번 대회에는 15개국 이상 참가할 예정이다.',
    content: '사단법인 한국치어리딩협회(KCF, 회장 강훈)는 세계치어리딩연맹(ICU) 및 아시아치어리딩연맹 총회에서 2026년 아시아 치어리딩 챔피언십 개최지로 최종 확정되었다고 발표했습니다.\n\n강훈 회장은 "대한민국 치어리딩의 수준 높은 위상과 국제적 경쟁력을 공식 입증한 계기"라며 "전국 지자체 및 체육계와 긴밀히 협력하여 성공적인 대회를 개최하겠다"고 포부를 밝혔습니다.',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200',
    originalUrl: 'https://sports.hankooki.com'
  }
];

export const INITIAL_ASSOCIATION_INFO: AssociationInfo = {
  officeName: 'KCF 서울 중앙 사무국',
  address: '서울특별시 강서구 양천로 470, 지하 1층 비 106-14-1호',
  phone: '010-6233-2779',
  fax: '0504-012-2779',
  email: ' kcf.hoony@gmail.com',
  permitNumber: '525-82-00922',
  businessNumber: '250121-0005545',
  representative: '강훈'
};

export const INITIAL_COMPETITIONS: CompetitionPost[] = [];




