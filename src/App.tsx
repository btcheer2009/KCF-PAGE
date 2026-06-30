/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, MapPin, ArrowUpRight, Menu, X, Trophy, ShieldCheck, Award, 
  Activity, Sparkles, TrendingUp, Heart, Info, ArrowRight, CheckCircle, Flame,
  Database, Settings, Plus, Trash2, Edit, Inbox, Users, User, Megaphone, ShieldAlert, RefreshCw,
  Image, Lock, UserCheck, Upload, Type, Building2
} from 'lucide-react';

import NoticeBoard from './components/NoticeBoard';
import TeamRegistry from './components/TeamRegistry';
import InquiryHub from './components/InquiryHub';
import AthleteLookup from './components/AthleteLookup';
import CompetitionBoard from './components/CompetitionBoard';
import ScheduleCalendar from './components/ScheduleCalendar';
import DonationDisclosure from './components/DonationDisclosure';
import { EVENTS, INITIAL_NOTICES, INITIAL_TEAMS, INITIAL_ATHLETES, INITIAL_ASSOCIATION_INFO, INITIAL_COMPETITIONS, INITIAL_DONATION_RECORDS } from './data';
import { Notice, CheerTeam, InquirySubmission, KCFEvent, Athlete, AssociationInfo, CompetitionPost, DonationRecord } from './types';
import { listenCollection, listenDoc, saveItem, deleteItem, saveDoc, seedInitialCollection, seedInitialDoc } from './lib/db';


const DEFAULT_IMAGES = {
  heroBg: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200',
  badgeImg: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=400',
  mosaic1: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=500',
  mosaic2: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500',
  mosaic3: 'https://images.unsplash.com/photo-1508847154043-be12a26c86c5?auto=format&fit=crop&q=80&w=500',
  icuLogo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=120',
  associationLogo: '',
};

const DEFAULT_CATEGORY_HEADERS = {
  schedule: {
    badge: 'KCF TIMELINE REGISTRY',
    title: '한국치어리딩협회 일정',
    desc: '전국의 팀들과 지도자들을 위해 다가오는 KCF 공식 대회, 자격증 연수, 그리고 국가대표 선발전 상세 일정을 전해드립니다.'
  },
  competitions: {
    badge: 'KCF TOURNAMENT REGISTRY',
    title: 'KCF 공식 대회 및 챔피언십 정보',
    desc: '사단법인 한국치어리딩협회가 주관하는 공식 국내대회 및 연대 국제대회 일정 정보입니다.'
  },
  teams: {
    badge: 'KCF REGISTERED CLUBS',
    title: '전국 지부별 공인 등록팀 및 아카데미 현황',
    desc: '한국치어리딩협회(KCF)에 정식 가입 및 인가되어 활동하고 있는 소속 클럽, 학교 스포츠클럽 및 전문 교육 아카데미의 공식 명단입니다.'
  },
  athletes: {
    badge: 'KCF INTEGRATED REGISTRY',
    title: '사무처 공인 선수 자격 조회 시스템',
    desc: '한국치어리딩협회(KCF) 전산 데이터베이스에 공식 승인 등록된 지도자 및 선수단의 자격을 실시간으로 조회합니다. 등록 성명 또는 선수 등록번호를 입력해 주십시오.'
  },
  notice: {
    badge: 'KCF NOTICE BOARD',
    title: 'KCF 공식 새소식 & 알림마당',
    desc: '대한민국 치어리딩의 주요 소식, 일정 및 행정 사항을 가장 빠르고 정확하게 전달합니다.'
  },
  contact: {
    badge: 'KCF INQUIRY HUB',
    title: 'KCF 소통 및 문의 허브',
    desc: '협회 등록 문의, 가입 심사, 연수 안내 등 모든 공식 질의사항을 신속하게 답변해 드립니다.'
  },
  donations: {
    badge: 'KCF DONATION DISCLOSURE',
    title: '연간 기부금 모금액 및 활용실적',
    desc: '사단법인 한국치어리딩협회는 기부금의 투명한 운영을 위해 연간 기부금 모금액 및 활용실적을 공정하고 투명하게 공개합니다.'
  }
};

const DEFAULT_CORE_PROMISES = [
  {
    num: '01',
    title: '공정성과 투명한 신뢰',
    desc: '국가대표 선수 선발 과정을 객관적인 ICU 규정에 맞추어 완전 공개하고, 상벌위원회 및 자문위원단을 통해 학계와 업계에서 가장 신뢰받는 무대를 운영합니다.',
  },
  {
    num: '02',
    title: '선수 중심 훈련 환경',
    desc: '선수의 건강, 부상 시 신속한 보상 및 보험 혜택 지원, 그리고 권익 보호 센터를 상시 가동합니다. 선수의 흘린 땀방울이 오롯이 보장받는 스포츠 복지를 안착시킵니다.',
  },
  {
    num: '03',
    title: '최고 수준의 안전 제일',
    desc: '체계화된 지도자 연수, 국제공인 심판단 교육, 그리고 스턴트 보조법(Spotting) 이수 의무제를 통해 0%의 부상률을 지향하는 고밀도 안전 훈련 인프라를 전파합니다.',
  }
];

export default function App() {
  const saveTimersRef = React.useRef<{ [key: string]: any }>({});

  const debouncedSaveDoc = (colName: string, docId: string, data: any, delay = 800) => {
    const key = `${colName}/${docId}`;
    if (saveTimersRef.current[key]) {
      clearTimeout(saveTimersRef.current[key]);
    }
    saveTimersRef.current[key] = setTimeout(async () => {
      try {
        await saveDoc(colName, docId, data);
      } catch (e) {
        console.error(`Error saving ${key}:`, e);
      }
      delete saveTimersRef.current[key];
    }, delay);
  };

  const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [scheduleViewMode, setScheduleViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null); // null = connecting, true = connected, false = failed
  
  // Shared States (Lifting state so Admin and components are in perfect sync!)
  const [notices, rawSetNotices] = useState<Notice[]>([]);
  const [teams, rawSetTeams] = useState<CheerTeam[]>([]);
  const [inquiries, rawSetInquiries] = useState<InquirySubmission[]>([]);
  const [events, rawSetEvents] = useState<KCFEvent[]>([]);
  const [scheduleCategories, rawSetScheduleCategories] = useState<{ id: string; label: string }[]>([
    { id: 'domestic', label: '국내 대회' },
    { id: 'international', label: '국제 대회' },
    { id: 'education', label: '지도자 교육' },
    { id: 'selection', label: '국가대표 선발' },
    { id: 'seminar', label: '정기 세미나' }
  ]);
  const [teamCategories, rawSetTeamCategories] = useState<{ id: string; label: string }[]>([
    { id: 'allstar', label: '올스타 치어 (Allstar)' },
    { id: 'university', label: '대학 치어 동아리 (University)' },
    { id: 'club', label: '클럽 치어 동단 (Club)' }
  ]);
  const [teamRegions, rawSetTeamRegions] = useState<string[]>(['서울', '경기', '부산', '대구', '강원', '인천', '충청', '전라']);
  const [athletes, rawSetAthletes] = useState<Athlete[]>([]);
  const [associationInfo, rawSetAssociationInfo] = useState<AssociationInfo>(INITIAL_ASSOCIATION_INFO);
  const [competitions, rawSetCompetitions] = useState<CompetitionPost[]>([]);
  const [donations, rawSetDonations] = useState<DonationRecord[]>([]);

  // Helper function to sync array collections with Firestore
  const syncCollectionToFirestore = async <T extends { id: string }>(
    colName: string,
    nextList: T[],
    prevList: T[]
  ) => {
    try {
      const prevMap = new Map(prevList.map(item => [item.id, item]));
      
      // Save added or modified items
      for (const item of nextList) {
        const prevItem = prevMap.get(item.id);
        if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
          await saveItem(colName, item.id, item);
        }
      }

      // Delete removed items
      const nextSet = new Set(nextList.map(item => item.id));
      for (const prevItem of prevList) {
        if (!nextSet.has(prevItem.id)) {
          await deleteItem(colName, prevItem.id);
        }
      }
    } catch (e) {
      console.error(`Error syncing collection ${colName}:`, e);
    }
  };

  // Wrapped Sync Setters (exposed to child components and event handlers to sync automatically)
  const setNotices = (action: React.SetStateAction<Notice[]>) => {
    rawSetNotices((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        syncCollectionToFirestore('notices', next, prev);
      }, 0);
      return next;
    });
  };

  const setTeams = (action: React.SetStateAction<CheerTeam[]>) => {
    rawSetTeams((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        syncCollectionToFirestore('teams', next, prev);
      }, 0);
      return next;
    });
  };

  const setInquiries = (action: React.SetStateAction<InquirySubmission[]>) => {
    rawSetInquiries((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        syncCollectionToFirestore('inquiries', next, prev);
      }, 0);
      return next;
    });
  };

  const setEvents = (action: React.SetStateAction<KCFEvent[]>) => {
    rawSetEvents((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        syncCollectionToFirestore('events', next, prev);
      }, 0);
      return next;
    });
  };

  const setAthletes = (action: React.SetStateAction<Athlete[]>) => {
    rawSetAthletes((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        syncCollectionToFirestore('athletes', next, prev);
      }, 0);
      return next;
    });
  };

  const setCompetitions = (action: React.SetStateAction<CompetitionPost[]>) => {
    rawSetCompetitions((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        syncCollectionToFirestore('competitions', next, prev);
      }, 0);
      return next;
    });
  };

  const setDonations = (action: React.SetStateAction<DonationRecord[]>) => {
    rawSetDonations((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        syncCollectionToFirestore('donations', next, prev);
      }, 0);
      return next;
    });
  };

  const setSiteImages = (action: React.SetStateAction<typeof DEFAULT_IMAGES>) => {
    rawSetSiteImages((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        debouncedSaveDoc('settings', 'site_images', next, 800);
      }, 0);
      return next;
    });
  };

  const setCategoryHeaders = (action: React.SetStateAction<typeof DEFAULT_CATEGORY_HEADERS>) => {
    rawSetCategoryHeaders((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        debouncedSaveDoc('settings', 'category_headers', next, 800);
      }, 0);
      return next;
    });
  };

  const setCorePromises = (action: React.SetStateAction<typeof DEFAULT_CORE_PROMISES>) => {
    rawSetCorePromises((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        debouncedSaveDoc('settings', 'core_promises', { list: next }, 800);
      }, 0);
      return next;
    });
  };

  const setAdminPassword = (action: React.SetStateAction<string>) => {
    rawSetAdminPassword((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        debouncedSaveDoc('settings', 'admin_config', { password: next }, 800);
      }, 0);
      return next;
    });
  };

  const setTeamCategories = (action: React.SetStateAction<{ id: string; label: string }[]>) => {
    rawSetTeamCategories((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        debouncedSaveDoc('settings', 'team_categories', { list: next }, 800);
      }, 0);
      return next;
    });
  };

  const setTeamRegions = (action: React.SetStateAction<string[]>) => {
    rawSetTeamRegions((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        debouncedSaveDoc('settings', 'team_regions', { list: next }, 800);
      }, 0);
      return next;
    });
  };

  const setScheduleCategories = (action: React.SetStateAction<{ id: string; label: string }[]>) => {
    rawSetScheduleCategories((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        debouncedSaveDoc('settings', 'schedule_categories', { list: next }, 800);
      }, 0);
      return next;
    });
  };

  const setAssociationInfo = (action: React.SetStateAction<AssociationInfo>) => {
    rawSetAssociationInfo((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      setTimeout(() => {
        debouncedSaveDoc('settings', 'association_info', next, 800);
      }, 0);
      return next;
    });
  };


  const [currentTab, setCurrentTab] = useState<'home' | 'schedule' | 'competitions' | 'teams' | 'athletes' | 'notice' | 'contact' | 'donations'>('home');

  const handleTabChange = (tab: 'home' | 'schedule' | 'competitions' | 'teams' | 'athletes' | 'notice' | 'contact' | 'donations') => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Site dynamic images
  const [siteImages, rawSetSiteImages] = useState<typeof DEFAULT_IMAGES>(DEFAULT_IMAGES);
  const [headerLogoFailed, setHeaderLogoFailed] = useState(false);
  const [footerLogoFailed, setFooterLogoFailed] = useState(false);

  useEffect(() => {
    setHeaderLogoFailed(false);
    setFooterLogoFailed(false);
  }, [siteImages.associationLogo]);
 
  // Category dynamic headers (Editable by admin, unified centered design)
  const [categoryHeaders, rawSetCategoryHeaders] = useState<typeof DEFAULT_CATEGORY_HEADERS>(DEFAULT_CATEGORY_HEADERS);
 
  // Core three promises state (editable by manager)
  const [corePromises, rawSetCorePromises] = useState<typeof DEFAULT_CORE_PROMISES>(DEFAULT_CORE_PROMISES);
 
  // Admin Notice Form states
  const [showAddNoticeForm, setShowAddNoticeForm] = useState(false);
  const [adminEditingNotice, setAdminEditingNotice] = useState<Notice | null>(null);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'competition' | 'education' | 'selection' | 'general' | 'admin'>('general');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeIsImportant, setNewNoticeIsImportant] = useState(false);

  // Admin Security States
  const [adminPassword, rawSetAdminPassword] = useState('bt2009');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);
 
  // Admin Panel states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminDashboardModal, setShowAdminDashboardModal] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'stats' | 'notices' | 'teams' | 'inquiries' | 'schedules' | 'images' | 'athletes' | 'association' | 'competitions' | 'headers' | 'donations'>('stats');
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'contact' | 'team_reg'>('all');

  const adminActiveTabRef = React.useRef(adminActiveTab);
  useEffect(() => {
    adminActiveTabRef.current = adminActiveTab;
  }, [adminActiveTab]);

  // Admin Donations states
  const [showAddDonationForm, setShowAddDonationForm] = useState(false);
  const [adminEditingDonation, setAdminEditingDonation] = useState<DonationRecord | null>(null);
  const [newDonationYear, setNewDonationYear] = useState<number>(2026);
  const [newDonationAmount, setNewDonationAmount] = useState('');
  const [newUsedAmount, setNewUsedAmount] = useState('');
  const [newUsageDetails, setNewUsageDetails] = useState('');
  const [newDonationStatus, setNewDonationStatus] = useState<'public' | 'pending' | 'private'>('public');
  const [newDonationDocUrl, setNewDonationDocUrl] = useState('');

  // Admin Association Info Form state
  const [assocOfficeName, setAssocOfficeName] = useState(INITIAL_ASSOCIATION_INFO.officeName || '');
  const [assocAddress, setAssocAddress] = useState(INITIAL_ASSOCIATION_INFO.address || '');
  const [assocPhone, setAssocPhone] = useState(INITIAL_ASSOCIATION_INFO.phone || '');
  const [assocFax, setAssocFax] = useState(INITIAL_ASSOCIATION_INFO.fax || '');
  const [assocEmail, setAssocEmail] = useState(INITIAL_ASSOCIATION_INFO.email || '');
  const [assocPermitNumber, setAssocPermitNumber] = useState(INITIAL_ASSOCIATION_INFO.permitNumber || '');
  const [assocBusinessNumber, setAssocBusinessNumber] = useState(INITIAL_ASSOCIATION_INFO.businessNumber || '');
  const [assocRepresentative, setAssocRepresentative] = useState(INITIAL_ASSOCIATION_INFO.representative || '');

  // Admin schedules form state
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvDate, setNewEvDate] = useState('');
  const [newEvType, setNewEvType] = useState<string>('domestic');
  const [newEvLocation, setNewEvLocation] = useState('');
  const [newEvDescription, setNewEvDescription] = useState('');
  const [newEvStatus, setNewEvStatus] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [adminEditingEvent, setAdminEditingEvent] = useState<KCFEvent | null>(null);
  const [newEvStartDate, setNewEvStartDate] = useState('');
  const [newEvEndDate, setNewEvEndDate] = useState('');
  const [newEvIsRange, setNewEvIsRange] = useState(false);

  // Admin schedules categories states
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [adminEditingComp, setAdminEditingComp] = useState<CompetitionPost | null>(null);
  const [showAddCompForm, setShowAddCompForm] = useState(false);
  const [newCompTitle, setNewCompTitle] = useState('');
  const [newCompCategory, setNewCompCategory] = useState<'domestic' | 'international'>('domestic');
  const [newCompContent, setNewCompContent] = useState('');
  const [newCompImageUrl, setNewCompImageUrl] = useState('');
  const [newCompOrganizer, setNewCompOrganizer] = useState('');
  const [newCompLocation, setNewCompLocation] = useState('');
  const [newCompDateVal, setNewCompDateVal] = useState('');

  // Admin Registered Teams Form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCategory, setNewTeamCategory] = useState<string>('allstar');
  const [newTeamRegion, setNewTeamRegion] = useState<string>(() => teamRegions[0] || '서울');
  const [newTeamMemberCount, setNewTeamMemberCount] = useState<number>(15);
  const [newTeamCoach, setNewTeamCoach] = useState('');
  const [newTeamEstablished, setNewTeamEstablished] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newTeamContact, setNewTeamContact] = useState('');
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);

  // Admin team categories states
  const [editingTeamCatId, setEditingTeamCatId] = useState<string | null>(null);
  const [editingTeamCatLabel, setEditingTeamCatLabel] = useState<string>('');
  const [newTeamCatIdState, setNewTeamCatIdState] = useState<string>('');
  const [newTeamCatLabelState, setNewTeamCatLabelState] = useState<string>('');

  // Admin team regions states
  const [editingTeamRegionIdx, setEditingTeamRegionIdx] = useState<number | null>(null);
  const [editingTeamRegionValue, setEditingTeamRegionValue] = useState<string>('');
  const [newTeamRegionValue, setNewTeamRegionValue] = useState<string>('');

  // Admin Athletes Form state
  const [newAthleteName, setNewAthleteName] = useState('');
  const [newAthleteRegNumber, setNewAthleteRegNumber] = useState('');
  const [newAthleteBirthDate, setNewAthleteBirthDate] = useState('2005-01-01');
  const [newAthleteGender, setNewAthleteGender] = useState<'남' | '여'>('여');
  const [newAthleteTeamName, setNewAthleteTeamName] = useState('');
  const [newAthleteCategory, setNewAthleteCategory] = useState('올스타 치어 (Allstar)');
  const [newAthleteLevel, setNewAthleteLevel] = useState('Level 5 (최고급)');
  const [newAthleteStatus, setNewAthleteStatus] = useState<'정상등록' | '갱신필요' | '정지'>('정상등록');
  const [newAthleteValidUntil, setNewAthleteValidUntil] = useState('2027-02-28');
  const [newAthleteImageUrl, setNewAthleteImageUrl] = useState('');
  const [showAddAthleteForm, setShowAddAthleteForm] = useState(false);

  // Admin Editing states for inline modifications
  const [editingAthleteId, setEditingAthleteId] = useState<string | null>(null);
  const [editingAthleteData, setEditingAthleteData] = useState<Athlete | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamData, setEditingTeamData] = useState<CheerTeam | null>(null);

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Custom Toast State
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });
  const [toastTimer, setToastTimer] = useState<any>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast({
      isOpen: true,
      message,
      type
    });
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, isOpen: false }));
    }, 4000);
    setToastTimer(timer);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Hero Live Count Up States
  const [athleteCount, setAthleteCount] = useState(70000);
  const [teamCount, setTeamCount] = useState(120);
  const [coachCount, setCoachCount] = useState(300);

  // Load state from Firestore on mount
  useEffect(() => {
    // Run initial seeding in a separate async flow to ensure no overwrites
    const initializeDatabase = async () => {
      await Promise.all([
        seedInitialCollection<Notice>('notices', INITIAL_NOTICES),
        seedInitialCollection<CheerTeam>('teams', INITIAL_TEAMS),
        seedInitialCollection<InquirySubmission>('inquiries', []),
        seedInitialCollection<KCFEvent>('events', EVENTS),
        seedInitialCollection<Athlete>('athletes', INITIAL_ATHLETES),
        seedInitialCollection<CompetitionPost>('competitions', INITIAL_COMPETITIONS),
        seedInitialCollection<DonationRecord>('donations', INITIAL_DONATION_RECORDS),
        seedInitialDoc<typeof DEFAULT_IMAGES>('settings', 'site_images', DEFAULT_IMAGES),
        seedInitialDoc<typeof DEFAULT_CATEGORY_HEADERS>('settings', 'category_headers', DEFAULT_CATEGORY_HEADERS),
        seedInitialDoc<{ list: typeof DEFAULT_CORE_PROMISES }>('settings', 'core_promises', { list: DEFAULT_CORE_PROMISES }),
        seedInitialDoc<AssociationInfo>('settings', 'association_info', INITIAL_ASSOCIATION_INFO),
        seedInitialDoc<{ password: string }>('settings', 'admin_config', { password: 'bt2009' }),
        seedInitialDoc<{ list: { id: string; label: string }[] }>('settings', 'team_categories', { list: [
          { id: 'allstar', label: '올스타 치어 (Allstar)' },
          { id: 'university', label: '대학 치어 동아리 (University)' },
          { id: 'club', label: '클럽 치어 동단 (Club)' }
        ] }),
        seedInitialDoc<{ list: string[] }>('settings', 'team_regions', { list: ['서울', '경기', '부산', '대구', '강원', '인천', '충청', '전라'] }),
        seedInitialDoc<{ list: { id: string; label: string }[] }>('settings', 'schedule_categories', { list: [
          { id: 'domestic', label: '국내 대회' },
          { id: 'international', label: '국제 대회' },
          { id: 'education', label: '지도자 교육' },
          { id: 'selection', label: '국가대표 선발' },
          { id: 'seminar', label: '정기 세미나' }
        ] })
      ]);
    };
    
    initializeDatabase();

    // 1. Notices
    const unsubscribeNotices = listenCollection<Notice>('notices', (data) => {
      const sorted = [...data].sort((a, b) => {
        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      rawSetNotices(sorted);
      setIsDbConnected(true);
    }, (error) => {
      console.error("Firestore notices listener failed:", error);
      setIsDbConnected(false);
    });

    // 2. Teams
    const unsubscribeTeams = listenCollection<CheerTeam>('teams', (data) => {
      rawSetTeams(data);
    });

    // 3. Inquiries
    const unsubscribeInquiries = listenCollection<InquirySubmission>('inquiries', (data) => {
      rawSetInquiries(data);
    });

    // 4. Events
    const unsubscribeEvents = listenCollection<KCFEvent>('events', (data) => {
      rawSetEvents(data);
    });

    // 5. Athletes
    const unsubscribeAthletes = listenCollection<Athlete>('athletes', (data) => {
      rawSetAthletes(data);
    });

    // 6. Competitions
    const unsubscribeCompetitions = listenCollection<CompetitionPost>('competitions', (data) => {
      rawSetCompetitions(data);
    });

    // 6.5. Donations
    const unsubscribeDonations = listenCollection<DonationRecord>('donations', (data) => {
      rawSetDonations(data);
    });

    // 7. Site Images
    const unsubscribeImages = listenDoc<typeof DEFAULT_IMAGES>('settings', 'site_images', (data) => {
      if (adminActiveTabRef.current !== 'images') {
        rawSetSiteImages({ ...DEFAULT_IMAGES, ...data });
      }
    });

    // 8. Category Headers
    const unsubscribeHeaders = listenDoc<typeof DEFAULT_CATEGORY_HEADERS>('settings', 'category_headers', (data) => {
      if (adminActiveTabRef.current !== 'headers') {
        if (data) {
          const merged = { ...DEFAULT_CATEGORY_HEADERS };
          for (const key of Object.keys(DEFAULT_CATEGORY_HEADERS) as Array<keyof typeof DEFAULT_CATEGORY_HEADERS>) {
            merged[key] = { ...DEFAULT_CATEGORY_HEADERS[key], ...data[key] };
          }
          rawSetCategoryHeaders(merged);
        } else {
          rawSetCategoryHeaders(DEFAULT_CATEGORY_HEADERS);
        }
      }
    });

    // 9. Core Promises
    const unsubscribePromises = listenDoc<{ list: typeof DEFAULT_CORE_PROMISES }>('settings', 'core_promises', (data) => {
      if (data && Array.isArray(data.list)) {
        rawSetCorePromises(data.list);
      }
    });

    // 10. Association Info
    const unsubscribeAssoc = listenDoc<AssociationInfo>('settings', 'association_info', (data) => {
      if (data) {
        rawSetAssociationInfo(data);
        setAssocOfficeName(data.officeName || INITIAL_ASSOCIATION_INFO.officeName || '');
        setAssocAddress(data.address || INITIAL_ASSOCIATION_INFO.address || '');
        setAssocPhone(data.phone || INITIAL_ASSOCIATION_INFO.phone || '');
        setAssocFax(data.fax || INITIAL_ASSOCIATION_INFO.fax || '');
        setAssocEmail(data.email || INITIAL_ASSOCIATION_INFO.email || '');
        setAssocPermitNumber(data.permitNumber || INITIAL_ASSOCIATION_INFO.permitNumber || '');
        setAssocBusinessNumber(data.businessNumber || INITIAL_ASSOCIATION_INFO.businessNumber || '');
        setAssocRepresentative(data.representative || INITIAL_ASSOCIATION_INFO.representative || '');
        setIsDbConnected(true);
      }
    }, (error) => {
      console.error("Firestore association_info listener failed:", error);
      setIsDbConnected(false);
    });

    // 11. Admin Password
    const unsubscribePassword = listenDoc<{ password: string }>('settings', 'admin_config', (data) => {
      if (data && data.password) {
        rawSetAdminPassword(data.password);
      }
    });

    // 12. Team Categories
    const unsubscribeTeamCategories = listenDoc<{ list: { id: string; label: string }[] }>('settings', 'team_categories', (data) => {
      if (data && Array.isArray(data.list)) {
        rawSetTeamCategories(data.list);
      }
    });

    // 13. Team Regions
    const unsubscribeTeamRegions = listenDoc<{ list: string[] }>('settings', 'team_regions', (data) => {
      if (data && Array.isArray(data.list)) {
        rawSetTeamRegions(data.list);
      }
    });

    // 14. Schedule Categories
    const unsubscribeScheduleCategories = listenDoc<{ list: { id: string; label: string }[] }>('settings', 'schedule_categories', (data) => {
      if (data && Array.isArray(data.list)) {
        rawSetScheduleCategories(data.list);
      }
    });

    return () => {
      unsubscribeNotices();
      unsubscribeTeams();
      unsubscribeInquiries();
      unsubscribeEvents();
      unsubscribeAthletes();
      unsubscribeCompetitions();
      unsubscribeDonations();
      unsubscribeImages();
      unsubscribeHeaders();
      unsubscribePromises();
      unsubscribeAssoc();
      unsubscribePassword();
      unsubscribeTeamCategories();
      unsubscribeTeamRegions();
      unsubscribeScheduleCategories();
    };
  }, []);

  // Monitor scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple Count up effect
  useEffect(() => {
    const duration = 1500; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);

      setAthleteCount(Math.floor(70000 + easeProgress * 20412)); // Target: 90,412
      setTeamCount(Math.floor(120 + easeProgress * 68));        // Target: 188
      setCoachCount(Math.floor(300 + easeProgress * 152));      // Target: 452

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const filteredEvents = events.filter(evt => {
    if (eventFilter === 'all') return true;
    return evt.type === eventFilter;
  });

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'domestic': return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'international': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'education': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'selection': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'seminar': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'competition': return 'bg-rose-50 text-rose-700 border border-rose-200';
      default: return 'bg-zinc-50 text-zinc-700 border border-zinc-200';
    }
  };

  const getEventLabel = (type: string) => {
    const found = scheduleCategories.find(c => c.id === type);
    if (found) return found.label;
    if (type === 'competition') return '국내 대회';
    return type;
  };

  // Helper functions for Admin operations
  const handleToggleNoticeFixed = (id: string) => {
    const updated = notices.map(n => n.id === id ? { ...n, isImportant: !n.isImportant } : n);
    setNotices(updated);
  };

  const handleDeleteNoticeFromAdmin = (id: string) => {
    showConfirm(
      '공지사항 삭제',
      '선택한 공지사항을 영구적으로 삭제하시겠습니까?',
      () => {
        const updated = notices.filter(n => n.id !== id);
        setNotices(updated);
      }
    );
  };

  const handleAddNoticeFromAdmin = () => {
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) {
      showToast('공지 제목과 내용을 모두 입력해 주세요.', 'error');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const newNoticeItem: Notice = {
      id: adminEditingNotice ? adminEditingNotice.id : `notice-${Date.now()}`,
      category: newNoticeCategory,
      title: newNoticeTitle,
      content: newNoticeContent,
      date: adminEditingNotice ? adminEditingNotice.date : todayStr,
      views: adminEditingNotice ? adminEditingNotice.views : 1,
      isImportant: newNoticeIsImportant
    };

    let updated: Notice[];
    if (adminEditingNotice) {
      updated = notices.map(n => n.id === adminEditingNotice.id ? newNoticeItem : n);
      showToast('공지사항이 정상적으로 수정되었습니다.', 'success');
    } else {
      updated = [newNoticeItem, ...notices];
      showToast('새로운 공지사항이 등록되었습니다.', 'success');
    }

    setNotices(updated);

    // Reset Form fields
    setNewNoticeTitle('');
    setNewNoticeCategory('general');
    setNewNoticeContent('');
    setNewNoticeIsImportant(false);
    setAdminEditingNotice(null);
    setShowAddNoticeForm(false);
  };

  const handleDeleteTeamFromAdmin = (id: string) => {
    const updated = teams.filter(t => t.id !== id);
    setTeams(updated);
    showToast('선택한 단체 명부가 시스템에서 정상적으로 삭제되었습니다.', 'success');
  };

  const handleUpdateInquiryStatus = (id: string, nextStatus: InquirySubmission['status']) => {
    const updated = inquiries.map(i => i.id === id ? { ...i, status: nextStatus } : i);
    setInquiries(updated);
  };

  const handleDeleteInquiry = (id: string) => {
    showConfirm(
      '문의 내역 삭제',
      '해당 온라인 문의 내역을 영구적으로 삭제하시겠습니까?',
      () => {
        const updated = inquiries.filter(i => i.id !== id);
        setInquiries(updated);
      }
    );
  };

  const handleDeleteEventFromAdmin = (id: string) => {
    showConfirm(
      '일정 삭제',
      '선택한 일정을 공식 일정표에서 삭제하시겠습니까?',
      () => {
        const updated = events.filter(e => e.id !== id);
        setEvents(updated);
      }
    );
  };

  const handleUpdateEventStatusFromAdmin = (id: string, status: KCFEvent['status']) => {
    const updated = events.map(e => e.id === id ? { ...e, status } : e);
    setEvents(updated);
  };

  const handleAddEventFromAdmin = (newEvent: Omit<KCFEvent, 'id'>, id?: string) => {
    let updated: KCFEvent[];
    if (id) {
      updated = events.map(e => e.id === id ? { ...newEvent, id } : e);
      showToast('일정이 성공적으로 수정되었습니다.', 'success');
    } else {
      const eventWithId: KCFEvent = {
        ...newEvent,
        id: `event-${Date.now()}`
      };
      updated = [...events, eventWithId];
      showToast('새 일정이 등록되었습니다.', 'success');
    }
    setEvents(updated);
  };

  const handleAddTeamFromAdmin = (newTeam: Omit<CheerTeam, 'id'>) => {
    const teamWithId: CheerTeam = {
      ...newTeam,
      id: `team-${Date.now()}`
    };
    const updated = [...teams, teamWithId];
    setTeams(updated);
  };

  const handleAddAthleteFromAdmin = (newAthlete: Omit<Athlete, 'id'>) => {
    const athleteWithId: Athlete = {
      ...newAthlete,
      id: `athlete-${Date.now()}`
    };
    const updated = [...athletes, athleteWithId];
    setAthletes(updated);
  };

  const handleDeleteAthleteFromAdmin = (id: string) => {
    const updated = athletes.filter(a => a.id !== id);
    setAthletes(updated);
  };

  const handleUpdateAthleteValidUntil = (id: string, validUntil: string) => {
    const updated = athletes.map(a => a.id === id ? { ...a, validUntil } : a);
    setAthletes(updated);
  };

  const handleUpdateTeamFromAdmin = (updatedTeam: CheerTeam) => {
    const updated = teams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
    setTeams(updated);
    showToast('단체 등록 정보가 성공적으로 수정되었습니다.', 'success');
  };

  const handleUpdateAthleteFromAdmin = (updatedAthlete: Athlete) => {
    const updated = athletes.map(a => a.id === updatedAthlete.id ? updatedAthlete : a);
    setAthletes(updated);
  };

  const handleUpdateImage = (key: keyof typeof DEFAULT_IMAGES, url: string) => {
    setSiteImages((prev) => ({ ...prev, [key]: url }));
  };

  const handleUpdateAssociationInfo = (updatedInfo: AssociationInfo) => {
    setAssociationInfo(updatedInfo);
  };

  const handleResetImages = () => {
    setSiteImages((prev) => ({
      ...DEFAULT_IMAGES,
      associationLogo: prev?.associationLogo || '',
    }));
  };

  const handleUpdatePassword = (newPass: string) => {
    setAdminPassword(newPass);
  };

  const triggerAdminAction = (action: () => void) => {
    if (isUnlocked) {
      action();
    } else {
      setPendingAdminAction(() => action);
      setShowPasswordPrompt(true);
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const handleToggleAdminMode = (nextVal: boolean | ((prev: boolean) => boolean)) => {
    const targetVal = typeof nextVal === 'function' ? nextVal(isAdminMode) : nextVal;
    if (targetVal === true) {
      triggerAdminAction(() => {
        setIsAdminMode(true);
      });
    } else {
      setIsAdminMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans antialiased selection:bg-blue-500/10 selection:text-blue-900">
      
      {/* 1. Header Navigation */}
      <nav className="w-full fixed top-0 left-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs px-4 sm:px-6 lg:px-16 flex justify-between items-center transition-all duration-300">
        <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange('home'); }} className="flex items-center gap-3.5 cursor-pointer hover:opacity-85 transition duration-200 shrink-0">
          {/* Official KCF Logo - Stylized Cheerleader Figure */}
          <div id="kcf-header-logo-container" className="w-10 h-10 flex items-center justify-center shrink-0">
            {siteImages.associationLogo && !headerLogoFailed ? (
              <img 
                src={siteImages.associationLogo} 
                alt="한국치어리딩협회 로고" 
                className="w-full h-full object-contain" 
                onError={() => setHeaderLogoFailed(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <svg 
                id="kcf-header-logo-svg"
                viewBox="0 0 500 500" 
                className="w-full h-full object-contain" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Head */}
                <circle cx="200" cy="70" r="28" fill="#004098" />
                
                {/* Left Blue Swoop */}
                <path 
                  d="M 72,143 C 105,123 155,140 188,165 C 150,230 90,360 2,490 C 25,430 115,280 135,215 C 137,208 127,192 110,180 C 95,168 85,155 72,143 Z" 
                  fill="#004098" 
                />
                
                {/* Top Right Red Swoop */}
                <path 
                  d="M 188,165 C 235,125 310,65 390,5 C 335,70 260,155 208,210 C 193,190 189,175 188,165 Z" 
                  fill="#A61A21" 
                />
                
                {/* Middle Right Red Swoop */}
                <path 
                  d="M 208,210 C 265,190 375,165 498,158 C 420,175 340,210 286,242 C 245,232 220,222 208,210 Z" 
                  fill="#A61A21" 
                />
                
                {/* Bottom Red Loop */}
                <path 
                  d="M 208,210 C 185,255 178,300 181,320 C 181,365 210,440 450,430 C 375,465 270,470 210,400 C 175,360 178,335 181,320 C 185,340 220,310 286,242 C 240,232 220,222 208,210 Z" 
                  fill="#A61A21" 
                />
              </svg>
            )}
          </div>
          <div className="flex flex-col text-left">
            <div className="text-sm sm:text-base font-extrabold tracking-tight font-serif text-zinc-950 flex items-center gap-1.5">
              <span>한국치어리딩협회</span>
              <span className="text-red-500 font-sans font-black text-xs">KCF</span>
            </div>
            <span className="hidden sm:inline-block text-[8px] text-zinc-400 tracking-wider uppercase font-semibold">
              Korea Cheerleading Federation
            </span>
          </div>
        </a>

        {/* Desktop Menu links (Active Pills with Icons, showing on md: screens and larger) */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-semibold text-zinc-500 flex-nowrap">
          <button
            onClick={() => handleTabChange('home')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              currentTab === 'home' 
                ? 'bg-blue-600/10 text-blue-600 font-extrabold' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">KCF 소개</span>
          </button>
          <button
            onClick={() => handleTabChange('schedule')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              currentTab === 'schedule' 
                ? 'bg-blue-600/10 text-blue-600 font-extrabold' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">일정 안내</span>
          </button>
          <button
            onClick={() => handleTabChange('competitions')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              currentTab === 'competitions' 
                ? 'bg-blue-600/10 text-blue-600 font-extrabold' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">대회 정보</span>
          </button>
          <button
            onClick={() => handleTabChange('teams')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              currentTab === 'teams' 
                ? 'bg-blue-600/10 text-blue-600 font-extrabold' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">가입팀 목록</span>
          </button>
          <button
            onClick={() => handleTabChange('athletes')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              currentTab === 'athletes' 
                ? 'bg-blue-600/10 text-blue-600 font-extrabold' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">공인선수 조회</span>
          </button>
          <button
            onClick={() => handleTabChange('notice')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              currentTab === 'notice' 
                ? 'bg-blue-600/10 text-blue-600 font-extrabold' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">새 소식</span>
          </button>
          <button
            onClick={() => handleTabChange('contact')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              currentTab === 'contact' 
                ? 'bg-blue-600/10 text-blue-600 font-extrabold' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">사무국 문의</span>
          </button>
          <button
            onClick={() => handleTabChange('donations')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              currentTab === 'donations' 
                ? 'bg-blue-600/10 text-blue-600 font-extrabold' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">기부금 공개</span>
          </button>
        </div>

        {/* Action Button & Menu Icon */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTabChange('contact')}
            className="hidden lg:inline-block border border-zinc-250 text-zinc-800 rounded-full px-4 py-1.5 text-[10px] tracking-wider uppercase hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition duration-300 font-semibold shadow-xs cursor-pointer"
          >
            상담 접수 ↗
          </button>

          {/* Mobile menu trigger */}
          <button 
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 transition shadow-xs cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Horizontal Category Bar (Visible only on mobile/tablet under header, allows instant visual browsing of all categories) */}
      <div className="md:hidden fixed top-16 left-0 w-full h-12 z-40 bg-white border-b border-zinc-200/80 flex items-center gap-2 px-4 overflow-x-auto scrollbar-none shadow-xs">
        <button
          onClick={() => handleTabChange('home')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            currentTab === 'home' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Info className="w-3 h-3" />
          <span>KCF 소개</span>
        </button>
        <button
          onClick={() => handleTabChange('schedule')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            currentTab === 'schedule' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Calendar className="w-3 h-3" />
          <span>일정 안내</span>
        </button>
        <button
          onClick={() => handleTabChange('competitions')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            currentTab === 'competitions' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Trophy className="w-3 h-3" />
          <span>대회 정보</span>
        </button>
        <button
          onClick={() => handleTabChange('teams')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            currentTab === 'teams' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Users className="w-3 h-3" />
          <span>가입팀 목록</span>
        </button>
        <button
          onClick={() => handleTabChange('athletes')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            currentTab === 'athletes' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <UserCheck className="w-3 h-3" />
          <span>공인선수 조회</span>
        </button>
        <button
          onClick={() => handleTabChange('notice')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            currentTab === 'notice' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Megaphone className="w-3 h-3" />
          <span>새 소식</span>
        </button>
        <button
          onClick={() => handleTabChange('contact')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            currentTab === 'contact' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Inbox className="w-3 h-3" />
          <span>사무국 문의</span>
        </button>
        <button
          onClick={() => handleTabChange('donations')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            currentTab === 'donations' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Heart className="w-3 h-3" />
          <span>기부금 공개</span>
        </button>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-45 bg-white pt-28 px-6 pb-8 border-b border-slate-200 flex flex-col justify-between"
          >
            <div className="flex flex-col space-y-5 text-base font-semibold text-slate-900 tracking-tight pl-4">
              <button onClick={() => { handleTabChange('home'); setMobileMenuOpen(false); }} className={`text-left hover:text-blue-700 transition cursor-pointer ${currentTab === 'home' ? 'text-blue-600 font-bold' : ''}`}>KCF 소개 / 핵심 약속 (About)</button>
              <button onClick={() => { handleTabChange('schedule'); setMobileMenuOpen(false); }} className={`text-left hover:text-blue-700 transition cursor-pointer ${currentTab === 'schedule' ? 'text-blue-600 font-bold' : ''}`}>한국치어리딩협회 일정 (Schedule)</button>
              <button onClick={() => { handleTabChange('competitions'); setMobileMenuOpen(false); }} className={`text-left hover:text-blue-700 transition cursor-pointer ${currentTab === 'competitions' ? 'text-blue-600 font-bold' : ''}`}>대회 정보 (Competitions)</button>
              <button onClick={() => { handleTabChange('teams'); setMobileMenuOpen(false); }} className={`text-left hover:text-blue-700 transition cursor-pointer ${currentTab === 'teams' ? 'text-blue-600 font-bold' : ''}`}>전국 가입팀 검색 (Teams)</button>
              <button onClick={() => { handleTabChange('athletes'); setMobileMenuOpen(false); }} className={`text-left hover:text-blue-700 transition cursor-pointer ${currentTab === 'athletes' ? 'text-blue-600 font-bold' : ''}`}>공인선수 조회 (Athletes)</button>
              <button onClick={() => { handleTabChange('notice'); setMobileMenuOpen(false); }} className={`text-left hover:text-blue-700 transition cursor-pointer ${currentTab === 'notice' ? 'text-blue-600 font-bold' : ''}`}>새 공지사항 (Notice)</button>
              <button onClick={() => { handleTabChange('contact'); setMobileMenuOpen(false); }} className={`text-left hover:text-blue-700 transition cursor-pointer ${currentTab === 'contact' ? 'text-blue-600 font-bold' : ''}`}>사무국 접수처 (Contact)</button>
              <button onClick={() => { handleTabChange('donations'); setMobileMenuOpen(false); }} className={`text-left hover:text-blue-700 transition cursor-pointer ${currentTab === 'donations' ? 'text-blue-600 font-bold' : ''}`}>연간 기부금 공개 실적 (Donations)</button>
            </div>

            <div className="border-t border-slate-100 pt-6 text-center space-y-4">
              <p className="text-xs text-slate-500 font-medium">사단법인 한국치어리딩협회 (KCF)</p>
              <button 
                onClick={() => { handleTabChange('contact'); setMobileMenuOpen(false); }}
                className="inline-block bg-blue-700 text-white font-bold text-xs tracking-wide px-8 py-3 rounded-full w-full max-w-xs transition shadow-md shadow-blue-100 cursor-pointer"
              >
                사무국 바로가기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              {/* 2. Hero Section */}
              <header id="hero" className="relative min-h-screen pt-36 md:pt-28 flex flex-col justify-between px-6 lg:px-16 pb-12 overflow-hidden bg-zinc-50/35">
                {/* Background Gradients & Overlay */}
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500/5 via-transparent to-red-500/5"></div>
                <div className="absolute inset-0 z-0 opacity-[0.06] mix-blend-overlay bg-cover bg-center" style={{ backgroundImage: `url('${siteImages.heroBg}')` }}></div>
                
                {/* Decorative blue & red subtle circles */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 mt-14 w-full max-w-6.5xl">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                    {/* Headline and paragraph: Left on PC, top on mobile */}
                    <div className="lg:col-span-7 order-1 lg:order-1 w-full">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                      >
                        <h1 className="text-4xl md:text-5xl lg:text-7.5xl font-serif font-black leading-[1.08] tracking-tighter text-zinc-950 uppercase">
                          열정으로 비상하는 <br />
                          대한민국 <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 font-black">치어리딩</span> <span className="text-red-500 italic font-black">KCF</span>
                        </h1>
                        
                        <p className="text-sm md:text-base text-zinc-500 font-normal max-w-2xl leading-relaxed">
                          사단법인 한국치어리딩협회(KCF)는 선수가 오직 무대와 자신의 꿈에만 전념할 수 있도록 투명한 국가대표 선발전, 안전 중심 기술 규정, 전국 지부 연동 훈련 생태계를 공정하게 구축해 나가고 있습니다.
                        </p>

                        <div className="flex flex-wrap gap-3.5 pt-2">
                          <button
                            onClick={() => {
                              const target = document.getElementById('vision');
                              if (target) target.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-zinc-900 text-white font-semibold px-8 py-3.5 rounded-full text-xs hover:bg-zinc-800 transition duration-300 shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            KCF 약속과 비전
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleTabChange('schedule')}
                            className="border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold px-7 py-3.5 rounded-full text-xs transition duration-300 shadow-sm cursor-pointer"
                          >
                            대회/연수 일정 안내
                          </button>
                        </div>
                      </motion.div>
                    </div>

                    {/* Public Agency Banners Section: Right on PC, bottom on mobile */}
                    <div className="lg:col-span-5 order-2 lg:order-2 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                        {/* 국세청 배너 */}
                        <a 
                          href="https://www.nts.go.kr" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group flex items-center gap-4.5 p-4.5 rounded-2xl bg-white border border-blue-100/80 hover:border-[#005BAC] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-10px_rgba(0,91,172,0.15)] transition-all duration-300 min-h-[84px] cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-blue-50/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Building2 className="w-6 h-6 text-[#005BAC]" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs sm:text-sm font-extrabold text-zinc-950 flex items-center gap-1 group-hover:text-[#005BAC] transition-colors">
                              국세청
                              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                            </h4>
                            <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 font-medium leading-tight">
                              국세행정 및 세무 관련 공식 정보 제공
                            </p>
                          </div>
                        </a>

                        {/* 국민권익위원회 배너 */}
                        <a 
                          href="https://www.acrc.go.kr" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group flex items-center gap-4.5 p-4.5 rounded-2xl bg-white border border-orange-100/80 hover:border-[#F58220] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-10px_rgba(245,130,32,0.15)] transition-all duration-300 min-h-[84px] cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-orange-50/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-6 h-6 text-[#F58220]" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs sm:text-sm font-extrabold text-zinc-950 flex items-center gap-1 group-hover:text-[#F58220] transition-colors">
                              국민권익위원회
                              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                            </h4>
                            <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 font-medium leading-tight">
                              청렴·부패방지 및 국민권익 보호
                            </p>
                          </div>
                        </a>

                        {/* 기부금 투명성 공개 안내 배너 */}
                        <button 
                          onClick={() => handleTabChange('donations')}
                          className="group flex items-center gap-4.5 p-4.5 rounded-2xl bg-white border border-red-100/80 hover:border-red-500 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-10px_rgba(239,68,68,0.15)] transition-all duration-300 min-h-[84px] text-left cursor-pointer w-full"
                        >
                          <div className="w-12 h-12 rounded-xl bg-red-50/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Heart className="w-6 h-6 text-red-500 fill-red-500/10" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs sm:text-sm font-extrabold text-zinc-950 flex items-center gap-1 group-hover:text-red-500 transition-colors">
                              기부금 모금액 및 실적 공개
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-red-500" />
                            </h4>
                            <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 font-medium leading-tight">
                              투명한 자금 운영 및 기부금 활용실적 조회
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Always-Visible Beautiful Category Quick Deck */}
                <div className="relative z-10 mt-12 mb-4 w-full">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block text-center mb-4">공식 카테고리 빠른 탐색 (Category Quick Deck)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 w-full">
                    {[
                      { id: 'home', label: '협회 소개', desc: 'KCF 약속 & 비전', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50/60 border-blue-100 hover:bg-blue-100/40' },
                      { id: 'schedule', label: '일정 안내', desc: '한국치어리딩협회 일정', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50/60 border-emerald-100 hover:bg-emerald-100/40' },
                      { id: 'competitions', label: '대회 정보', desc: '전국 대회 & 규정', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50/60 border-amber-100 hover:bg-amber-100/40' },
                      { id: 'teams', label: '가입팀 목록', desc: '등록 클럽 & 아카데미', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50/60 border-indigo-100 hover:bg-indigo-100/40' },
                      { id: 'athletes', label: '공인선수 조회', desc: 'KCF 등록 선수', icon: UserCheck, color: 'text-rose-600', bg: 'bg-rose-50/60 border-rose-100 hover:bg-rose-100/40' },
                      { id: 'notice', label: '공지사항', desc: 'KCF 새 소식', icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50/60 border-purple-100 hover:bg-purple-100/40' },
                    ].map((cat) => {
                      const IconComponent = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleTabChange(cat.id as any)}
                          className={`flex flex-col items-start p-4 rounded-2xl border ${cat.bg} hover:border-zinc-950/20 hover:shadow-xs transition-all duration-300 text-left group cursor-pointer w-full`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs mb-3 group-hover:scale-110 transition duration-300">
                            <IconComponent className={`w-4.5 h-4.5 ${cat.color}`} />
                          </div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-zinc-950 flex items-center gap-1 group-hover:text-blue-600 transition">
                            {cat.label}
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-1 font-medium leading-tight line-clamp-1">
                            {cat.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Large background watermarking typography */}
                <div className="relative z-10 w-full mt-10 select-none pointer-events-none">
                  <div className="text-[12vw] font-serif font-black text-zinc-300/60 leading-none tracking-tighter uppercase">
                    KOREA CHEERLEADING
                  </div>
                </div>


              </header>

              {/* 3. About KCF Section */}
              <section id="about" className="py-28 bg-white text-zinc-900 px-6 lg:px-16 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                  
                  {/* Section Indicator */}
                  <div className="lg:col-span-3 flex items-center space-x-2 text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-6 lg:mb-0">
                    <span className="w-1.5 h-1.5 bg-blue-600 inline-block rounded-full"></span>
                    <span>About KCF</span>
                  </div>
                  
                  <div className="lg:col-span-9 space-y-6">
                    <h2 className="text-3xl md:text-5xl font-serif leading-[1.12] text-zinc-950 font-black tracking-tight max-w-4xl uppercase">
                      선수를 위해, <br />치어리딩의 내일을 위해.
                      <span className="font-sans text-sm md:text-base block mt-6 text-zinc-500 leading-relaxed font-normal normal-case">
                        사단법인 한국치어리딩협회(KCF)는 선수가 오직 무대와 성장에만 집중할 수 있도록 법률자문, 안전 지도자 연수, 국제 가맹국과의 연대를 통해 보다 건전하고 신뢰받는 치어리딩 스포츠 문화 안착에 앞장섭니다.
                      </span>
                    </h2>
                    
                    <div className="pt-2">
                      <button
                        onClick={() => handleTabChange('schedule')}
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-zinc-900 border-b border-zinc-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition duration-300 cursor-pointer"
                      >
                        사업 안내 & 핵심 서비스 바로가기
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Elegant Image Mosaic Grid */}
                <div className="mt-24 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    <div className="img-card rounded-3xl overflow-hidden h-80 shadow-[0_15px_40px_rgba(0,0,0,0.03)] bg-cover bg-center border border-zinc-100" style={{ backgroundImage: `url('${siteImages.mosaic1}')` }}></div>
                    <div className="img-card rounded-3xl overflow-hidden h-80 shadow-[0_15px_40px_rgba(0,0,0,0.03)] bg-cover bg-center md:translate-y-12 border border-zinc-100" style={{ backgroundImage: `url('${siteImages.mosaic2}')` }}></div>
                    <div className="img-card rounded-3xl overflow-hidden h-80 shadow-[0_15px_40px_rgba(0,0,0,0.03)] bg-cover bg-center border border-zinc-100" style={{ backgroundImage: `url('${siteImages.mosaic3}')` }}></div>
                  </div>
                </div>
              </section>

              {/* 4. Vision Section */}
              <section id="vision" className="py-32 px-6 lg:px-16 border-t border-zinc-100 bg-zinc-50/50 relative">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-4xl mb-20 relative z-10">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block mb-2">Core Pillars & Identity</span>
                  <h3 className="text-3xl md:text-5xl font-serif text-zinc-950 tracking-tight font-black uppercase">
                    KCF의 변치 않는 <br />
                    <span className="text-red-500">세 가지 핵심 약속</span>
                  </h3>
                  <p className="text-sm text-zinc-500 font-normal mt-4 max-w-2xl leading-relaxed">
                    안전하고 공정하며 선수와 팀의 가치를 우선하는 투명한 스포츠 문화를 지지합니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  {corePromises.map((promise, index) => {
                    const hoverColor = index === 1 ? 'group-hover:text-red-500' : 'group-hover:text-blue-600';
                    return (
                      <div key={promise.num} className="group transition-all duration-300 bg-white p-8 rounded-3xl border border-zinc-200/65 hover:border-zinc-900/15 hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <span className="font-serif text-zinc-300 text-4xl block mb-6 font-black tracking-tighter group-hover:text-zinc-400 transition-colors">{promise.num}</span>
                          <h4 className={`text-lg font-bold mb-3 text-zinc-900 ${hoverColor} transition duration-200`}>
                            {promise.title}
                          </h4>
                          <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                            {promise.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </section>
            </motion.div>
          )}

          {currentTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="pt-36 md:pt-24"
            >
              {/* 5. Services / Events Section */}
              <section id="services" className="py-24 px-6 lg:px-16 bg-white relative">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center">
                  <span className="inline-flex items-center gap-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {categoryHeaders.schedule.badge}
                  </span>
                  <h3 className="text-3xl md:text-5xl font-serif text-zinc-950 font-black tracking-tight uppercase leading-tight">
                    {categoryHeaders.schedule.title}
                  </h3>
                  <p className="text-sm text-zinc-500 font-normal mt-4 leading-relaxed">
                    {categoryHeaders.schedule.desc}
                  </p>
                </div>

                {/* Event Filter tabs & View Switcher */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-10 pb-6 border-b border-zinc-150">
                  {/* Event Filter tabs */}
                  <div className="flex flex-wrap gap-1 p-1 bg-zinc-100 rounded-xl">
                    {['all', ...scheduleCategories.map(c => c.id)].map((filter) => (
                      <button
                        id={`filter-event-btn-${filter}`}
                        key={filter}
                        onClick={() => setEventFilter(filter)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wide transition-all duration-300 cursor-pointer ${
                          eventFilter === filter
                            ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                        }`}
                      >
                        {filter === 'all' ? '전체 일정' : getEventLabel(filter)}
                      </button>
                    ))}
                  </div>

                  {/* View Switcher: Calendar vs List */}
                  <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl shrink-0">
                    <button
                      onClick={() => setScheduleViewMode('calendar')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wide transition-all duration-350 cursor-pointer flex items-center gap-1.5 ${
                        scheduleViewMode === 'calendar'
                          ? 'bg-white text-zinc-950 font-bold shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                      달력형 보기
                    </button>
                    <button
                      onClick={() => setScheduleViewMode('list')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wide transition-all duration-350 cursor-pointer flex items-center gap-1.5 ${
                        scheduleViewMode === 'list'
                          ? 'bg-white text-zinc-950 font-bold shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 border-b-2 border-t-2 border-zinc-500 flex flex-col justify-between py-0.5">
                        <span className="h-0.5 w-full bg-zinc-500 block"></span>
                      </span>
                      목록형 보기
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {scheduleViewMode === 'calendar' ? (
                    <motion.div
                      key="calendar-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ScheduleCalendar 
                        events={filteredEvents}
                        getEventBadgeColor={getEventBadgeColor}
                        getEventLabel={getEventLabel}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-10"
                    >
                      <div className="overflow-x-auto">
                        {/* Desktop Table View */}
                        <table className="hidden md:table w-full border-collapse text-left text-xs md:text-sm">
                          <thead>
                            <tr className="border-t-2 border-b border-zinc-900 text-zinc-800 font-bold bg-zinc-50/70 text-center">
                              <th className="py-4 px-3 w-36 text-center">기간 (Date)</th>
                              <th className="py-4 px-3 w-28 text-center">구분</th>
                              <th className="py-4 px-4 text-left">일정 및 행사명</th>
                              <th className="py-4 px-4 text-left">세부 내용</th>
                              <th className="py-4 px-3 w-36 text-center">개최 장소</th>
                              <th className="py-4 px-3 w-24 text-center">진행 상태</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEvents.map((evt) => (
                              <tr
                                id={`event-row-${evt.id}`}
                                key={evt.id}
                                className="border-b border-zinc-150 bg-white hover:bg-zinc-50/80 transition-colors duration-200"
                              >
                                <td className="py-4.5 px-3 text-center font-mono font-semibold text-zinc-700">
                                  {evt.date}
                                </td>
                                <td className="py-4.5 px-3 text-center">
                                  <span className={`text-[10px] px-2.5 py-1 rounded font-bold tracking-wide ${getEventBadgeColor(evt.type)}`}>
                                    {getEventLabel(evt.type)}
                                  </span>
                                </td>
                                <td className="py-4.5 px-4 text-left font-bold text-zinc-950 font-medium">
                                  {evt.title}
                                </td>
                                <td className="py-4.5 px-4 text-left text-xs text-zinc-500 font-light max-w-xs truncate" title={evt.description}>
                                  {evt.description}
                                </td>
                                <td className="py-4.5 px-3 text-center text-xs text-zinc-600 truncate max-w-[120px]">
                                  <span className="inline-flex items-center gap-1 justify-center">
                                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                    {evt.location}
                                  </span>
                                </td>
                                <td className="py-4.5 px-3 text-center">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    evt.status === 'upcoming' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                                    evt.status === 'ongoing' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150 animate-pulse' : 
                                    'bg-zinc-50 text-zinc-400 border border-zinc-150'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      evt.status === 'upcoming' ? 'bg-amber-400' :
                                      evt.status === 'ongoing' ? 'bg-emerald-500' : 'bg-zinc-300'
                                    }`} />
                                    {evt.status === 'upcoming' ? '대기 중' :
                                     evt.status === 'ongoing' ? '진행 중' : '종료됨'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Mobile View */}
                        <div className="md:hidden divide-y divide-zinc-150 border-t border-b border-zinc-200">
                          {filteredEvents.map((evt) => (
                            <div
                              id={`event-mobile-${evt.id}`}
                              key={evt.id}
                              className="py-4 px-2 bg-white active:bg-zinc-50 transition-colors"
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${getEventBadgeColor(evt.type)}`}>
                                  {getEventLabel(evt.type)}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono ml-auto">
                                  {evt.date}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-zinc-950 mb-1">
                                {evt.title}
                              </h4>
                              <p className="text-xs text-zinc-500 font-light line-clamp-2 mb-2">
                                {evt.description}
                              </p>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-zinc-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-zinc-400" />
                                  {evt.location}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                                  evt.status === 'upcoming' ? 'bg-amber-50 text-amber-700' :
                                  evt.status === 'ongoing' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-50 text-zinc-400'
                                }`}>
                                  {evt.status === 'upcoming' ? '대기' : evt.status === 'ongoing' ? '진행' : '종료'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </motion.div>
          )}

          {currentTab === 'competitions' && (
            <motion.div
              key="competitions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="pt-36 md:pt-24"
            >
              {/* 8.5 Competition Board Section */}
              <section id="competitions" className="py-24 px-6 lg:px-16 bg-white">
                <CompetitionBoard 
                  competitions={competitions} 
                  setCompetitions={setCompetitions} 
                  isAdminMode={false} 
                  showConfirm={showConfirm} 
                  showToast={showToast} 
                  headerBadge={categoryHeaders.competitions.badge}
                  headerTitle={categoryHeaders.competitions.title}
                  headerDesc={categoryHeaders.competitions.desc}
                />
              </section>
            </motion.div>
          )}

          {currentTab === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="pt-36 md:pt-24"
            >
              {/* 7. Teams Registry Section */}
              <section id="teams" className="py-24 px-6 lg:px-16 bg-white">
                <TeamRegistry 
                  teams={teams} 
                  setTeams={setTeams} 
                  inquiries={inquiries}
                  setInquiries={setInquiries}
                  teamCategories={teamCategories}
                  teamRegions={teamRegions}
                  isAdminMode={false} 
                  showConfirm={showConfirm} 
                  headerBadge={categoryHeaders.teams.badge}
                  headerTitle={categoryHeaders.teams.title}
                  headerDesc={categoryHeaders.teams.desc}
                  showToast={showToast}
                />
              </section>
            </motion.div>
          )}

          {currentTab === 'athletes' && (
            <motion.div
              key="athletes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="pt-36 md:pt-24"
            >
              {/* 8. Athlete Lookup Section */}
              <section id="athletes" className="py-24 px-6 lg:px-16 bg-white">
                <AthleteLookup 
                  athletes={athletes} 
                  headerBadge={categoryHeaders.athletes.badge}
                  headerTitle={categoryHeaders.athletes.title}
                  headerDesc={categoryHeaders.athletes.desc}
                />
              </section>
            </motion.div>
          )}

          {currentTab === 'notice' && (
            <motion.div
              key="notice"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="pt-36 md:pt-24"
            >
              {/* 9. Notice Board Section */}
              <section id="notice" className="py-24 px-6 lg:px-16 bg-white">
                <NoticeBoard 
                  notices={notices} 
                  setNotices={setNotices} 
                  isAdminMode={false} 
                  setIsAdminMode={handleToggleAdminMode} 
                  showConfirm={showConfirm} 
                  headerBadge={categoryHeaders.notice.badge}
                  headerTitle={categoryHeaders.notice.title}
                  headerDesc={categoryHeaders.notice.desc}
                />
              </section>
            </motion.div>
          )}

          {currentTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="pt-36 md:pt-24"
            >
              {/* 9. Contact / Inquiry Hub Section */}
              <section id="contact" className="py-24 px-6 lg:px-16 bg-white">
                <InquiryHub 
                  inquiries={inquiries} 
                  setInquiries={setInquiries} 
                  showConfirm={showConfirm} 
                  associationInfo={associationInfo} 
                  headerBadge={categoryHeaders.contact.badge}
                  headerTitle={categoryHeaders.contact.title}
                  headerDesc={categoryHeaders.contact.desc}
                />
              </section>
            </motion.div>
          )}

          {currentTab === 'donations' && (
            <motion.div
              key="donations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="pt-36 md:pt-24"
            >
              <section id="donations" className="py-24 px-6 lg:px-16 bg-white">
                <DonationDisclosure 
                  donations={donations}
                  headerBadge={categoryHeaders.donations?.badge}
                  headerTitle={categoryHeaders.donations?.title}
                  headerDesc={categoryHeaders.donations?.desc}
                />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 10. Footer Section */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-16 px-6 lg:px-16 text-xs font-light relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Logo & Slogan Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div id="kcf-footer-logo-container" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl p-1.5 shadow-sm shrink-0">
                {siteImages.associationLogo && !footerLogoFailed ? (
                  <img 
                    src={siteImages.associationLogo} 
                    alt="한국치어리딩협회 로고" 
                    className="w-full h-full object-contain" 
                    onError={() => setFooterLogoFailed(true)}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <svg 
                    id="kcf-footer-logo-svg"
                    viewBox="0 0 500 500" 
                    className="w-full h-full object-contain" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Head */}
                    <circle cx="200" cy="70" r="28" fill="#004098" />
                    
                    {/* Left Blue Swoop */}
                    <path 
                      d="M 72,143 C 105,123 155,140 188,165 C 150,230 90,360 2,490 C 25,430 115,280 135,215 C 137,208 127,192 110,180 C 95,168 85,155 72,143 Z" 
                      fill="#004098" 
                    />
                    
                    {/* Top Right Red Swoop */}
                    <path 
                      d="M 188,165 C 235,125 310,65 390,5 C 335,70 260,155 208,210 C 193,190 189,175 188,165 Z" 
                      fill="#A61A21" 
                    />
                    
                    {/* Middle Right Red Swoop */}
                    <path 
                      d="M 208,210 C 265,190 375,165 498,158 C 420,175 340,210 286,242 C 245,232 220,222 208,210 Z" 
                      fill="#A61A21" 
                    />
                    
                    {/* Bottom Red Loop */}
                    <path 
                      d="M 208,210 C 185,255 178,300 181,320 C 181,365 210,440 450,430 C 375,465 270,470 210,400 C 175,360 178,335 181,320 C 185,340 220,310 286,242 C 240,232 220,222 208,210 Z" 
                      fill="#A61A21" 
                    />
                  </svg>
                )}
              </div>
              <div className="text-xl font-extrabold tracking-tight font-serif text-white">KCF</div>
            </div>
            
            <p className="text-[11px] leading-relaxed text-slate-400 max-w-xs">
              {associationInfo.officeName || '사단법인 한국치어리딩협회'} (Korea Cheerleading Federation)는 대한민국 치어리딩 종목을 총괄하며 안전 중심 교육, 공정한 대표 선발을 리드합니다.
            </p>
            
            <div className="text-[10px] text-slate-500 space-y-1 pt-2 font-light">
              <p>주소: {associationInfo.address || '서울특별시 송파구 올림픽로 424 올림픽공원 한라관 203호'}</p>
              <p>대표전화: {associationInfo.phone || '02-421-8890'} {associationInfo.fax && `| 팩스: ${associationInfo.fax}`}</p>
              <p>이메일: {associationInfo.email || 'kcf_office@cheerleading.or.kr'}</p>
            </div>

            <p className="text-[10px] text-slate-500 pt-1">
              © 2026 Korea Cheerleading Federation. All rights reserved.
            </p>
          </div>

          {/* Nav Links Column */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">주요 메뉴</h5>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => handleTabChange('home')} className="hover:text-blue-400 text-slate-400 transition text-left cursor-pointer">KCF 협회 소개</button></li>
              <li><button onClick={() => handleTabChange('home')} className="hover:text-blue-400 text-slate-400 transition text-left cursor-pointer">세 가지 핵심가치</button></li>
              <li><button onClick={() => handleTabChange('schedule')} className="hover:text-blue-400 text-slate-400 transition text-left cursor-pointer">대회/세미나 일정</button></li>
              <li><button onClick={() => handleTabChange('donations')} className="hover:text-blue-400 text-slate-400 transition text-left cursor-pointer">기부금 공개 실적</button></li>
            </ul>
          </div>

          {/* Secondary links Column */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">온라인 업무</h5>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => handleTabChange('teams')} className="hover:text-blue-400 text-slate-400 transition text-left cursor-pointer">전국 가입팀 검색</button></li>
              <li><button onClick={() => handleTabChange('athletes')} className="hover:text-blue-400 text-slate-400 transition text-left cursor-pointer">공인 등록선수 조회</button></li>
              <li><button onClick={() => handleTabChange('notice')} className="hover:text-blue-400 text-slate-400 transition text-left cursor-pointer">사무국 공지사항</button></li>
              <li><button onClick={() => handleTabChange('contact')} className="hover:text-blue-400 text-slate-400 transition text-left cursor-pointer">지도자 교육 신청</button></li>
              <li><button onClick={() => handleTabChange('contact')} className="hover:text-blue-400 text-slate-400 transition text-left cursor-pointer">일반/제휴 온라인 문의</button></li>
            </ul>
          </div>

          {/* Certifications and legal details */}
          <div className="md:col-span-4 space-y-3.5 text-slate-400 text-[11px] leading-relaxed">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">법적 기재 및 인가 번호</h5>
            
            <div className="space-y-1.5 font-light">
              <p>• 비영리 사단법인 설립 허가번호: {associationInfo.permitNumber || '제2013-11-0043호'}</p>
              <p>• 고유번호증: {associationInfo.businessNumber || '220-82-14881'} | 대표자: {associationInfo.representative || '이성규'}</p>
              <p>• 호스팅 및 시스템 운영자: KCF 전산혁신실무위원회</p>
              <p className="text-[10px] text-slate-500 mt-3">
                본 웹사이트는 AI Studio Build 에이전트를 통해 개발된 KCF 안심 통합 가이드라인 인터랙티브 포털입니다.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-900/40 border border-slate-800 text-[10px] px-2.5 py-1 rounded-full font-mono">
                {isDbConnected === true ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-400">실시간 데이터베이스 연결 완료 (Cloud Firestore Active)</span>
                  </>
                ) : isDbConnected === false ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span className="text-rose-400">데이터베이스 연결 끊김 (재연결 중...)</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-amber-400">데이터베이스 연결 시도 중...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll To Top button & Hidden Administrator Page access */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span>개인정보처리방침 | 이용약관 | 이메일무단수집거부</span>
            {/* The Discreet / Hidden Admin page button requested by the user */}
            <button 
              id="discreet-admin-console-btn"
              onClick={() => {
                triggerAdminAction(() => {
                  setIsAdminMode(true);
                  setShowAdminDashboardModal(true);
                });
              }}
              className="text-slate-600 hover:text-slate-400 cursor-pointer font-medium transition flex items-center gap-1 border border-slate-800 rounded px-2 py-0.5"
            >
              <Settings className="w-3 h-3" />
              <span>[KCF 관리자 시스템]</span>
            </button>
          </div>
          <button 
            id="scroll-to-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-blue-400 hover:underline transition font-semibold"
          >
            ▲ 맨 위로 이동 (Scroll to Top)
          </button>
        </div>
      </footer>

      {/* 11. Custom Hidden Admin Dashboard Modal (관리자 제어 센터) */}
      <AnimatePresence>
        {showAdminDashboardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setShowAdminDashboardModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="relative bg-white border border-zinc-200 rounded-3xl p-5 md:p-8 max-w-7xl w-full mx-4 md:mx-8 max-h-[92vh] overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              {/* Close Button */}
              <button
                id="close-admin-dashboard"
                onClick={() => setShowAdminDashboardModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-zinc-55 border border-zinc-200 text-zinc-900">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2 tracking-tight">
                    KCF 통합 관리자 제어 센터
                    <span className="text-[9px] bg-red-500 text-white font-black uppercase px-2 py-0.5 rounded tracking-widest">ADMIN</span>
                  </h3>
                  <p className="text-xs text-zinc-400">실시간 데이터 수집 및 공지사항, 소속 팀 명부, 온라인 접수 현황을 모니터링합니다.</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-1.5 p-1.5 bg-zinc-100 rounded-2xl mb-6 w-full overflow-x-auto no-scrollbar scroll-smooth">
                {[
                  { id: 'stats', label: '종합 요약', icon: Activity },
                  { id: 'notices', label: '공지 관리', icon: Megaphone },
                  { id: 'teams', label: '등록팀 관리', icon: Users },
                  { id: 'inquiries', label: '문의 관리인 박스', icon: Inbox },
                  { id: 'schedules', label: '일정 관리', icon: Calendar },
                  { id: 'images', label: '이미지 관리', icon: Image },
                  { id: 'athletes', label: '등록선수 관리', icon: UserCheck },
                  { id: 'competitions', label: '대회 정보 관리', icon: Trophy },
                  { id: 'donations', label: '기부금 관리', icon: Heart },
                  { id: 'headers', label: '안내문구 & 핵심약속', icon: Type },
                  { id: 'association', label: '협회 정보 관리', icon: Settings },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAdminActiveTab(tab.id as any)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-300 cursor-pointer shrink-0 ${
                        adminActiveTab === tab.id
                          ? 'bg-white text-zinc-950 shadow-sm font-semibold'
                          : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Content Panels */}
              <div className="flex-1 overflow-y-auto pr-1">
                
                {/* 1. Statistics Panel */}
                {adminActiveTab === 'stats' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl">
                        <span className="text-xs text-zinc-400 font-semibold block mb-1">총 등록 공지</span>
                        <div className="text-3xl font-black text-zinc-900 tracking-tight">{notices.length}건</div>
                        <span className="text-[10px] text-zinc-400 block mt-2">상단 고정 중요 공지: {notices.filter(n => n.isImportant).length}건</span>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl">
                        <span className="text-xs text-zinc-400 font-semibold block mb-1">총 가입 치어팀</span>
                        <div className="text-3xl font-black text-zinc-900 tracking-tight">{teams.length}개 단체</div>
                        <span className="text-[10px] text-zinc-400 block mt-2">총 소속 선수: {teams.reduce((acc, t) => acc + t.memberCount, 0)}명</span>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl">
                        <span className="text-xs text-zinc-400 font-semibold block mb-1">총 접수된 민원문의</span>
                        <div className="text-3xl font-black text-zinc-900 tracking-tight">{inquiries.length}건</div>
                        <span className="text-[10px] text-zinc-400 block mt-2">미검토 건: {inquiries.filter(i => i.status === 'received').length}건</span>
                      </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-zinc-900">최근 문의 실시간 타임라인</h4>
                      <div className="space-y-2">
                        {inquiries.slice(0, 3).map(inq => (
                          <div key={inq.id} className="bg-white border border-zinc-200/80 p-3 rounded-xl flex justify-between items-center text-xs shadow-sm">
                            <div>
                              <span className="font-bold text-zinc-800">{inq.name}</span>
                              <span className="text-zinc-300 mx-2">|</span>
                              <span className="text-zinc-500 truncate max-w-md inline-block align-bottom">{inq.subject}</span>
                            </div>
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">{inq.date}</span>
                          </div>
                        ))}
                        {inquiries.length === 0 && (
                          <div className="text-center text-xs text-zinc-400 py-6">최근 접수된 온라인 서류 또는 문의가 없습니다.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Notice Manager Panel */}
                {adminActiveTab === 'notices' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-zinc-950">등록된 공지사항 목록 ({notices.length})</h4>
                      <button
                        onClick={() => {
                          if (showAddNoticeForm) {
                            setShowAddNoticeForm(false);
                            setAdminEditingNotice(null);
                            setNewNoticeTitle('');
                            setNewNoticeContent('');
                            setNewNoticeCategory('general');
                            setNewNoticeIsImportant(false);
                          } else {
                            setShowAddNoticeForm(true);
                            setAdminEditingNotice(null);
                            setNewNoticeTitle('');
                            setNewNoticeContent('');
                            setNewNoticeCategory('general');
                            setNewNoticeIsImportant(false);
                          }
                        }}
                        className="text-xs bg-zinc-900 text-white font-semibold px-4 py-1.5 rounded-full hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {showAddNoticeForm ? '작성 취소' : '새 공지 등록'}
                      </button>
                    </div>

                    {/* Notice Form (Expandable) */}
                    <AnimatePresence>
                      {showAddNoticeForm && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4 mb-4">
                            <h5 className="text-xs font-bold text-zinc-900">
                              {adminEditingNotice ? '공지사항 수정' : '새 공지사항 등록'}
                            </h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] text-zinc-500 font-semibold">공지 제목</label>
                                <input
                                  type="text"
                                  placeholder="공지사항 제목을 입력해 주세요."
                                  value={newNoticeTitle}
                                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">카테고리</label>
                                <select
                                  value={newNoticeCategory}
                                  onChange={(e) => setNewNoticeCategory(e.target.value as any)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                >
                                  <option value="general">일반 공지</option>
                                  <option value="competition">대회 소식</option>
                                  <option value="education">지도자 교육</option>
                                  <option value="selection">국가대표 선발</option>
                                  <option value="admin">협회 행정</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-zinc-500 font-semibold">공지 내용</label>
                              <textarea
                                rows={6}
                                placeholder="공지 상세 내용을 구체적으로 작성해 주세요."
                                value={newNoticeContent}
                                onChange={(e) => setNewNoticeContent(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 resize-none leading-relaxed"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                id="admin-notice-important"
                                type="checkbox"
                                checked={newNoticeIsImportant}
                                onChange={(e) => setNewNoticeIsImportant(e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                              />
                              <label htmlFor="admin-notice-important" className="text-xs font-semibold text-zinc-700">
                                상단 고정 및 중요 공지로 표시 ([중요] 태그 부착)
                              </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => {
                                  setShowAddNoticeForm(false);
                                  setAdminEditingNotice(null);
                                  setNewNoticeTitle('');
                                  setNewNoticeContent('');
                                  setNewNoticeCategory('general');
                                  setNewNoticeIsImportant(false);
                                }}
                                className="bg-white border border-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                              >
                                취소
                              </button>
                              <button
                                onClick={handleAddNoticeFromAdmin}
                                className="bg-zinc-900 text-white font-semibold px-5 py-2 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer"
                              >
                                {adminEditingNotice ? '공지 수정 완료' : '공지사항 게시'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                      <table className="w-full text-xs text-left text-zinc-600 min-w-[700px]">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 uppercase font-bold text-[11px]">
                          <tr>
                            <th className="px-4 py-3">카테고리</th>
                            <th className="px-4 py-3">제목</th>
                            <th className="px-4 py-3">날짜</th>
                            <th className="px-4 py-3">조회수</th>
                            <th className="px-4 py-3 text-right">관리 조작</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {notices.map(notice => (
                            <tr key={notice.id} className="hover:bg-zinc-50/50 transition">
                              <td className="px-4 py-3.5 font-bold text-zinc-900">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-zinc-100 border border-zinc-200/80">
                                  {notice.category === 'competition' ? '대회 소식' :
                                   notice.category === 'education' ? '지도자 교육' :
                                   notice.category === 'selection' ? '국가대표 선발' :
                                   notice.category === 'admin' ? '협회 행정' : '일반 공지'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 font-medium text-zinc-800 max-w-sm truncate">
                                {notice.isImportant && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-1.5">중요</span>}
                                {notice.title}
                              </td>
                              <td className="px-4 py-3.5 text-zinc-400">{notice.date}</td>
                              <td className="px-4 py-3.5 font-mono">{notice.views}</td>
                              <td className="px-4 py-3.5 text-right space-x-1 sm:space-x-2">
                                <button
                                  onClick={() => {
                                    setAdminEditingNotice(notice);
                                    setNewNoticeTitle(notice.title);
                                    setNewNoticeContent(notice.content);
                                    setNewNoticeCategory(notice.category);
                                    setNewNoticeIsImportant(!!notice.isImportant);
                                    setShowAddNoticeForm(true);
                                  }}
                                  className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded px-2 py-1 transition text-[10px] font-semibold"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleToggleNoticeFixed(notice.id)}
                                  className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                                    notice.isImportant ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                                  }`}
                                >
                                  {notice.isImportant ? '고정 해제' : '상단 고정'}
                                </button>
                                <button
                                  onClick={() => handleDeleteNoticeFromAdmin(notice.id)}
                                  className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded px-2.5 py-1 transition text-[10px]"
                                >
                                  삭제
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Team Directory Manager Panel */}
                {adminActiveTab === 'teams' && (
                  <div className="space-y-6">
                    {/* Team Categories Editor Box */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                        <div>
                          <h5 className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-zinc-500" />
                            가입팀 종목(카테고리) 목록 설정 및 관리
                          </h5>
                          <p className="text-[10px] text-zinc-400 mt-0.5">등록팀의 하위 종목분류를 추가, 수정, 삭제하고 실시간으로 연동시킵니다.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Categories List */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">현재 등록된 종목 목록</div>
                          <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                            {teamCategories.map((cat) => (
                              <div key={cat.id} className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl px-3 py-2">
                                {editingTeamCatId === cat.id ? (
                                  <div className="flex items-center gap-1.5 w-full">
                                    <input
                                      type="text"
                                      value={editingTeamCatLabel}
                                      onChange={(e) => setEditingTeamCatLabel(e.target.value)}
                                      className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 w-full focus:outline-none focus:border-zinc-950 font-semibold"
                                      placeholder="종목명 입력"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!editingTeamCatLabel.trim()) {
                                          showToast('이름을 입력해 주세요.', 'error');
                                          return;
                                        }
                                        const updated = teamCategories.map(c => c.id === cat.id ? { ...c, label: editingTeamCatLabel.trim() } : c);
                                        setTeamCategories(updated);
                                        setEditingTeamCatId(null);
                                        showToast('종목명이 성공적으로 변경되었습니다.', 'success');
                                      }}
                                      className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer text-[10px]"
                                    >
                                      저장
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTeamCatId(null)}
                                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold px-2 py-1 rounded-lg transition shrink-0 cursor-pointer text-[10px]"
                                    >
                                      취소
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                                      <span className="font-semibold text-zinc-850 text-xs">{cat.label}</span>
                                      <span className="text-[9px] text-zinc-400 font-mono">({cat.id})</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingTeamCatId(cat.id);
                                          setEditingTeamCatLabel(cat.label);
                                        }}
                                        className="text-[10px] text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 p-1 rounded-lg transition cursor-pointer"
                                        title="수정"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (teamCategories.length <= 1) {
                                            showToast('최소한 1개 이상의 종목 카테고리는 유지해야 합니다.', 'error');
                                            return;
                                          }
                                          showConfirm(
                                            '종목 카테고리 삭제',
                                            `"${cat.label}" 종목을 삭제하시겠습니까? 해당 종목에 소속된 팀들은 첫 번째 등록된 종목 카테고리로 자동으로 일괄 이동됩니다.`,
                                            () => {
                                              const updated = teamCategories.filter(c => c.id !== cat.id);
                                              setTeamCategories(updated);
                                              
                                              // Fallback category for existing teams
                                              const fallbackId = updated[0]?.id || 'club';
                                              const updatedTeams = teams.map(t => t.category === cat.id ? { ...t, category: fallbackId } : t);
                                              setTeams(updatedTeams);
                                              
                                              showToast('종목 카테고리가 삭제되었습니다.', 'success');
                                            }
                                          );
                                        }}
                                        className="text-[10px] text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition cursor-pointer"
                                        title="삭제"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add New Category */}
                        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">새 종목 추가</div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[9px] text-zinc-400 font-bold mb-1">종목 영문 고유 ID (예: highschool, kids)</label>
                                <input
                                  type="text"
                                  value={newTeamCatIdState}
                                  onChange={(e) => setNewTeamCatIdState(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 font-mono"
                                  placeholder="영문, 숫자, 하이픈(-)만 가능"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-zinc-400 font-bold mb-1">종목 한글 표시명 (예: 고등부 스쿨팀)</label>
                                <input
                                  type="text"
                                  value={newTeamCatLabelState}
                                  onChange={(e) => setNewTeamCatLabelState(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 font-semibold"
                                  placeholder="화면에 표시될 이름"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newTeamCatIdState.trim() || !newTeamCatLabelState.trim()) {
                                showToast('종목 영문 ID와 한글 명칭을 모두 입력해 주세요.', 'error');
                                return;
                              }
                              if (teamCategories.some(c => c.id === newTeamCatIdState.trim())) {
                                showToast('이미 존재하는 종목 영문 ID입니다.', 'error');
                                return;
                              }
                              const added = [
                                ...teamCategories,
                                { id: newTeamCatIdState.trim(), label: newTeamCatLabelState.trim() }
                              ];
                              setTeamCategories(added);
                              setNewTeamCatIdState('');
                              setNewTeamCatLabelState('');
                              showToast('새 종목 카테고리가 등록되었습니다.', 'success');
                            }}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 rounded-xl transition cursor-pointer text-xs shadow-xs mt-3 flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            종목 추가하기
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Team Regions Editor Box */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                        <div>
                          <h5 className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                            가입팀 소속 지부(지역구) 목록 설정 및 관리
                          </h5>
                          <p className="text-[10px] text-zinc-400 mt-0.5">치어리딩 팀들이 속하는 전국 지부 및 지역구를 설정하고 실시간으로 연동시킵니다.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Regions List */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">현재 등록된 지부 목록</div>
                          <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                            {teamRegions.map((reg, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl px-3 py-2">
                                {editingTeamRegionIdx === idx ? (
                                  <div className="flex items-center gap-1.5 w-full">
                                    <input
                                      type="text"
                                      value={editingTeamRegionValue}
                                      onChange={(e) => setEditingTeamRegionValue(e.target.value)}
                                      className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 w-full focus:outline-none focus:border-zinc-950 font-semibold"
                                      placeholder="지부명 입력"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!editingTeamRegionValue.trim()) {
                                          showToast('지부명을 입력해 주세요.', 'error');
                                          return;
                                        }
                                        const oldName = reg;
                                        const newName = editingTeamRegionValue.trim();
                                        
                                        // Update the regions list
                                        const updated = [...teamRegions];
                                        updated[idx] = newName;
                                        setTeamRegions(updated);
                                        
                                        // Update existing teams using this region
                                        const updatedTeams = teams.map(t => t.region === oldName ? { ...t, region: newName } : t);
                                        setTeams(updatedTeams);
                                        
                                        setEditingTeamRegionIdx(null);
                                        showToast('지부명이 성공적으로 변경되었습니다.', 'success');
                                      }}
                                      className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer text-[10px]"
                                    >
                                      저장
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTeamRegionIdx(null)}
                                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold px-2 py-1 rounded-lg transition shrink-0 cursor-pointer text-[10px]"
                                    >
                                      취소
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      <span className="font-semibold text-zinc-850 text-xs">{reg} 지부</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingTeamRegionIdx(idx);
                                          setEditingTeamRegionValue(reg);
                                        }}
                                        className="text-[10px] text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 p-1 rounded-lg transition cursor-pointer"
                                        title="수정"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (teamRegions.length <= 1) {
                                            showToast('최소한 1개 이상의 지역 지부는 유지해야 합니다.', 'error');
                                            return;
                                          }
                                          showConfirm(
                                            '지부 삭제',
                                            `"${reg}" 지부를 삭제하시겠습니까? 해당 지부에 소속된 팀들은 첫 번째 등록된 지부로 자동으로 일괄 변경됩니다.`,
                                            () => {
                                              const updated = teamRegions.filter((_, i) => i !== idx);
                                              setTeamRegions(updated);
                                              
                                              // Fallback region for existing teams
                                              const fallbackRegion = updated[0] || '서울';
                                              const updatedTeams = teams.map(t => t.region === reg ? { ...t, region: fallbackRegion } : t);
                                              setTeams(updatedTeams);
                                              
                                              showToast('지부가 삭제되었습니다.', 'success');
                                            }
                                          );
                                        }}
                                        className="text-[10px] text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition cursor-pointer"
                                        title="삭제"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add New Region */}
                        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">새 지부 추가</div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[9px] text-zinc-400 font-bold mb-1">지부명 (예: 충청, 전라, 광주)</label>
                                <input
                                  type="text"
                                  value={newTeamRegionValue}
                                  onChange={(e) => setNewTeamRegionValue(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 font-semibold"
                                  placeholder="'지부' 생략 후 입력 (예: 대전)"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newTeamRegionValue.trim()) {
                                showToast('추가할 지부명을 입력해 주세요.', 'error');
                                return;
                              }
                              if (teamRegions.includes(newTeamRegionValue.trim())) {
                                showToast('이미 존재하는 지부명입니다.', 'error');
                                return;
                              }
                              const added = [
                                ...teamRegions,
                                newTeamRegionValue.trim()
                              ];
                              setTeamRegions(added);
                              setNewTeamRegionValue('');
                              showToast('새 지부(지역구)가 등록되었습니다.', 'success');
                            }}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 rounded-xl transition cursor-pointer text-xs shadow-xs mt-3 flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            지부 추가하기
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <h4 className="text-xs font-bold text-zinc-950">정식 가입팀 디렉토리 목록 ({teams.length})</h4>
                      <button
                        onClick={() => setShowAddTeamForm(!showAddTeamForm)}
                        className="text-xs bg-zinc-900 text-white font-semibold px-4 py-1.5 rounded-full hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {showAddTeamForm ? '등록 폼 닫기' : '새 가입팀 등록'}
                      </button>
                    </div>

                    {/* Add Team Expandable Form */}
                    <AnimatePresence>
                      {showAddTeamForm && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4 mb-4">
                            <h5 className="text-xs font-bold text-zinc-900">새 가입팀 상세 등록</h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">가입 팀명</label>
                                <input
                                  type="text"
                                  placeholder="예: 스타치어 아카데미"
                                  value={newTeamName}
                                  onChange={(e) => setNewTeamName(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">종목 분류</label>
                                <select
                                  value={newTeamCategory}
                                  onChange={(e) => setNewTeamCategory(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                >
                                  {teamCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">소속 지부</label>
                                <select
                                  value={newTeamRegion}
                                  onChange={(e) => setNewTeamRegion(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                >
                                  {teamRegions.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">소속 선수 수</label>
                                <input
                                  type="number"
                                  value={newTeamMemberCount}
                                  onChange={(e) => setNewTeamMemberCount(Number(e.target.value))}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">담당 지도자 (감독/코치)</label>
                                <input
                                  type="text"
                                  placeholder="예: 김지현"
                                  value={newTeamCoach}
                                  onChange={(e) => setNewTeamCoach(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">창단 년도</label>
                                <input
                                  type="text"
                                  placeholder="예: 2021"
                                  value={newTeamEstablished}
                                  onChange={(e) => setNewTeamEstablished(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">팀 한줄 설명</label>
                                <input
                                  type="text"
                                  placeholder="예: 최강의 퍼포먼스를 지향하는 정통 올스타 치어리딩 구단입니다."
                                  value={newTeamDescription}
                                  onChange={(e) => setNewTeamDescription(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">비상 연락처 / 홈페이지</label>
                                <input
                                  type="text"
                                  placeholder="예: 010-1234-5678 또는 cheer.co.kr"
                                  value={newTeamContact}
                                  onChange={(e) => setNewTeamContact(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => {
                                  setShowAddTeamForm(false);
                                  setNewTeamName('');
                                  setNewTeamCategory('allstar');
                                  setNewTeamRegion(teamRegions[0] || '서울');
                                  setNewTeamCoach('');
                                  setNewTeamEstablished('');
                                  setNewTeamDescription('');
                                  setNewTeamContact('');
                                }}
                                className="bg-white border border-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => {
                                  if (!newTeamName || !newTeamRegion || !newTeamCoach) {
                                    alert('필수 필드(팀명, 지부, 지도자)를 모두 입력해 주세요.');
                                    return;
                                  }
                                  handleAddTeamFromAdmin({
                                    name: newTeamName,
                                    category: newTeamCategory,
                                    region: newTeamRegion,
                                    memberCount: newTeamMemberCount,
                                    coach: newTeamCoach,
                                    established: newTeamEstablished || '2026',
                                    description: newTeamDescription || '정식 가입 단체',
                                    contact: newTeamContact || '협회 사무국 문의'
                                  });
                                  setShowAddTeamForm(false);
                                  setNewTeamName('');
                                  setNewTeamCategory('allstar');
                                  setNewTeamRegion(teamRegions[0] || '서울');
                                  setNewTeamCoach('');
                                  setNewTeamEstablished('');
                                  setNewTeamDescription('');
                                  setNewTeamContact('');
                                }}
                                className="bg-zinc-900 text-white font-semibold px-5 py-2 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer"
                              >
                                정식 단체 등록 완료
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                      <table className="w-full text-xs text-left text-zinc-600 min-w-[850px]">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 uppercase font-bold text-[11px]">
                          <tr>
                            <th className="px-4 py-3">팀명 및 상세내용</th>
                            <th className="px-4 py-3">종목</th>
                            <th className="px-4 py-3">지부</th>
                            <th className="px-4 py-3">선수 수</th>
                            <th className="px-4 py-3">지도자 및 연락처</th>
                            <th className="px-4 py-3 text-right">관리 조작</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {teams.map(team => {
                            const isEditing = editingTeamId === team.id;
                            const editData = editingTeamData;

                            if (isEditing && editData) {
                              return (
                                <tr key={team.id} className="bg-zinc-50/70">
                                  {/* Team Name, Established, Description Edit */}
                                  <td className="px-4 py-3">
                                    <div className="space-y-1">
                                      <div className="flex gap-1.5">
                                        <input
                                          type="text"
                                          value={editData.name}
                                          onChange={(e) => setEditingTeamData({ ...editData, name: e.target.value })}
                                          className="flex-1 bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 font-bold focus:outline-none focus:border-zinc-900"
                                          placeholder="팀명"
                                        />
                                        <input
                                          type="text"
                                          value={editData.established}
                                          onChange={(e) => setEditingTeamData({ ...editData, established: e.target.value })}
                                          className="w-16 bg-white border border-zinc-200 rounded-lg px-1.5 py-1 text-[10px] text-zinc-700 focus:outline-none focus:border-zinc-900 text-center"
                                          placeholder="창단년도"
                                        />
                                      </div>
                                      <input
                                        type="text"
                                        value={editData.description}
                                        onChange={(e) => setEditingTeamData({ ...editData, description: e.target.value })}
                                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-[10px] text-zinc-500 focus:outline-none focus:border-zinc-900"
                                        placeholder="팀 한줄 설명"
                                      />
                                    </div>
                                  </td>

                                  {/* Category Edit */}
                                  <td className="px-4 py-3">
                                    <select
                                      value={editData.category}
                                      onChange={(e) => setEditingTeamData({ ...editData, category: e.target.value })}
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    >
                                      {teamCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                      ))}
                                    </select>
                                  </td>

                                  {/* Region Edit */}
                                  <td className="px-4 py-3">
                                    <select
                                      value={editData.region}
                                      onChange={(e) => setEditingTeamData({ ...editData, region: e.target.value })}
                                      className="w-24 bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    >
                                      {teamRegions.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                      ))}
                                    </select>
                                  </td>

                                  {/* Member Count Edit */}
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        value={editData.memberCount}
                                        onChange={(e) => setEditingTeamData({ ...editData, memberCount: Number(e.target.value) })}
                                        className="w-14 bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono font-bold"
                                        min="0"
                                      />
                                      <span className="text-[10px] text-zinc-500">명</span>
                                    </div>
                                  </td>

                                  {/* Coach and Contact Edit */}
                                  <td className="px-4 py-3">
                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        value={editData.coach}
                                        onChange={(e) => setEditingTeamData({ ...editData, coach: e.target.value })}
                                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-semibold"
                                        placeholder="지도자명"
                                      />
                                      <input
                                        type="text"
                                        value={editData.contact}
                                        onChange={(e) => setEditingTeamData({ ...editData, contact: e.target.value })}
                                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-[10px] text-zinc-500 focus:outline-none focus:border-zinc-900"
                                        placeholder="연락처"
                                      />
                                    </div>
                                  </td>

                                  {/* Actions for Edit Mode */}
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex gap-1 justify-end">
                                      <button
                                        onClick={() => {
                                          if (!editData.name || !editData.region || !editData.coach) {
                                            showToast('팀명, 지부, 지도자명은 필수 항목입니다.', 'error');
                                            return;
                                          }
                                          handleUpdateTeamFromAdmin(editData);
                                          setEditingTeamId(null);
                                          setEditingTeamData(null);
                                        }}
                                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded px-2.5 py-1.5 text-[10px] transition cursor-pointer"
                                      >
                                        저장
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingTeamId(null);
                                          setEditingTeamData(null);
                                        }}
                                        className="bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold rounded px-2.5 py-1.5 text-[10px] transition cursor-pointer"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <tr key={team.id} className="hover:bg-zinc-50/50 transition">
                                <td className="px-4 py-3.5">
                                  <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                                    <span>{team.name}</span>
                                    <span className="text-[10px] text-zinc-400 font-normal">({team.established}년 창단)</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{team.description}</div>
                                </td>
                                <td className="px-4 py-3.5 font-semibold text-zinc-700">
                                  {teamCategories.find(c => c.id === team.category)?.label || team.category}
                                </td>
                                <td className="px-4 py-3.5 text-zinc-600">{team.region}</td>
                                <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">{team.memberCount}명</td>
                                <td className="px-4 py-3.5">
                                  <div className="font-semibold text-zinc-800">{team.coach} 감독</div>
                                  <div className="text-[10px] text-zinc-400 mt-0.5">{team.contact}</div>
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <div className="flex gap-1.5 justify-end">
                                    <button
                                      onClick={() => {
                                        setEditingTeamId(team.id);
                                        setEditingTeamData({ ...team });
                                      }}
                                      className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 rounded px-2.5 py-0.5 transition text-[10px] font-semibold cursor-pointer"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => {
                                        showConfirm(
                                          '가입 단체 명부 제거',
                                          `정식 가입 등록 팀인 ${team.name}의 모든 협회 승인 명부를 시스템에서 영구히 삭제하시겠습니까?`,
                                          () => handleDeleteTeamFromAdmin(team.id)
                                        );
                                      }}
                                      className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded px-2.5 py-0.5 transition text-[10px] font-semibold cursor-pointer"
                                    >
                                      제거
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Inquiry Inbox Manager Panel */}
                {adminActiveTab === 'inquiries' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-950">실시간 민원접수함 현황 ({inquiries.length})</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">사용자 문의 및 신규 팀 가입 신청 내역을 검토하고 즉각적인 행정 처리를 지원합니다.</p>
                      </div>
                      {inquiries.length > 0 && (
                        <button
                          onClick={() => {
                            showConfirm(
                              '전체 영구 소거',
                              '모든 온라인 민원/문의 접수 이력을 영구적으로 소거하시겠습니까?',
                              () => {
                                setInquiries([]);
                              }
                            );
                          }}
                          className="text-xs border border-red-200 text-red-500 hover:bg-red-50 font-bold px-3 py-1.5 rounded-full transition cursor-pointer"
                        >
                          전체 영구 소거
                        </button>
                      )}
                    </div>

                    {/* Inquiry Sub-category Filtering Tabs */}
                    <div className="flex flex-wrap gap-1 p-1 bg-zinc-100 rounded-2xl w-max">
                      {[
                        { id: 'all', label: `전체 내역 (${inquiries.length}건)` },
                        { id: 'contact', label: `일반 상담/문의 (${inquiries.filter(i => i.type !== 'team_reg').length}건)` },
                        { id: 'team_reg', label: `신규 팀 가입 신청 (${inquiries.filter(i => i.type === 'team_reg').length}건)` }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setInquiryFilter(tab.id as any)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                            inquiryFilter === tab.id
                              ? 'bg-zinc-900 text-white shadow-sm'
                              : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const filteredInquiries = inquiries.filter(inq => {
                          if (inquiryFilter === 'all') return true;
                          if (inquiryFilter === 'team_reg') return inq.type === 'team_reg';
                          return inq.type !== 'team_reg';
                        });

                        if (filteredInquiries.length === 0) {
                          return (
                            <div className="text-center py-16 border border-dashed border-zinc-200 bg-zinc-50 rounded-2xl text-zinc-400 text-xs">
                              선택하신 필터 조건에 부합하는 접수 내역이 없습니다.
                            </div>
                          );
                        }

                        return filteredInquiries.map(inq => {
                          let isTeamReg = inq.type === 'team_reg';
                          let teamRegData: any = null;
                          if (isTeamReg) {
                            try {
                              teamRegData = JSON.parse(inq.message);
                            } catch (e) {
                              isTeamReg = false;
                            }
                          }

                          return (
                            <div key={inq.id} className="border border-zinc-200 p-5 rounded-2xl bg-zinc-50 hover:bg-white transition space-y-3 shadow-sm">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border mr-2 ${
                                    isTeamReg ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-100'
                                  }`}>
                                    {isTeamReg ? '팀 가입 신청' : inq.type === 'competition' ? '대회 문의' : inq.type === 'coaching' ? '강습회 문의' : '일반 상담'}
                                  </span>
                                  <span className="text-xs font-bold text-zinc-900">
                                    {isTeamReg ? teamRegData?.coach : inq.name} {isTeamReg ? '신청인(지도자)' : '담당자'}
                                  </span>
                                  <span className="text-xs text-zinc-300 mx-2">|</span>
                                  <span className="text-xs text-zinc-500">{isTeamReg ? teamRegData?.contact : inq.contact}</span>
                                  {!isTeamReg && (
                                    <>
                                      <span className="text-xs text-zinc-300 mx-1">/</span>
                                      <span className="text-xs text-zinc-500">{inq.email}</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-mono text-zinc-400">{inq.date}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    inq.status === 'replied' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    inq.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    'bg-red-50 text-red-500 border border-red-100'
                                  }`}>
                                    {inq.status === 'replied' ? (isTeamReg ? '가입승인 완료' : '답변완료') : inq.status === 'in_progress' ? '검토중' : '접수완료'}
                                  </span>
                                </div>
                              </div>

                              {isTeamReg && teamRegData ? (
                                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-3 text-xs">
                                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                    <div className="font-bold text-zinc-950 text-sm flex items-center gap-2">
                                      <Trophy className="w-4 h-4 text-amber-500" />
                                      {teamRegData.name} <span className="text-[11px] text-zinc-400 font-normal">신청 정보</span>
                                    </div>
                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                      {teamRegData.category === 'allstar' ? '올스타 (All-Star)' : teamRegData.category === 'university' ? '대학부 (University)' : '일반클럽 (Club)'}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                    <div>
                                      <span className="text-zinc-400 block text-[10px]">연고지 / 지부</span>
                                      <span className="font-bold text-zinc-800">{teamRegData.region} 지부</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400 block text-[10px]">대표 지도자</span>
                                      <span className="font-bold text-zinc-800">{teamRegData.coach} 감독</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400 block text-[10px]">선수단 인원수</span>
                                      <span className="font-bold text-zinc-800">{teamRegData.memberCount}명</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400 block text-[10px]">연락처 / 대표번호</span>
                                      <span className="font-bold text-zinc-800">{teamRegData.contact}</span>
                                    </div>
                                  </div>

                                  <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg space-y-1">
                                    <span className="text-[10px] text-zinc-400 font-bold block">팀 소개글 및 가입 동기</span>
                                    <p className="text-xs text-zinc-600 whitespace-pre-wrap font-normal leading-relaxed">
                                      {teamRegData.description}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2 text-xs">
                                  <div className="font-bold text-zinc-950 text-xs">{inq.subject}</div>
                                  <p className="text-xs text-zinc-600 font-normal whitespace-pre-wrap leading-relaxed">
                                    {inq.message}
                                  </p>
                                </div>
                              )}

                              <div className="flex justify-between items-center text-xs pt-1 flex-wrap gap-2">
                                <span className="text-zinc-400 font-light font-mono text-[10px]">인증 코드: {inq.id}</span>
                                <div className="flex gap-2">
                                  {isTeamReg && teamRegData && inq.status !== 'replied' && (
                                    <button
                                      onClick={() => {
                                        showConfirm(
                                          '신규 가입 승인 및 공식 등록',
                                          `"${teamRegData.name}" 단체를 한국치어리딩협회(KCF) 공식 가입팀 목록에 즉시 등록하고 본 신청 건을 최종 승인 처리하시겠습니까?`,
                                          () => {
                                            const newTeam = {
                                              id: `team-${Date.now()}`,
                                              name: teamRegData.name,
                                              category: teamRegData.category,
                                              region: teamRegData.region,
                                              memberCount: Number(teamRegData.memberCount),
                                              coach: teamRegData.coach,
                                              established: teamRegData.established || new Date().toISOString().split('T')[0],
                                              description: teamRegData.description,
                                              contact: teamRegData.contact
                                            };
                                            const updatedTeams = [...teams, newTeam];
                                            setTeams(updatedTeams);

                                            handleUpdateInquiryStatus(inq.id, 'replied');
                                            showToast(`"${teamRegData.name}" 단체가 공식 가입팀으로 승인 및 성공적으로 등록되었습니다.`, 'success');
                                          }
                                        );
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded transition text-[10px] flex items-center gap-1 shadow-sm cursor-pointer"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      가입 승인 (팀 등록)
                                    </button>
                                  )}

                                  {!isTeamReg && inq.status !== 'replied' && (
                                    <button
                                      onClick={() => handleUpdateInquiryStatus(inq.id, 'replied')}
                                      className="bg-emerald-500 text-white font-bold px-3 py-1 rounded hover:bg-emerald-600 transition text-[10px] cursor-pointer"
                                    >
                                      답변 완료로 표기
                                    </button>
                                  )}
                                  
                                  {inq.status === 'received' && (
                                    <button
                                      onClick={() => handleUpdateInquiryStatus(inq.id, 'in_progress')}
                                      className="bg-zinc-900 text-white font-bold px-3 py-1 hover:bg-zinc-800 transition text-[10px] cursor-pointer"
                                    >
                                      검토중으로 전환
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => handleDeleteInquiry(inq.id)}
                                    className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded px-2.5 py-1 transition text-[10px] cursor-pointer"
                                  >
                                    접수 삭제
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* 5. Schedule Manager Panel */}
                {adminActiveTab === 'schedules' && (
                  <div id="admin-schedules-section" className="space-y-6">
                    {/* Schedule Categories Management */}
                    <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-150 pb-2 gap-2">
                        <div>
                          <span className="text-xs font-black text-zinc-900">일정 카테고리 (구분 유형) 설정</span>
                          <p className="text-[10px] text-zinc-400 mt-0.5">일정 안내 페이지와 일정 등록 폼에 실시간 반영될 구분 카테고리를 추가/수정합니다.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            showConfirm(
                              '카테고리 기본값 복원',
                              '모든 일정 카테고리를 초기 기본값(국내 대회, 국제 대회, 지도자 교육, 국가대표 선발, 정기 세미나)으로 재설정하시겠습니까?',
                              () => {
                                const defaults = [
                                  { id: 'domestic', label: '국내 대회' },
                                  { id: 'international', label: '국제 대회' },
                                  { id: 'education', label: '지도자 교육' },
                                  { id: 'selection', label: '국가대표 선발' },
                                  { id: 'seminar', label: '정기 세미나' }
                                ];
                                setScheduleCategories(defaults);
                                showToast('일정 카테고리가 기본값으로 복원되었습니다.', 'success');
                              }
                            );
                          }}
                          className="text-[10px] border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 font-bold px-2.5 py-1 rounded-full transition cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <RefreshCw className="w-3 h-3" />
                          기본값 복원
                        </button>
                      </div>

                      {/* Categories List & Add */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* List & Edit Column */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">현재 등록된 카테고리 목록</div>
                          <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                            {scheduleCategories.map((cat) => (
                              <div key={cat.id} className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl px-3 py-2">
                                {editingCatId === cat.id ? (
                                  <div className="flex items-center gap-1.5 w-full">
                                    <input
                                      type="text"
                                      value={editingCatLabel}
                                      onChange={(e) => setEditingCatLabel(e.target.value)}
                                      className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 w-full focus:outline-none focus:border-zinc-950 font-semibold"
                                      placeholder="카테고리명 입력"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!editingCatLabel.trim()) {
                                          showToast('이름을 입력해 주세요.', 'error');
                                          return;
                                        }
                                        const updated = scheduleCategories.map(c => c.id === cat.id ? { ...c, label: editingCatLabel.trim() } : c);
                                        setScheduleCategories(updated);
                                        setEditingCatId(null);
                                        showToast('카테고리명이 변경되었습니다.', 'success');
                                      }}
                                      className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer text-[10px]"
                                    >
                                      저장
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCatId(null)}
                                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold px-2 py-1 rounded-lg transition shrink-0 cursor-pointer text-[10px]"
                                    >
                                      취소
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${getEventBadgeColor(cat.id).split(' ')[0]}`} />
                                      <span className="font-semibold text-zinc-800">{cat.label}</span>
                                      <span className="text-[9px] text-zinc-400 font-mono">({cat.id})</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCatId(cat.id);
                                          setEditingCatLabel(cat.label);
                                        }}
                                        className="text-[10px] text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 p-1 rounded-lg transition cursor-pointer"
                                        title="수정"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (scheduleCategories.length <= 1) {
                                            showToast('최소한 1개 이상의 카테고리는 유지해야 합니다.', 'error');
                                            return;
                                          }
                                          showConfirm(
                                            '카테고리 삭제',
                                            `"${cat.label}" 카테고리를 삭제하시겠습니까? 해당 카테고리로 등록된 일정은 다른 유효한 카테고리로 자동으로 변경됩니다.`,
                                            () => {
                                              const updated = scheduleCategories.filter(c => c.id !== cat.id);
                                              setScheduleCategories(updated);
                                              
                                              // Fallback category for existing events
                                              const fallbackId = updated[0]?.id || 'domestic';
                                              const updatedEvents = events.map(e => e.type === cat.id ? { ...e, type: fallbackId } : e);
                                              setEvents(updatedEvents);
                                              
                                              showToast('카테고리가 삭제되었습니다.', 'success');
                                            }
                                          );
                                        }}
                                        className="text-[10px] text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition cursor-pointer"
                                        title="삭제"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add New Category Column */}
                        <div className="bg-white border border-zinc-150 p-4 rounded-xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">새 카테고리 추가</div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[9px] text-zinc-400 font-bold mb-1">카테고리 영문 고유 ID (예: training, beach)</label>
                                <input
                                  type="text"
                                  value={newCatId}
                                  onChange={(e) => setNewCatId(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 font-mono"
                                  placeholder="영문, 숫자, 하이픈(-)만 가능"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-zinc-400 font-bold mb-1">카테고리 한글 표시명 (예: 하계 연수)</label>
                                <input
                                  type="text"
                                  value={newCatLabel}
                                  onChange={(e) => setNewCatLabel(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 font-semibold"
                                  placeholder="화면에 표시될 이름"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newCatId.trim() || !newCatLabel.trim()) {
                                showToast('영문 ID와 한글 명칭을 모두 입력해 주세요.', 'error');
                                return;
                              }
                              if (scheduleCategories.some(c => c.id === newCatId.trim())) {
                                showToast('이미 존재하는 영문 ID입니다.', 'error');
                                return;
                              }
                              const added = [
                                ...scheduleCategories,
                                { id: newCatId.trim(), label: newCatLabel.trim() }
                              ];
                              setScheduleCategories(added);
                              setNewCatId('');
                              setNewCatLabel('');
                              showToast('새 카테고리가 등록되었습니다.', 'success');
                            }}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 rounded-xl transition cursor-pointer text-xs shadow-xs mt-3 flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            카테고리 추가하기
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-zinc-950">공식 등록 일정 목록 ({events.length})</h4>
                      <button
                        onClick={() => {
                          if (showAddEventForm) {
                            setNewEvTitle('');
                            setNewEvStartDate('');
                            setNewEvEndDate('');
                            setNewEvIsRange(false);
                            setNewEvType('domestic');
                            setNewEvLocation('');
                            setNewEvDescription('');
                            setNewEvStatus('upcoming');
                            setAdminEditingEvent(null);
                            setShowAddEventForm(false);
                          } else {
                            setNewEvStartDate('2026-06-25');
                            setNewEvEndDate('2026-06-25');
                            setNewEvIsRange(false);
                            setAdminEditingEvent(null);
                            setShowAddEventForm(true);
                          }
                        }}
                        className="text-xs bg-zinc-900 text-white font-semibold px-4 py-1.5 rounded-full hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {showAddEventForm ? '작성 취소' : '새 일정 추가'}
                      </button>
                    </div>

                    {/* Add Event Form Block */}
                    <AnimatePresence>
                      {showAddEventForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!newEvTitle.trim() || !newEvStartDate.trim() || !newEvLocation.trim()) {
                                showToast('모든 필수 값을 입력해 주세요.', 'error');
                                return;
                              }
                              
                              const finalDate = newEvIsRange && newEvEndDate && newEvEndDate !== newEvStartDate
                                ? `${newEvStartDate} ~ ${newEvEndDate}`
                                : newEvStartDate;

                              handleAddEventFromAdmin({
                                title: newEvTitle,
                                date: finalDate,
                                type: newEvType,
                                location: newEvLocation,
                                description: newEvDescription,
                                status: newEvStatus,
                              }, adminEditingEvent ? adminEditingEvent.id : undefined);

                              // Clear states
                              setNewEvTitle('');
                              setNewEvStartDate('');
                              setNewEvEndDate('');
                              setNewEvIsRange(false);
                              setNewEvType('domestic');
                              setNewEvLocation('');
                              setNewEvDescription('');
                              setNewEvStatus('upcoming');
                              setAdminEditingEvent(null);
                              setShowAddEventForm(false);
                            }}
                            className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-4 shadow-inner text-xs"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1 md:col-span-2">
                                <label className="block text-zinc-600 font-bold">일정명 (필수)</label>
                                <input
                                  type="text"
                                  required
                                  value={newEvTitle}
                                  onChange={(e) => setNewEvTitle(e.target.value)}
                                  placeholder="예: 제16회 전국 치어리딩 페스티벌"
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>

                              <div className="space-y-2 md:col-span-2 bg-white border border-zinc-150 p-4 rounded-xl">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                  <label className="block text-zinc-800 font-bold">일정 기간 설정 (필수)</label>
                                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-zinc-700">
                                    <input
                                      type="checkbox"
                                      checked={newEvIsRange}
                                      onChange={(e) => {
                                        setNewEvIsRange(e.target.checked);
                                        if (e.target.checked && !newEvEndDate) {
                                          setNewEvEndDate(newEvStartDate || '2026-06-25');
                                        }
                                      }}
                                      className="rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300 w-3.5 h-3.5"
                                    />
                                    <span className="text-[11px]">여러 날 동안 진행되는 일정 (기간 설정)</span>
                                  </label>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-zinc-500 font-bold">{newEvIsRange ? '시작일' : '행사 일자'}</span>
                                    <input
                                      type="date"
                                      required
                                      value={newEvStartDate}
                                      onChange={(e) => {
                                        setNewEvStartDate(e.target.value);
                                        if (!newEvIsRange || !newEvEndDate || newEvEndDate < e.target.value) {
                                          setNewEvEndDate(e.target.value);
                                        }
                                      }}
                                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono text-xs"
                                    />
                                  </div>
                                  
                                  {newEvIsRange && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-zinc-500 font-bold">종료일</span>
                                      <input
                                        type="date"
                                        required
                                        min={newEvStartDate}
                                        value={newEvEndDate}
                                        onChange={(e) => setNewEvEndDate(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono text-xs"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-zinc-600 font-bold">구분 유형</label>
                                <select
                                  value={newEvType}
                                  onChange={(e: any) => setNewEvType(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900"
                                >
                                  {scheduleCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-zinc-600 font-bold">개최 장소 (필수)</label>
                                <input
                                  type="text"
                                  required
                                  value={newEvLocation}
                                  onChange={(e) => setNewEvLocation(e.target.value)}
                                  placeholder="예: 올림픽공원 핸드볼경기장"
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>

                              <div className="space-y-1 md:col-span-2">
                                <label className="block text-zinc-600 font-bold">일정 요약 설명</label>
                                <textarea
                                  rows={2}
                                  value={newEvDescription}
                                  onChange={(e) => setNewEvDescription(e.target.value)}
                                  placeholder="예: 대한민국을 대표할 최정예 국가대표 선수가 선발되는 무대입니다."
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900 resize-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-zinc-600 font-bold">진행 상태</label>
                                <div className="flex gap-4 pt-1.5">
                                  {(['upcoming', 'ongoing', 'completed'] as const).map((status) => (
                                    <label key={status} className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="newEvStatus"
                                        checked={newEvStatus === status}
                                        onChange={() => setNewEvStatus(status)}
                                        className="text-zinc-900 focus:ring-zinc-900"
                                      />
                                      <span>
                                        {status === 'upcoming' ? '대기 중' :
                                         status === 'ongoing' ? '진행 중' : '종료됨'}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setNewEvTitle('');
                                  setNewEvStartDate('');
                                  setNewEvEndDate('');
                                  setNewEvIsRange(false);
                                  setNewEvType('domestic');
                                  setNewEvLocation('');
                                  setNewEvDescription('');
                                  setNewEvStatus('upcoming');
                                  setAdminEditingEvent(null);
                                  setShowAddEventForm(false);
                                }}
                                className="w-1/3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold py-3 rounded-xl transition cursor-pointer text-xs"
                              >
                                작성 취소
                              </button>
                              <button
                                type="submit"
                                className="w-2/3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition cursor-pointer text-xs shadow-sm"
                              >
                                {adminEditingEvent ? '공식 일정 정보 수정하기' : '신규 일정 공식 등록하기'}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>



                    {/* Events Table List */}
                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm font-sans overflow-x-auto">
                      <table className="w-full text-xs text-left text-zinc-600 min-w-[750px]">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 uppercase font-bold text-[11px]">
                          <tr>
                            <th className="px-4 py-3">유형</th>
                            <th className="px-4 py-3">일정명 및 정보</th>
                            <th className="px-4 py-3">기간 및 장소</th>
                            <th className="px-4 py-3">상태</th>
                            <th className="px-4 py-3 text-right">관리 조작</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {events.map((evt) => (
                            <tr key={evt.id} className="hover:bg-zinc-50/50 transition">
                              <td className="px-4 py-4 vertical-top shrink-0">
                                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md tracking-wide ${getEventBadgeColor(evt.type)}`}>
                                  {getEventLabel(evt.type)}
                                </span>
                              </td>
                              <td className="px-4 py-4 max-w-xs">
                                <div className="font-bold text-zinc-950 text-sm mb-1">{evt.title}</div>
                                <div className="text-zinc-500 text-[11px] font-light leading-relaxed truncate" title={evt.description}>
                                  {evt.description}
                                </div>
                              </td>
                              <td className="px-4 py-4 space-y-1">
                                <div className="flex items-center gap-1 text-zinc-700 font-medium text-[11px]">
                                  <Calendar className="w-3 h-3 text-zinc-400" />
                                  <span>{evt.date}</span>
                                </div>
                                <div className="flex items-center gap-1 text-zinc-400 text-[11px] font-light">
                                  <MapPin className="w-3 h-3 text-zinc-300" />
                                  <span>{evt.location}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={evt.status}
                                  onChange={(e: any) => handleUpdateEventStatusFromAdmin(evt.id, e.target.value)}
                                  className="bg-zinc-50 border border-zinc-200 rounded-lg p-1 text-[11px] font-semibold text-zinc-700 focus:outline-none"
                                >
                                  <option value="upcoming">대기 중</option>
                                  <option value="ongoing">진행 중</option>
                                  <option value="completed">종료됨</option>
                                </select>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setAdminEditingEvent(evt);
                                      setNewEvTitle(evt.title);
                                      setNewEvType(evt.type);
                                      setNewEvLocation(evt.location);
                                      setNewEvDescription(evt.description || '');
                                      setNewEvStatus(evt.status);
                                      
                                      // Parse date
                                      if (evt.date.includes('~')) {
                                        const parts = evt.date.split('~').map(p => p.trim());
                                        setNewEvStartDate(parts[0]);
                                        setNewEvEndDate(parts[1] || parts[0]);
                                        setNewEvIsRange(true);
                                      } else {
                                        setNewEvStartDate(evt.date);
                                        setNewEvEndDate(evt.date);
                                        setNewEvIsRange(false);
                                      }
                                      
                                      setShowAddEventForm(true);
                                      
                                      // Scroll back up to the schedules panel smooth
                                      const target = document.getElementById('admin-schedules-section');
                                      if (target) {
                                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      }
                                    }}
                                    className="text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 rounded px-2.5 py-1 transition text-[10px]"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEventFromAdmin(evt.id)}
                                    className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded px-2.5 py-1 transition text-[10px]"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. Image Manager Panel */}
                {adminActiveTab === 'images' && (
                  <div className="space-y-6">
                    {/* 상단 퀵 이동 및 돌아가기 버튼 */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-[11px] font-bold text-blue-900">이미지 편집 상태 활성화됨</span>
                      </div>
                      <button
                        onClick={() => setAdminActiveTab('stats')}
                        className="text-[11px] font-black text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        ← 제어센터 메인메뉴(종합 요약)로 돌아가기
                      </button>
                    </div>

                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-950">사이트 내 모든 이미지 실시간 편집</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">원하는 이미지 URL을 직접 입력하여 사이트 디자인을 정교하게 제어해 보세요.</p>
                      </div>
                      <button
                        onClick={() => {
                          showConfirm(
                            '전체 기본값 복원',
                            '사이트 내 모든 이미지 설정을 최초 협회 디폴트 프리셋으로 복원하시겠습니까?',
                            handleResetImages
                          );
                        }}
                        className="text-xs border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer text-zinc-700 bg-white"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        전체 기본값 복원
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          key: 'heroBg' as const,
                          name: '❶ 메인 히어로 섹션 배경',
                          desc: '웹사이트 첫 로딩 시 상단에 어스름하게 노출되는 대형 배경 오버레이 이미지입니다.',
                          aspect: 'aspect-[16/9]',
                          recommendedSize: '권장 규격: 1920 × 1080 px (16:9 가로 화면 비율)',
                        },
                        {
                          key: 'badgeImg' as const,
                          name: '❷ 우측 플로팅 상태 정보창 카드',
                          desc: '히어로 섹션 우측에 떠 있는 공인단 정보 카드의 배경 일러스트 이미지입니다.',
                          aspect: 'aspect-video',
                          recommendedSize: '권장 규격: 800 × 450 px (16:9 와이드 비율)',
                        },
                        {
                          key: 'mosaic1' as const,
                          name: '❸ 비전 소개 모자이크 이미지 A',
                          desc: 'KCF 소개 단락 하단의 모자이크 그리드에서 가장 좌측에 노출되는 이미지입니다.',
                          aspect: 'aspect-[4/3]',
                          recommendedSize: '권장 규격: 800 × 600 px (4:3 표준 가로 비율)',
                        },
                        {
                          key: 'mosaic2' as const,
                          name: '❹ 비전 소개 모자이크 이미지 B',
                          desc: 'KCF 소개 단락 하단의 모자이크 그리드에서 가운데(약간 내려앉은) 노출되는 이미지입니다.',
                          aspect: 'aspect-[4/3]',
                          recommendedSize: '권장 규격: 800 × 600 px (4:3 표준 가로 비율)',
                        },
                        {
                          key: 'mosaic3' as const,
                          name: '❺ 비전 소개 모자이크 이미지 C',
                          desc: 'KCF 소개 단락 하단의 모자이크 그리드에서 우측에 노출되는 이미지입니다.',
                          aspect: 'aspect-[4/3]',
                          recommendedSize: '권장 규격: 800 × 600 px (4:3 표준 가로 비율)',
                        },
                        {
                          key: 'icuLogo' as const,
                          name: '❻ ICU 세계치어리딩연맹 인증 마크',
                          desc: '협회 강점 하단 가입부서에서 세계연맹 공식 대표기관 자격을 나타내는 로고입니다.',
                          aspect: 'aspect-square max-w-[120px]',
                          recommendedSize: '권장 규격: 256 × 256 px (1:1 정사각형, 배경이 투명한 PNG)',
                        },
                        {
                          key: 'associationLogo' as const,
                          name: '❼ 공식 협회 로고 (Header & Footer)',
                          desc: '웹사이트 상단 헤더 및 하단 푸터에 노출되는 공식 한국치어리딩협회 로고 이미지입니다.',
                          aspect: 'aspect-square max-w-[120px] bg-white p-2',
                          recommendedSize: '권장 규격: 512 × 512 px (1:1 정사각형, 투명 배경 PNG)',
                          noReset: true,
                        },
                      ].map((imgConfig) => (
                        <div key={imgConfig.key} className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex flex-col justify-between gap-4">
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-zinc-900 block">{imgConfig.name}</span>
                            <p className="text-[10px] text-zinc-400 font-light leading-relaxed">{imgConfig.desc}</p>
                            <span className="inline-flex items-center bg-blue-50 text-blue-600 border border-blue-100 rounded-md px-2 py-0.5 text-[9px] font-bold font-mono">
                              {imgConfig.recommendedSize}
                            </span>
                          </div>

                          <div className={`rounded-xl overflow-hidden bg-zinc-200 border border-zinc-200 relative ${imgConfig.aspect} flex items-center justify-center`}>
                            {imgConfig.key === 'associationLogo' && !siteImages[imgConfig.key] ? (
                              <div className="w-full h-full bg-white flex flex-col items-center justify-center p-4 text-[9px] text-zinc-400 font-bold gap-2 select-none">
                                <div className="w-12 h-12">
                                  <svg viewBox="0 0 500 500" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="200" cy="70" r="28" fill="#004098" />
                                    <path d="M 72,143 C 105,123 155,140 188,165 C 150,230 90,360 2,490 C 25,430 115,280 135,215 C 137,208 127,192 110,180 C 95,168 85,155 72,143 Z" fill="#004098" />
                                    <path d="M 188,165 C 235,125 310,65 390,5 C 335,70 260,155 208,210 C 193,190 189,175 188,165 Z" fill="#A61A21" />
                                    <path d="M 208,210 C 265,190 375,165 498,158 C 420,175 340,210 286,242 C 245,232 220,222 208,210 Z" fill="#A61A21" />
                                    <path d="M 208,210 C 185,255 178,300 181,320 C 181,365 210,440 450,430 C 375,465 270,470 210,400 C 175,360 178,335 181,320 C 185,340 220,310 286,242 C 240,232 220,222 208,210 Z" fill="#A61A21" />
                                  </svg>
                                </div>
                                <span className="text-zinc-500">기본 SVG 벡터 로고 작동 중</span>
                              </div>
                            ) : (
                              <img
                                src={siteImages[imgConfig.key]}
                                alt={imgConfig.name}
                                className="w-full h-full object-contain animate-fade-in"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=600';
                                }}
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-white font-mono uppercase tracking-widest">
                              Live Preview
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider">이미지 소스 주소 (Image URL 또는 파일 직접 업로드)</label>
                            <div className="flex gap-1.5 flex-wrap">
                              <input
                                type="text"
                                value={siteImages[imgConfig.key]}
                                onChange={(e) => handleUpdateImage(imgConfig.key, e.target.value)}
                                className="flex-1 min-w-[150px] bg-white border border-zinc-200 rounded-xl px-3 py-2 text-[11px] text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                                placeholder="https://..."
                              />
                              <input
                                type="file"
                                accept="image/*"
                                id={`file-upload-${imgConfig.key}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = async (event) => {
                                      if (event.target?.result && typeof event.target.result === 'string') {
                                        try {
                                          showToast('이미지 크기를 압축 및 최적화하는 중입니다...', 'info');
                                          const compressed = await compressImage(event.target.result);
                                          handleUpdateImage(imgConfig.key, compressed);
                                          showToast('이미지 업로드 및 최적화가 완료되었습니다!', 'success');
                                        } catch (err) {
                                          console.error("Image compression failed:", err);
                                          handleUpdateImage(imgConfig.key, event.target.result);
                                        }
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <button
                                onClick={() => document.getElementById(`file-upload-${imgConfig.key}`)?.click()}
                                className="bg-zinc-900 text-white hover:bg-zinc-800 px-3.5 py-2 rounded-xl text-[10px] font-semibold transition shrink-0 cursor-pointer flex items-center gap-1"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                직접 업로드
                              </button>
                              {imgConfig.noReset ? (
                                <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-100 rounded-xl px-3 py-2 text-[9px] font-bold select-none">
                                  초기화 보호됨
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleUpdateImage(imgConfig.key, DEFAULT_IMAGES[imgConfig.key])}
                                  className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 px-3 py-2 rounded-xl text-[10px] font-semibold transition shrink-0 cursor-pointer"
                                >
                                  초기화
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Security Section: Changing password */}
                    <div className="border-t border-zinc-200 pt-6 mt-4">
                      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="space-y-1 text-left">
                          <h5 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-zinc-600" />
                            관리자 보안 인증 비밀번호 변경
                          </h5>
                          <p className="text-[10px] text-zinc-400">초기 패스워드(bt2009) 외에 안전한 비밀번호로 언제든 교체 관리할 수 있습니다.</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="새 비밀번호 입력"
                            id="change-admin-pass-input"
                            defaultValue={adminPassword}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              if (val) {
                                handleUpdatePassword(val);
                              }
                            }}
                            className="bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono w-full sm:w-48"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById('change-admin-pass-input') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                handleUpdatePassword(input.value.trim());
                                alert(`성공적으로 비밀번호가 변경되었습니다! (현재 설정: ${input.value.trim()})`);
                              }
                            }}
                            className="bg-zinc-900 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                          >
                            비밀번호 변경 완료
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 하단 제어센터 메인 복귀 버튼 */}
                    <div className="border-t border-zinc-200 pt-6 mt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <p className="text-[10px] text-zinc-400">수정 사항은 실시간으로 저장되며, 즉시 메인 사이트에 반영됩니다.</p>
                      <button
                        onClick={() => setAdminActiveTab('stats')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <Activity className="w-4 h-4 text-white" />
                        제어센터 메인메뉴(종합 요약)로 돌아가기
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. Athlete Manager Panel */}
                {adminActiveTab === 'athletes' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-950">공인 등록 선수 총괄 디렉토리 ({athletes.length}명)</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">협회 공인 자격을 획득한 선수진을 실시간으로 등록, 갱신 및 상태 관리할 수 있습니다.</p>
                      </div>
                      <button
                        onClick={() => setShowAddAthleteForm(!showAddAthleteForm)}
                        className="text-xs bg-zinc-900 text-white font-semibold px-4 py-1.5 rounded-full hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {showAddAthleteForm ? '등록 폼 닫기' : '새 선수 등록'}
                      </button>
                    </div>

                    {/* Add Athlete Expandable Form */}
                    <AnimatePresence>
                      {showAddAthleteForm && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4 mb-4">
                            <h5 className="text-xs font-bold text-zinc-900">공인 등록 선수 인적사항 등록</h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">선수 성명 *</label>
                                <input
                                  type="text"
                                  placeholder="예: 홍길동"
                                  value={newAthleteName}
                                  onChange={(e) => setNewAthleteName(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">선수 등록번호 (자동 생성 가능)</label>
                                <input
                                  type="text"
                                  placeholder="예: KCF-2026-0205"
                                  value={newAthleteRegNumber}
                                  onChange={(e) => setNewAthleteRegNumber(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">생년월일 *</label>
                                <input
                                  type="date"
                                  value={newAthleteBirthDate}
                                  onChange={(e) => setNewAthleteBirthDate(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">성별 *</label>
                                <select
                                  value={newAthleteGender}
                                  onChange={(e) => setNewAthleteGender(e.target.value as '남' | '여')}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                >
                                  <option value="여">여성 (Female)</option>
                                  <option value="남">남성 (Male)</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">소속 팀명 *</label>
                                <select
                                  value={newAthleteTeamName}
                                  onChange={(e) => setNewAthleteTeamName(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                >
                                  <option value="">-- 소속팀 선택 --</option>
                                  {teams.map(t => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                  ))}
                                  <option value="개인 자격">개인 자격 (미지정)</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">수행 레벨</label>
                                <select
                                  value={newAthleteLevel}
                                  onChange={(e) => setNewAthleteLevel(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                >
                                  <option value="일반선수">일반선수</option>
                                  <option value="지도자 (클래스1)">지도자 (클래스1)</option>
                                  <option value="지도자 (클래스2)">지도자 (클래스2)</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">등록 승인 상태</label>
                                <select
                                  value={newAthleteStatus}
                                  onChange={(e) => setNewAthleteStatus(e.target.value as any)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-semibold"
                                >
                                  <option value="정상등록">정상등록 (Active)</option>
                                  <option value="갱신필요">갱신필요 (Renew Required)</option>
                                  <option value="정지">정지 (Suspended)</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold">자격 만료 시점 *</label>
                                <input
                                  type="date"
                                  value={newAthleteValidUntil}
                                  onChange={(e) => setNewAthleteValidUntil(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-semibold block">선수 사진 설정 (URL 또는 직접 업로드)</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/... 또는 직접 파일 업로드"
                                    value={newAthleteImageUrl}
                                    onChange={(e) => setNewAthleteImageUrl(e.target.value)}
                                    className="flex-1 bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                  />
                                  <div className="flex gap-1.5 shrink-0">
                                    <label className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>기기에서 업로드</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              setNewAthleteImageUrl(reader.result as string);
                                              showToast('선수 사진이 성공적으로 업로드되었습니다.', 'success');
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                    {newAthleteImageUrl && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNewAthleteImageUrl('');
                                          showToast('선수 사진이 제거되었습니다.', 'info');
                                        }}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-3 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {newAthleteImageUrl && (
                                  <div className="mt-2 inline-block">
                                    <img
                                      src={newAthleteImageUrl}
                                      alt="선수 미리보기"
                                      className="h-20 w-16 object-cover rounded-lg border border-zinc-200 shadow-xs"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => {
                                  setShowAddAthleteForm(false);
                                  setNewAthleteName('');
                                  setNewAthleteRegNumber('');
                                  setNewAthleteBirthDate('2005-01-01');
                                  setNewAthleteGender('여');
                                  setNewAthleteTeamName('');
                                  setNewAthleteCategory('치어리딩');
                                  setNewAthleteLevel('일반선수');
                                  setNewAthleteStatus('정상등록');
                                  setNewAthleteValidUntil('2027-02-28');
                                  setNewAthleteImageUrl('');
                                }}
                                className="bg-white border border-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => {
                                  if (!newAthleteName || !newAthleteBirthDate) {
                                    alert('필수 필드(성명, 생년월일)를 입력해 주세요.');
                                    return;
                                  }
                                  const generatedRegNum = newAthleteRegNumber || `KCF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                                  handleAddAthleteFromAdmin({
                                    name: newAthleteName,
                                    regNumber: generatedRegNum,
                                    birthDate: newAthleteBirthDate,
                                    gender: newAthleteGender,
                                    teamName: newAthleteTeamName || (teams[0]?.name || '개인 자격'),
                                    category: '치어리딩',
                                    level: newAthleteLevel,
                                    registerDate: new Date().toISOString().split('T')[0],
                                    validUntil: newAthleteValidUntil,
                                    status: newAthleteStatus,
                                    imageUrl: newAthleteImageUrl || undefined
                                  });
                                  setShowAddAthleteForm(false);
                                  setNewAthleteName('');
                                  setNewAthleteRegNumber('');
                                  setNewAthleteBirthDate('2005-01-01');
                                  setNewAthleteGender('여');
                                  setNewAthleteTeamName('');
                                  setNewAthleteCategory('치어리딩');
                                  setNewAthleteLevel('일반선수');
                                  setNewAthleteStatus('정상등록');
                                  setNewAthleteValidUntil('2027-02-28');
                                  setNewAthleteImageUrl('');
                                }}
                                className="bg-zinc-900 text-white font-semibold px-5 py-2 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer"
                              >
                                공인 선수 등록 완료
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                      <table className="w-full text-xs text-left text-zinc-600 min-w-[900px]">
                        <thead className="text-[10px] uppercase text-zinc-500 bg-zinc-50 font-bold border-b border-zinc-200">
                          <tr>
                            <th className="px-4 py-3">선수 사진</th>
                            <th className="px-4 py-3">선수 성명 및 인적사항</th>
                            <th className="px-4 py-3">선수 등록번호</th>
                            <th className="px-4 py-3">소속 단체 및 팀</th>
                            <th className="px-4 py-3">공인 수행레벨</th>
                            <th className="px-4 py-3">자격유효 상태</th>
                            <th className="px-4 py-3">자격 만료일</th>
                            <th className="px-4 py-3 text-right">관리 조작</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {athletes.map((ath) => {
                            const isEditing = editingAthleteId === ath.id;
                            const editData = editingAthleteData;

                            if (isEditing && editData) {
                              return (
                                <tr key={ath.id} className="bg-zinc-50/70">
                                  {/* Photo Edit */}
                                  <td className="px-4 py-3">
                                    <div className="space-y-1 flex flex-col items-center">
                                      {editData.imageUrl ? (
                                        <img
                                          src={editData.imageUrl}
                                          alt="미리보기"
                                          className="h-12 w-10 object-cover rounded-md border border-zinc-200 shadow-xs"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <div className="h-12 w-10 bg-zinc-200 rounded-md flex items-center justify-center text-zinc-400">
                                          <User className="w-4 h-4" />
                                        </div>
                                      )}
                                      <input
                                        type="text"
                                        placeholder="https://..."
                                        value={editData.imageUrl || ''}
                                        onChange={(e) => setEditingAthleteData({ ...editData, imageUrl: e.target.value })}
                                        className="w-24 bg-white border border-zinc-200 rounded-lg p-1 text-[9px] focus:outline-none focus:border-zinc-900"
                                      />
                                      <div className="flex gap-1">
                                        <label className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold px-1.5 py-0.5 rounded text-[8px] transition cursor-pointer flex items-center justify-center gap-0.5 border border-zinc-300">
                                          <Upload className="w-2.5 h-2.5" />
                                          <span>업로드</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  setEditingAthleteData({ ...editData, imageUrl: reader.result as string });
                                                  showToast('선수 사진이 성공적으로 업로드되었습니다.', 'success');
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </label>
                                        {editData.imageUrl && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingAthleteData({ ...editData, imageUrl: '' });
                                              showToast('선수 사진이 제거되었습니다.', 'info');
                                            }}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-1.5 py-0.5 rounded text-[8px] transition cursor-pointer"
                                          >
                                            삭제
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Name, Gender, Birthdate Edit */}
                                  <td className="px-4 py-3">
                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditingAthleteData({ ...editData, name: e.target.value })}
                                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 font-bold focus:outline-none focus:border-zinc-900"
                                        placeholder="성명"
                                      />
                                      <div className="flex gap-1">
                                        <select
                                          value={editData.gender}
                                          onChange={(e) => setEditingAthleteData({ ...editData, gender: e.target.value as '남' | '여' })}
                                          className="bg-white border border-zinc-200 rounded-lg px-1 py-1 text-[10px] text-zinc-800 focus:outline-none focus:border-zinc-900"
                                        >
                                          <option value="여">여</option>
                                          <option value="남">남</option>
                                        </select>
                                        <input
                                          type="date"
                                          value={editData.birthDate}
                                          onChange={(e) => setEditingAthleteData({ ...editData, birthDate: e.target.value })}
                                          className="bg-white border border-zinc-200 rounded-lg px-1.5 py-1 text-[10px] font-mono text-zinc-800 focus:outline-none focus:border-zinc-900"
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Reg Number Edit */}
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      value={editData.regNumber}
                                      onChange={(e) => setEditingAthleteData({ ...editData, regNumber: e.target.value })}
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    />
                                  </td>

                                  {/* Team Name Edit */}
                                  <td className="px-4 py-3">
                                    <select
                                      value={editData.teamName}
                                      onChange={(e) => setEditingAthleteData({ ...editData, teamName: e.target.value })}
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    >
                                      {teams.map(t => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                      ))}
                                      <option value="개인 자격">개인 자격 (미지정)</option>
                                    </select>
                                  </td>

                                  {/* Level Edit */}
                                  <td className="px-4 py-3">
                                    <select
                                      value={editData.level}
                                      onChange={(e) => setEditingAthleteData({ ...editData, level: e.target.value })}
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-1.5 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    >
                                      <option value="일반선수">일반선수</option>
                                      <option value="지도자 (클래스1)">지도자 (클래스1)</option>
                                      <option value="지도자 (클래스2)">지도자 (클래스2)</option>
                                    </select>
                                  </td>

                                  {/* Status Edit */}
                                  <td className="px-4 py-3">
                                    <select
                                      value={editData.status}
                                      onChange={(e) => setEditingAthleteData({ ...editData, status: e.target.value as any })}
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-1.5 py-1 text-[11px] font-bold text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    >
                                      <option value="정상등록">정상등록</option>
                                      <option value="갱신필요">갱신필요</option>
                                      <option value="정지">정지</option>
                                    </select>
                                  </td>

                                  {/* Valid Until Edit */}
                                  <td className="px-4 py-3">
                                    <input
                                      type="date"
                                      value={editData.validUntil}
                                      onChange={(e) => setEditingAthleteData({ ...editData, validUntil: e.target.value })}
                                      className="bg-white border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-800 focus:outline-none focus:border-zinc-900 w-28"
                                    />
                                  </td>

                                  {/* Actions for Edit Mode */}
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex gap-1 justify-end">
                                      <button
                                        onClick={() => {
                                          if (!editData.name || !editData.birthDate) {
                                            alert('선수명과 생년월일은 필수입니다.');
                                            return;
                                          }
                                          handleUpdateAthleteFromAdmin(editData);
                                          setEditingAthleteId(null);
                                          setEditingAthleteData(null);
                                        }}
                                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded px-2 py-1 text-[10px] transition cursor-pointer"
                                      >
                                        저장
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingAthleteId(null);
                                          setEditingAthleteData(null);
                                        }}
                                        className="bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold rounded px-2 py-1 text-[10px] transition cursor-pointer"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <tr key={ath.id} className="hover:bg-zinc-50/50 transition">
                                {/* Photo Display */}
                                <td className="px-4 py-3.5">
                                  {ath.imageUrl ? (
                                    <img
                                      src={ath.imageUrl}
                                      alt={ath.name}
                                      className="h-12 w-10 object-cover rounded-md border border-zinc-200 shadow-xs"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="h-12 w-10 bg-zinc-100 rounded-md border border-zinc-200 flex items-center justify-center text-zinc-400" title="이미지 없음">
                                      <User className="w-4 h-4" />
                                    </div>
                                  )}
                                </td>

                                {/* Name & Details */}
                                <td className="px-4 py-3.5">
                                  <div className="font-bold text-zinc-900 flex flex-col sm:flex-row sm:items-center gap-1">
                                    <span>{ath.name}</span>
                                    <span className="text-[10px] text-zinc-400 font-normal">({ath.gender}, {ath.birthDate.split('-')[0]}년생)</span>
                                  </div>
                                </td>

                                {/* Reg Number */}
                                <td className="px-4 py-3.5">
                                  <span className="font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {ath.regNumber}
                                  </span>
                                </td>

                                {/* Team Name */}
                                <td className="px-4 py-3.5 font-medium text-zinc-800">{ath.teamName}</td>

                                {/* Level */}
                                <td className="px-4 py-3.5">
                                  <div className="font-bold text-zinc-700">{ath.level}</div>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3.5">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                    ath.status === '정상등록'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : ath.status === '갱신필요'
                                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                                      : 'bg-rose-50 text-rose-700 border-rose-100'
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full ${
                                      ath.status === '정상등록'
                                        ? 'bg-emerald-500'
                                        : ath.status === '갱신필요'
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                    }`} />
                                    {ath.status}
                                  </span>
                                </td>

                                {/* Expiration Date */}
                                <td className="px-4 py-3.5 font-mono text-xs text-zinc-800">
                                  {ath.validUntil}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3.5 text-right">
                                  <div className="flex gap-1.5 justify-end">
                                    <button
                                      onClick={() => {
                                        setEditingAthleteId(ath.id);
                                        setEditingAthleteData({ ...ath });
                                      }}
                                      className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 rounded px-2.5 py-0.5 transition text-[10px] font-semibold cursor-pointer"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => {
                                        showConfirm(
                                          '선수 등록 정보 영구 삭제',
                                          `선수 ${ath.name}(${ath.regNumber})의 공인 협회 등록 정보를 시스템에서 영구히 삭제하시겠습니까?`,
                                          () => handleDeleteAthleteFromAdmin(ath.id)
                                        );
                                      }}
                                      className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded px-2.5 py-0.5 transition text-[10px] font-semibold cursor-pointer"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {athletes.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-4 py-8 text-center text-zinc-400">
                                등록된 공인 선수가 없습니다. 새 선수를 등록해 주세요.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 8. Association Info Management Panel */}
                {adminActiveTab === 'association' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-950">사무국 연락처 및 법적 허가번호 일괄 설정</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        전산망 및 홈페이지 하단(Footer)과 소통 창구(Inquiry Hub)에 노출되는 협회 사무국의 공식 정보를 실시간으로 수정/갱신합니다.
                      </p>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">KCF 사무국 명칭 *</label>
                          <input
                            type="text"
                            value={assocOfficeName}
                            onChange={(e) => setAssocOfficeName(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                            placeholder="예: KCF 서울 중앙 사무국"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">대표자 성명 *</label>
                          <input
                            type="text"
                            value={assocRepresentative}
                            onChange={(e) => setAssocRepresentative(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                            placeholder="예: 이성규"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold block">사무국 소재지 주소 *</label>
                        <input
                          type="text"
                          value={assocAddress}
                          onChange={(e) => setAssocAddress(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                          placeholder="예: 서울특별시 송파구 올림픽로 424..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">대표전화 *</label>
                          <input
                            type="text"
                            value={assocPhone}
                            onChange={(e) => setAssocPhone(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                            placeholder="예: 02-421-8890"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">대표 팩스번호</label>
                          <input
                            type="text"
                            value={assocFax}
                            onChange={(e) => setAssocFax(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                            placeholder="예: 02-421-8891"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">대표이메일 *</label>
                          <input
                            type="email"
                            value={assocEmail}
                            onChange={(e) => setAssocEmail(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                            placeholder="예: office@cheerleading.or.kr"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/60">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">비영리 사단법인 설립 허가번호 *</label>
                          <input
                            type="text"
                            value={assocPermitNumber}
                            onChange={(e) => setAssocPermitNumber(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                            placeholder="예: 제2013-11-0043호"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">고유번호증 번호 *</label>
                          <input
                            type="text"
                            value={assocBusinessNumber}
                            onChange={(e) => setAssocBusinessNumber(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                            placeholder="예: 220-82-14881"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAssocOfficeName(associationInfo.officeName || '');
                            setAssocAddress(associationInfo.address || '');
                            setAssocPhone(associationInfo.phone || '');
                            setAssocFax(associationInfo.fax || '');
                            setAssocEmail(associationInfo.email || '');
                            setAssocPermitNumber(associationInfo.permitNumber || '');
                            setAssocBusinessNumber(associationInfo.businessNumber || '');
                            setAssocRepresentative(associationInfo.representative || '');
                            showToast('입력 내용이 현재 설정 값으로 되돌려졌습니다.', 'info');
                          }}
                          className="bg-white border border-zinc-200 text-zinc-700 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                        >
                          설정 초기화
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              !assocOfficeName.trim() ||
                              !assocAddress.trim() ||
                              !assocPhone.trim() ||
                              !assocEmail.trim() ||
                              !assocPermitNumber.trim() ||
                              !assocBusinessNumber.trim() ||
                              !assocRepresentative.trim()
                            ) {
                              showToast('모든 필수 정보를 누락없이 기입해 주세요.', 'error');
                              return;
                            }
                            handleUpdateAssociationInfo({
                              officeName: assocOfficeName.trim(),
                              address: assocAddress.trim(),
                              phone: assocPhone.trim(),
                              fax: assocFax.trim(),
                              email: assocEmail.trim(),
                              permitNumber: assocPermitNumber.trim(),
                              businessNumber: assocBusinessNumber.trim(),
                              representative: assocRepresentative.trim(),
                            });
                            showToast('사무국 공식 정보 및 인가 사양이 성공적으로 갱신되었습니다.', 'success');
                          }}
                          className="bg-zinc-900 text-white font-semibold px-5 py-2.5 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          공식 정보 저장하기
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Competition Management Panel */}
                {adminActiveTab === 'competitions' && (
                  <div className="space-y-6">
                    {adminEditingComp ? (
                      // Inline edit form
                      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 space-y-4 text-left">
                        <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                          <h4 className="text-xs font-bold text-zinc-950">대회 게시글 내용 직접 수정</h4>
                          <button
                            onClick={() => setAdminEditingComp(null)}
                            className="text-zinc-500 hover:text-zinc-900 font-semibold text-xs cursor-pointer"
                          >
                            수정 취소
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-semibold block">대회 카테고리</label>
                            <select
                              value={adminEditingComp.category}
                              onChange={(e) => setAdminEditingComp({ ...adminEditingComp, category: e.target.value as any })}
                              className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                            >
                              <option value="domestic">국내대회 (Domestic)</option>
                              <option value="international">국제대회 (International)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-semibold block">대회 일시</label>
                            <input
                              type="text"
                              value={adminEditingComp.compDate || ''}
                              onChange={(e) => setAdminEditingComp({ ...adminEditingComp, compDate: e.target.value })}
                              className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">대회명 (게시글 제목)</label>
                          <input
                            type="text"
                            value={adminEditingComp.title}
                            onChange={(e) => setAdminEditingComp({ ...adminEditingComp, title: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-semibold block">주관/주최사</label>
                            <input
                              type="text"
                              value={adminEditingComp.organizer || ''}
                              onChange={(e) => setAdminEditingComp({ ...adminEditingComp, organizer: e.target.value })}
                              className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-semibold block">개최 장소</label>
                            <input
                              type="text"
                              value={adminEditingComp.location || ''}
                              onChange={(e) => setAdminEditingComp({ ...adminEditingComp, location: e.target.value })}
                              className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">대회 대표 이미지 설정 (수정, 변경 및 삭제 가능)</label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              placeholder="https://images.unsplash.com/... 또는 직접 파일 업로드"
                              value={adminEditingComp.imageUrl || ''}
                              onChange={(e) => setAdminEditingComp({ ...adminEditingComp, imageUrl: e.target.value })}
                              className="flex-1 bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                            />
                            <div className="flex gap-2">
                              <label className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shrink-0">
                                <Upload className="w-3.5 h-3.5" />
                                <span>기기에서 업로드</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setAdminEditingComp({ ...adminEditingComp, imageUrl: reader.result as string });
                                        showToast('대회 이미지가 새로운 파일로 교체되었습니다.', 'success');
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              {adminEditingComp.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminEditingComp({ ...adminEditingComp, imageUrl: '' });
                                    showToast('대회 이미지가 영구 삭제 처리되었습니다. (대체 기본 이미지가 표시됩니다)', 'info');
                                  }}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          </div>
                          {adminEditingComp.imageUrl ? (
                            <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 relative group">
                              <img src={adminEditingComp.imageUrl} alt="Current Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-bold">
                                현재 대표 이미지
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-[10px] text-amber-600 font-medium">
                              ⚠️ 대표 이미지가 비어 있습니다. 기본 이미지로 자동 대체되거나 로고 형태로 대체됩니다.
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-semibold block">대회 상세 요강 및 설명 내용</label>
                          <textarea
                            rows={5}
                            value={adminEditingComp.content}
                            onChange={(e) => setAdminEditingComp({ ...adminEditingComp, content: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 resize-none font-light leading-relaxed"
                          ></textarea>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setAdminEditingComp(null)}
                            className="bg-white border border-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                          >
                            수정 취소
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!adminEditingComp.title.trim() || !adminEditingComp.content.trim()) {
                                showToast('제목과 내용을 모두 기입해 주세요.', 'error');
                                return;
                              }
                              const updated = competitions.map(c => 
                                c.id === adminEditingComp.id ? adminEditingComp : c
                              );
                              setCompetitions(updated);
                              showToast('대회 게시글 사양이 성공적으로 갱신되었습니다.', 'success');
                              setAdminEditingComp(null);
                            }}
                            className="bg-zinc-900 text-white font-semibold px-5 py-2 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer"
                          >
                            변경 완료 및 저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Main list table
                      <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-zinc-950">등록된 공식 대회 목록 ({competitions.length}개)</h4>
                          <button
                            onClick={() => setShowAddCompForm(!showAddCompForm)}
                            className="text-xs bg-zinc-900 text-white font-semibold px-4 py-1.5 rounded-full hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {showAddCompForm ? '대회 등록 폼 닫기' : '새 대회 직접 등록'}
                          </button>
                        </div>

                        {/* Add Competition Expandable Form */}
                        <AnimatePresence>
                          {showAddCompForm && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4 mb-4">
                                <h5 className="text-xs font-bold text-zinc-900">새 공식 대회 정보 직접 등록</h5>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-500 font-semibold block">대회 구분 *</label>
                                    <select
                                      value={newCompCategory}
                                      onChange={(e) => setNewCompCategory(e.target.value as any)}
                                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    >
                                      <option value="domestic">국내대회 (Domestic)</option>
                                      <option value="international">국제대회 (International)</option>
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-500 font-semibold block">대회 기간 / 개최일 *</label>
                                    <input
                                      type="text"
                                      placeholder="예: 2026-09-12 또는 2026-11-27 ~ 11-29"
                                      value={newCompDateVal}
                                      onChange={(e) => setNewCompDateVal(e.target.value)}
                                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-semibold block">대회명 (게시글 제목) *</label>
                                  <input
                                    type="text"
                                    placeholder="공식 챔피언십 대회 타이틀을 입력해 주세요."
                                    value={newCompTitle}
                                    onChange={(e) => setNewCompTitle(e.target.value)}
                                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-500 font-semibold block">주관 / 주최사</label>
                                    <input
                                      type="text"
                                      placeholder="예: 사단법인 한국치어리딩협회 (KCF)"
                                      value={newCompOrganizer}
                                      onChange={(e) => setNewCompOrganizer(e.target.value)}
                                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-500 font-semibold block">개최 장소</label>
                                    <input
                                      type="text"
                                      placeholder="예: 서울 송파구 올림픽핸드볼경기장"
                                      value={newCompLocation}
                                      onChange={(e) => setNewCompLocation(e.target.value)}
                                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-semibold block">대회 대표 이미지 URL 또는 파일 업로드</label>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                      type="text"
                                      placeholder="https://images.unsplash.com/... 또는 직접 아래 업로드"
                                      value={newCompImageUrl}
                                      onChange={(e) => setNewCompImageUrl(e.target.value)}
                                      className="flex-1 bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                    />
                                    <label className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shrink-0">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>기기에서 업로드</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              setNewCompImageUrl(reader.result as string);
                                              showToast('대회용 사진 이미지가 첨부되었습니다.', 'success');
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                  {newCompImageUrl && (
                                    <div className="mt-2 w-28 h-20 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50">
                                      <img src={newCompImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-semibold block">대회 상세 설명 및 요강 정보 *</label>
                                  <textarea
                                    rows={4}
                                    placeholder="상세 규정, 연령 카테고리 구분, 참가 신청 안내, 안전 매뉴얼 등 세부 내용을 자유롭게 기입하세요."
                                    value={newCompContent}
                                    onChange={(e) => setNewCompContent(e.target.value)}
                                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 resize-none"
                                  ></textarea>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                  <button
                                    onClick={() => {
                                      setShowAddCompForm(false);
                                      setNewCompTitle('');
                                      setNewCompCategory('domestic');
                                      setNewCompContent('');
                                      setNewCompImageUrl('');
                                      setNewCompOrganizer('');
                                      setNewCompLocation('');
                                      setNewCompDateVal('');
                                    }}
                                    className="bg-white border border-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                                  >
                                    취소
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!newCompTitle.trim() || !newCompDateVal.trim() || !newCompContent.trim()) {
                                        showToast('모든 필수 항목(*)을 채워 주세요.', 'error');
                                        return;
                                      }
                                      const defaultImg = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800';
                                      const newPost: CompetitionPost = {
                                        id: `comp-${Date.now()}`,
                                        category: newCompCategory,
                                        title: newCompTitle.trim(),
                                        content: newCompContent.trim(),
                                        date: new Date().toISOString().split('T')[0],
                                        views: 1,
                                        imageUrl: newCompImageUrl.trim() || defaultImg,
                                        organizer: newCompOrganizer.trim() || '사단법인 한국치어리딩협회 (KCF)',
                                        location: newCompLocation.trim() || '협회 공식 지정 체육관',
                                        compDate: newCompDateVal.trim()
                                      };

                                      const updated = [newPost, ...competitions];
                                      setCompetitions(updated);
                                      showToast('신규 공식 대회가 성공적으로 등록되었습니다.', 'success');

                                      // Reset Form
                                      setNewCompTitle('');
                                      setNewCompCategory('domestic');
                                      setNewCompContent('');
                                      setNewCompImageUrl('');
                                      setNewCompOrganizer('');
                                      setNewCompLocation('');
                                      setNewCompDateVal('');
                                      setShowAddCompForm(false);
                                    }}
                                    className="bg-zinc-900 text-white font-semibold px-5 py-2 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer"
                                  >
                                    대회 정보 등록 완료
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                          <table className="w-full text-xs text-left text-zinc-600 min-w-[750px]">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 uppercase font-bold text-[11px]">
                              <tr>
                                <th className="px-4 py-3 whitespace-nowrap">구분</th>
                                <th className="px-4 py-3 whitespace-nowrap">미리보기</th>
                                <th className="px-4 py-3 whitespace-nowrap">대회명</th>
                                <th className="px-4 py-3 whitespace-nowrap">개최일</th>
                                <th className="px-4 py-3 whitespace-nowrap">조회수</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">관리 조작</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {competitions.map((comp) => (
                                <tr key={comp.id} className="hover:bg-zinc-50/50 transition">
                                  <td className="px-4 py-3.5">
                                    <span className={`text-[9px] font-extrabold px-2 py-1 rounded ${
                                      comp.category === 'domestic' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-red-50 text-red-500 border border-red-100'
                                    }`}>
                                      {comp.category === 'domestic' ? '국내대회' : '국제대회'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <div className="w-10 h-7 rounded overflow-hidden border border-zinc-200 bg-zinc-50">
                                      <img src={comp.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5 font-semibold text-zinc-800 max-w-xs truncate" title={comp.title}>
                                    {comp.title}
                                  </td>
                                  <td className="px-4 py-3.5 text-zinc-500 font-mono">{comp.compDate || comp.date}</td>
                                  <td className="px-4 py-3.5 font-mono">{comp.views}</td>
                                  <td className="px-4 py-3.5 text-right space-x-2">
                                    <button
                                      onClick={() => setAdminEditingComp(comp)}
                                      className="text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-100 rounded px-2.5 py-1 transition text-[10px] cursor-pointer"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => {
                                        const doDelete = () => {
                                          const updated = competitions.filter(c => c.id !== comp.id);
                                          setCompetitions(updated);
                                          showToast('대회 게시글이 성공적으로 삭제되었습니다.', 'success');
                                        };
                                        if (showConfirm) {
                                          showConfirm(
                                            '대회 정보 게시글 삭제',
                                            '정말 이 대회를 삭제하시겠습니까?',
                                            doDelete
                                          );
                                        } else if (window.confirm('정말 이 대회를 삭제하시겠습니까?')) {
                                          doDelete();
                                        }
                                      }}
                                      className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded px-2.5 py-1 transition text-[10px] cursor-pointer"
                                    >
                                      삭제
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {competitions.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="py-10 text-center text-zinc-400 font-light">
                                    등록된 대회 정보가 없습니다. 새 대회를 생성해 보세요.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 10. Category Header Management Panel */}
                {adminActiveTab === 'headers' && (
                  <div className="space-y-6">
                    {/* 상단 퀵 이동 및 돌아가기 버튼 */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-[11px] font-bold text-blue-900">카테고리별 안내 문구 편집 상태 활성화됨</span>
                      </div>
                      <button
                        onClick={() => setAdminActiveTab('stats')}
                        className="text-[11px] font-black text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        ← 제어센터 메인메뉴(종합 요약)로 돌아가기
                      </button>
                    </div>

                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-950">각 카테고리별 안내문구 실시간 편집</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          대회일정, 대회정보, 가입팀명단, 공인선수조회, 공지사항 및 문의센터의 상단 안내 문구(배지, 타이틀, 상세설명)를 실시간 수정할 수 있습니다.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          showConfirm(
                            '안내문구 초기화',
                            '모든 안내문구를 최초 협회 디폴트 프리셋으로 복원하시겠습니까?',
                            () => {
                              setCategoryHeaders(DEFAULT_CATEGORY_HEADERS);
                              showToast('모든 카테고리 안내문구가 기본값으로 복원되었습니다.', 'success');
                            }
                          );
                        }}
                        className="text-xs border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer bg-white"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        전체 기본값 복원
                      </button>
                    </div>

                    <div className="space-y-6">
                      {[
                        { key: 'schedule' as const, name: '❶ 대회 및 행사 일정 카테고리' },
                        { key: 'competitions' as const, name: '❷ 공식 대회 정보 카테고리' },
                        { key: 'teams' as const, name: '❸ 등록팀 및 아카데미 카테고리' },
                        { key: 'athletes' as const, name: '❹ 공인선수 자격조회 카테고리' },
                        { key: 'notice' as const, name: '❺ 공지사항 및 새소식 카테고리' },
                        { key: 'contact' as const, name: '❻ 소통 및 문의창구 카테고리' },
                      ].map((item) => (
                        <div key={item.key} className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-150 pb-2">
                            <span className="text-xs font-black text-zinc-900">{item.name}</span>
                            <span className="text-[10px] font-mono text-zinc-400 capitalize">{item.key}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Inputs */}
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="block text-[10px] text-zinc-500 font-bold">상단 소분류 배지명 (Badge)</label>
                                <input
                                  type="text"
                                  value={categoryHeaders[item.key].badge}
                                  onChange={(e) => {
                                    const updated = {
                                      ...categoryHeaders,
                                      [item.key]: {
                                        ...categoryHeaders[item.key],
                                        badge: e.target.value
                                      }
                                    };
                                    setCategoryHeaders(updated);
                                  }}
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                                  placeholder="배지 이름 입력"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] text-zinc-500 font-bold">대표 대제목 (Title)</label>
                                <input
                                  type="text"
                                  value={categoryHeaders[item.key].title}
                                  onChange={(e) => {
                                    const updated = {
                                      ...categoryHeaders,
                                      [item.key]: {
                                        ...categoryHeaders[item.key],
                                        title: e.target.value
                                      }
                                    };
                                    setCategoryHeaders(updated);
                                  }}
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-semibold"
                                  placeholder="타이틀 입력"
                                />
                              </div>
                            </div>

                            {/* Description and Live Preview */}
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="block text-[10px] text-zinc-500 font-bold">상세 안내 문구 (Description)</label>
                                <textarea
                                  rows={3}
                                  value={categoryHeaders[item.key].desc}
                                  onChange={(e) => {
                                    const updated = {
                                      ...categoryHeaders,
                                      [item.key]: {
                                        ...categoryHeaders[item.key],
                                        desc: e.target.value
                                      }
                                    };
                                    setCategoryHeaders(updated);
                                  }}
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 resize-none font-light leading-relaxed"
                                  placeholder="상세 설명문 기입"
                                ></textarea>
                              </div>
                            </div>
                          </div>

                          {/* Live Preview Bar */}
                          <div className="bg-white border border-zinc-150 rounded-xl p-3 text-center">
                            <span className="text-[8px] bg-zinc-100 text-zinc-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-max mx-auto mb-2">실시간 프리뷰 (Live Preview)</span>
                            <div className="max-w-xl mx-auto py-1">
                              <span className="inline-block bg-zinc-900 text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1.5">
                                {categoryHeaders[item.key].badge || 'BADGE'}
                              </span>
                              <h4 className="text-sm font-serif font-black text-zinc-950 tracking-tight leading-none mb-1">
                                {categoryHeaders[item.key].title || 'TITLE'}
                              </h4>
                              <p className="text-[10px] text-zinc-500 mt-1 max-w-md mx-auto line-clamp-1 leading-normal font-light">
                                {categoryHeaders[item.key].desc || 'DESCRIPTION'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 세 가지 핵심 약속 편집 섹션 */}
                    <div className="border-t border-zinc-200 pt-8 mt-10">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                          <h4 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            KCF의 세 가지 핵심 약속 실시간 편집
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            협회 소개 페이지 하단에 노출되는 KCF의 3대 가치관 및 핵심 약속 항목들을 직접 수정합니다.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            showConfirm(
                              '핵심 약속 초기화',
                              '세 가지 핵심 약속 내용을 최초 기본값으로 복구하시겠습니까?',
                              () => {
                                setCorePromises(DEFAULT_CORE_PROMISES);
                                showToast('핵심 약속 항목이 기본값으로 성공적으로 복구되었습니다.', 'success');
                              }
                            );
                          }}
                          className="text-[11px] font-bold border border-zinc-200 text-zinc-700 hover:bg-zinc-50 px-3 py-1.5 rounded-full transition flex items-center gap-1 cursor-pointer bg-white"
                        >
                          <RefreshCw className="w-3 h-3 text-zinc-600" />
                          약속 기본값 복구
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {corePromises.map((promise, index) => (
                          <div key={promise.num} className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-2xs space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                              <span className="text-xs font-black text-blue-600">핵심 약속 {promise.num}</span>
                              <span className="text-[10px] font-mono text-zinc-400">Promise {promise.num}</span>
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="block text-[9px] text-zinc-400 font-bold uppercase">약속 제목</label>
                                <input
                                  type="text"
                                  value={promise.title}
                                  onChange={(e) => {
                                    const updated = [...corePromises];
                                    updated[index] = { ...updated[index], title: e.target.value };
                                    setCorePromises(updated);
                                  }}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900 font-semibold"
                                  placeholder="약속 제목 입력"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] text-zinc-400 font-bold uppercase">상세 설명문</label>
                                <textarea
                                  rows={4}
                                  value={promise.desc}
                                  onChange={(e) => {
                                    const updated = [...corePromises];
                                    updated[index] = { ...updated[index], desc: e.target.value };
                                    setCorePromises(updated);
                                  }}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900 resize-none font-light leading-relaxed"
                                  placeholder="상세 설명 입력"
                                ></textarea>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 하단 제어센터 메인 복귀 버튼 */}
                    <div className="border-t border-zinc-200 pt-6 mt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <p className="text-[10px] text-zinc-400">안내 문구 수정 사항은 실시간으로 저장되며, 즉시 카테고리 상단 레이아웃에 반영됩니다.</p>
                      <button
                        onClick={() => setAdminActiveTab('stats')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <Activity className="w-4 h-4 text-white" />
                        제어센터 메인메뉴(종합 요약)로 돌아가기
                      </button>
                    </div>
                  </div>
                )}

                {/* 11. Donation Disclosure Management Panel */}
                {adminActiveTab === 'donations' && (
                  <div className="space-y-6">
                    {/* Top Quick Status Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-red-50/50 border border-red-100 rounded-2xl p-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-[11px] font-bold text-red-950">연간 기부금 모금 및 활용실적 투명공개 관리센터 활성화됨</span>
                      </div>
                      <button
                        onClick={() => setAdminActiveTab('stats')}
                        className="text-[11px] font-black text-red-600 hover:text-red-800 bg-white hover:bg-red-50 border border-red-200 shadow-2xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5 text-red-600" />
                        ← 제어센터 메인메뉴로 돌아가기
                      </button>
                    </div>

                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-950">연도별 기부금 공시자료 관리</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          협회 기부금 및 사용실적 투명 공개를 위해 연도별 세입 세출, 주요 쓰임새, 그리고 국세청 제출용 공식 증빙 문서 링크를 실시간 관리합니다.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setAdminEditingDonation(null);
                          setNewDonationYear(2026);
                          setNewDonationAmount('');
                          setNewUsedAmount('');
                          setNewUsageDetails('');
                          setNewDonationStatus('public');
                          setNewDonationDocUrl('');
                          setShowAddDonationForm(!showAddDonationForm);
                        }}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full transition flex items-center gap-1.5 cursor-pointer bg-red-600"
                      >
                        {showAddDonationForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {showAddDonationForm ? '작성 취소하기' : '새 공시 데이터 작성'}
                      </button>
                    </div>

                    {/* Statistics Blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl flex items-center gap-3">
                        <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                          <Heart className="w-5 h-5 fill-red-500/10" />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 font-bold block">총 등록된 공시 건수</span>
                          <span className="text-lg font-black text-zinc-800 leading-tight">{donations.length}개 연도</span>
                        </div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 font-bold block">공개 활성화 상태</span>
                          <span className="text-lg font-black text-zinc-800 leading-tight">
                            {donations.filter(d => d.status === 'public').length}개 대외 공개됨
                          </span>
                        </div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 font-bold block">자료 준비 중 (대기)</span>
                          <span className="text-lg font-black text-zinc-800 leading-tight">
                            {donations.filter(d => d.status === 'pending' || d.donationAmount.includes('자료 준비 중')).length}개 년도 대기
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Save or Edit Form */}
                    {showAddDonationForm && (
                      <div className="bg-red-50/20 border border-red-200/60 p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-red-100 pb-2">
                          <span className="text-xs font-black text-red-600 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            {adminEditingDonation ? `❷ 공시 데이터 편집 (${adminEditingDonation.year}년)` : '❶ 새 공시 데이터 등록'}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400">DONATION EDITOR</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-zinc-500 font-bold">대상 연도 (Year) *</label>
                            <input
                              type="number"
                              min={2000}
                              max={2100}
                              value={newDonationYear}
                              onChange={(e) => setNewDonationYear(parseInt(e.target.value) || 2026)}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-red-500"
                              placeholder="예: 2026"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-zinc-500 font-bold">연간 총 모금액 *</label>
                            <input
                              type="text"
                              value={newDonationAmount}
                              onChange={(e) => setNewDonationAmount(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-red-500"
                              placeholder="예: 45,000,000원 (또는 '자료 준비 중')"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-zinc-500 font-bold">연간 총 지출/활용액 *</label>
                            <input
                              type="text"
                              value={newUsedAmount}
                              onChange={(e) => setNewUsedAmount(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-red-500"
                              placeholder="예: 42,100,000원 (또는 '-')"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-8 space-y-1">
                            <label className="block text-[10px] text-zinc-500 font-bold">주요 활용내역 및 사용 목적 *</label>
                            <input
                              type="text"
                              value={newUsageDetails}
                              onChange={(e) => setNewUsageDetails(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-red-500"
                              placeholder="예: 전국 유소년 치어리딩 페스티벌 대회 지원 및 안전지도자 교육비 지원"
                            />
                          </div>

                          <div className="md:col-span-4 space-y-1">
                            <label className="block text-[10px] text-zinc-500 font-bold">공시 공개 여부 *</label>
                            <select
                              value={newDonationStatus}
                              onChange={(e) => setNewDonationStatus(e.target.value as any)}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-red-500 cursor-pointer"
                            >
                              <option value="public">일반 공개 (Active)</option>
                              <option value="pending">자료 대기중 (Pending/준비중)</option>
                              <option value="private">비공개 관리용 (Private/임시저장)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] text-zinc-500 font-bold">국세청 제출/공식 연간 실적 증빙 문서 링크 (선택사항)</label>
                          <input
                            type="text"
                            value={newDonationDocUrl}
                            onChange={(e) => setNewDonationDocUrl(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-red-500 font-mono"
                            placeholder="예: https://www.nts.go.kr 이나 PDF 증빙 파일 다운로드 링크"
                          />
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddDonationForm(false);
                              setAdminEditingDonation(null);
                            }}
                            className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition cursor-pointer"
                          >
                            작성 취소
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newDonationAmount.trim()) {
                                showToast('연간 총 모금액을 기재해주세요. (없을 시 자료 준비 중)', 'error');
                                return;
                              }
                              if (!newUsedAmount.trim()) {
                                showToast('연간 총 지출/활용액을 기재해주세요. (없을 시 - 또는 자료 준비 중)', 'error');
                                return;
                              }
                              if (!newUsageDetails.trim()) {
                                showToast('사용 목적 및 주요 사용처를 간략히 입력해주세요.', 'error');
                                return;
                              }

                              const payload: DonationRecord = {
                                id: adminEditingDonation?.id || `donation_${Date.now()}`,
                                year: newDonationYear,
                                donationAmount: newDonationAmount,
                                usedAmount: newUsedAmount,
                                usageDetails: newUsageDetails,
                                status: newDonationStatus,
                                docUrl: newDonationDocUrl.trim() || undefined
                              };

                              if (adminEditingDonation) {
                                setDonations(prev => prev.map(d => d.id === payload.id ? payload : d));
                              } else {
                                setDonations(prev => [...prev, payload]);
                              }
                              showToast(
                                adminEditingDonation 
                                  ? `${newDonationYear}년도 기부금 실적 공시가 성공적으로 업데이트되었습니다.` 
                                  : `${newDonationYear}년도 기부금 실적 공시가 새로 등록 완료되었습니다.`,
                                'success'
                              );

                              // reset forms
                              setShowAddDonationForm(false);
                              setAdminEditingDonation(null);
                              setNewDonationYear(2026);
                              setNewDonationAmount('');
                              setNewUsedAmount('');
                              setNewUsageDetails('');
                              setNewDonationStatus('public');
                              setNewDonationDocUrl('');
                            }}
                            className="px-6 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-100 transition cursor-pointer bg-red-600"
                          >
                            공시 저장 및 즉시 반영
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Data List Table */}
                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                      <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3.5">
                        <h5 className="text-xs font-bold text-zinc-800">등록 완료된 연도별 공시 목록</h5>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-zinc-100/50 border-b border-zinc-200 text-zinc-500 font-bold">
                              <th className="py-3 px-4 w-16 text-center">공시 연도</th>
                              <th className="py-3 px-4">연간 기부 모금액</th>
                              <th className="py-3 px-4">사용/지출액</th>
                              <th className="py-3 px-4">주요 목적 및 세부 사용내역</th>
                              <th className="py-3 px-4 w-28 text-center">공개 상태</th>
                              <th className="py-3 px-4 w-20 text-center">공식 증빙</th>
                              <th className="py-3 px-4 w-24 text-center">관리 작업</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-150">
                            {donations
                              .sort((a, b) => b.year - a.year)
                              .map((item) => (
                                <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                                  <td className="py-3.5 px-4 font-black text-center text-zinc-900 bg-zinc-50/20">{item.year}년</td>
                                  <td className="py-3.5 px-4 font-bold text-zinc-800">{item.donationAmount}</td>
                                  <td className="py-3.5 px-4 font-medium text-zinc-600">{item.usedAmount}</td>
                                  <td className="py-3.5 px-4 text-zinc-500 max-w-xs truncate" title={item.usageDetails}>
                                    {item.usageDetails}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                      item.status === 'public' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                      item.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                      'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                    }`}>
                                      {item.status === 'public' ? '공개중' : item.status === 'pending' ? '자료대기' : '임시비공개'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    {item.docUrl ? (
                                      <a
                                        href={item.docUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-red-600 hover:underline font-bold text-[10px]"
                                      >
                                        증빙 있음
                                      </a>
                                    ) : (
                                      <span className="text-zinc-300">-</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => {
                                          setAdminEditingDonation(item);
                                          setNewDonationYear(item.year);
                                          setNewDonationAmount(item.donationAmount);
                                          setNewUsedAmount(item.usedAmount);
                                          setNewUsageDetails(item.usageDetails);
                                          setNewDonationStatus(item.status);
                                          setNewDonationDocUrl(item.docUrl || '');
                                          setShowAddDonationForm(true);
                                        }}
                                        className="p-1 rounded bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
                                        title="수정하기"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          showConfirm(
                                            '공시 내역 삭제',
                                            `정말로 ${item.year}년도의 기부금 활용실적 공시 데이터를 완전히 영구 삭제하시겠습니까?`,
                                            () => {
                                              setDonations(prev => prev.filter(d => d.id !== item.id));
                                              showToast(`${item.year}년도 공시 내역이 성공적으로 완전 제거되었습니다.`, 'success');
                                            }
                                          );
                                        }}
                                        className="p-1 rounded bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 hover:text-red-700 transition cursor-pointer"
                                        title="삭제하기"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}

                            {donations.length === 0 && (
                              <tr>
                                <td colSpan={7} className="text-center py-8 text-zinc-400 font-light">
                                  등록된 연도별 기부금 공시 및 사용실적 자료가 존재하지 않습니다.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-400">
                <span>사단법인 한국치어리딩협회 통합 전산관리센터</span>
                <button
                  onClick={() => setShowAdminDashboardModal(false)}
                  className="bg-zinc-900 text-white font-bold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition cursor-pointer"
                >
                  제어 센터 닫기
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Custom Non-blocking Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-transparent"
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-white border border-zinc-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl z-10 space-y-4 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 tracking-tight">{confirmModal.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">{confirmModal.message}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Non-blocking Toast Alerts */}
      <AnimatePresence>
        {toast.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-3 bg-zinc-950 border border-zinc-800 text-white rounded-2xl px-5 py-4 shadow-2xl max-w-md w-auto pointer-events-none"
          >
            {toast.type === 'success' && (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Info className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="text-xs font-semibold tracking-tight whitespace-nowrap">
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Password Verification Modal */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => {
                setShowPasswordPrompt(false);
                setPendingAdminAction(null);
              }}
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-white border border-zinc-200 rounded-3xl p-6 max-w-md w-full shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 tracking-tight">관리자 인증 보안 확인</h4>
                  <p className="text-[10px] text-zinc-400">관리자 기능을 수행하기 위해 비밀번호를 입력해 주세요.</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passwordInput === adminPassword) {
                    setIsUnlocked(true);
                    setShowPasswordPrompt(false);
                    if (pendingAdminAction) {
                      pendingAdminAction();
                      setPendingAdminAction(null);
                    }
                  } else {
                    setPasswordError('비밀번호가 올바르지 않습니다. 다시 입력해 주세요.');
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] text-zinc-500 font-semibold">보안 비밀번호</label>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      기본 비밀번호: <code className="bg-zinc-100 px-1 py-0.5 rounded text-blue-600 font-mono">bt2009</code>
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-800 focus:outline-none focus:border-zinc-900 focus:bg-white transition"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                      ⚠️ {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setPendingAdminAction(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    인증 취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    확인 및 인증
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
