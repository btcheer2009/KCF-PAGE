/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheerTeam, InquirySubmission } from '../types';
import { 
  Users, MapPin, Calendar, Phone, Search, Plus, X, Award, ShieldCheck, CheckCircle2, Trophy, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeamRegistryProps {
  teams: CheerTeam[];
  setTeams: React.Dispatch<React.SetStateAction<CheerTeam[]>>;
  inquiries?: InquirySubmission[];
  setInquiries?: React.Dispatch<React.SetStateAction<InquirySubmission[]>>;
  teamCategories?: { id: string; label: string }[];
  teamRegions?: string[];
  isAdminMode: boolean;
  showConfirm?: (title: string, message: string, onConfirm: () => void) => void;
  headerBadge?: string;
  headerTitle?: string;
  headerDesc?: string;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function TeamRegistry({ 
  teams, 
  setTeams, 
  inquiries = [],
  setInquiries,
  teamCategories = [
    { id: 'allstar', label: '올스타 (All-Star)' },
    { id: 'university', label: '대학부 (University)' },
    { id: 'club', label: '일반클럽 (Club)' }
  ],
  teamRegions = ['서울', '경기', '부산', '대구', '강원', '인천', '충청', '전라'],
  isAdminMode, 
  showConfirm,
  headerBadge = 'KCF REGISTERED CLUBS',
  headerTitle = '전국 지부별 공인 등록팀 및 아카데미 현황',
  headerDesc = '한국치어리딩협회(KCF)에 정식 가입 및 인가되어 활동하고 있는 소속 클럽, 학교 스포츠클럽 및 전문 교육 아카데미의 공식 명단입니다.',
  showToast
}: TeamRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showRegModal, setShowRegModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // New Team Form States
  const [regName, setRegName] = useState('');
  const [regCategory, setRegCategory] = useState<string>(() => teamCategories[0]?.id || 'club');
  const [regRegion, setRegRegion] = useState<string>(() => teamRegions[0] || '서울');
  const [regMemberCount, setRegMemberCount] = useState<number>(15);
  const [regCoach, setRegCoach] = useState('');
  const [regDescription, setRegDescription] = useState('');
  const [regContact, setRegContact] = useState('');

  const saveTeams = (updated: CheerTeam[]) => {
    setTeams(updated);
  };

  const handleRegisterTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regCoach.trim() || !regContact.trim()) return;

    // Create an InquirySubmission of type 'team_reg' containing the team registration data
    const newInquiry: InquirySubmission = {
      id: `inq-team-${Date.now()}`,
      name: regCoach,
      contact: regContact,
      email: `${regName.replace(/\s+/g, '').toLowerCase()}@kcf-pending.org`,
      type: 'team_reg',
      subject: `[신규 팀 가입 신청] ${regName} (${regRegion}지부)`,
      message: JSON.stringify({
        name: regName,
        category: regCategory,
        region: regRegion,
        memberCount: Number(regMemberCount),
        coach: regCoach,
        description: regDescription || '협회 가입이 승인된 신생 치어리딩 팀입니다.',
        contact: regContact,
        established: new Date().toISOString().split('T')[0]
      }),
      date: new Date().toISOString().split('T')[0],
      status: 'received'
    };

    if (setInquiries && inquiries) {
      const updated = [newInquiry, ...inquiries];
      setInquiries(updated);
    }

    // Reset Form & Show success
    setRegName('');
    setRegCoach('');
    setRegContact('');
    setRegDescription('');
    setRegMemberCount(15);
    setShowRegModal(false);

    if (showToast) {
      showToast('신규 팀 가입 신청이 제출되었습니다. [관리자 메뉴 > 문의/상담 신청 관리]에서 검토 후 정식 승인됩니다.', 'success');
    } else {
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
    }
  };

  const handleDeleteTeam = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const doDelete = () => {
      const updated = teams.filter(t => t.id !== id);
      saveTeams(updated);
    };

    if (showConfirm) {
      showConfirm(
        '단체 명부 제거',
        '정말 이 치어리딩 팀을 명부에서 제거하시겠습니까?',
        doDelete
      );
    } else if (window.confirm('정말 이 치어리딩 팀을 명부에서 제거하시겠습니까?')) {
      doDelete();
    }
  };

  // Regions lists
  const availableRegions = ['all', ...teamRegions];

  // Filter teams
  const filteredTeams = teams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.coach.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || t.region === selectedRegion;
    return matchesSearch && matchesCategory && matchesRegion;
  });

  const getCategoryLabel = (cat: string) => {
    const found = teamCategories.find(c => c.id === cat);
    return found ? found.label : cat;
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'allstar': return 'text-blue-700 border-blue-200 bg-blue-50';
      case 'university': return 'text-indigo-700 border-indigo-200 bg-indigo-50';
      case 'club': return 'text-emerald-700 border-emerald-200 bg-emerald-50';
      default: return 'text-zinc-700 border-zinc-200 bg-zinc-50';
    }
  };

  return (
    <div id="kcf-team-registry-section" className="relative text-slate-900">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            id="toast-reg-success"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-blue-500 text-slate-900 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl max-w-sm w-full"
          >
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-700">등록 신청 완료!</p>
              <p className="text-[11px] text-slate-600 font-light mt-0.5">신규 치어리딩 팀 정보가 성공적으로 제출되었습니다. 사무국 검토 후 승인처리됩니다.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Header */}
      <div className="text-center max-w-5xl mx-auto mb-12 flex flex-col items-center">
        <span className="inline-flex items-center gap-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          {headerBadge}
        </span>
        <h3 className="text-3xl md:text-5xl font-serif text-zinc-950 font-black tracking-tight uppercase leading-tight">
          {headerTitle}
        </h3>
        <p className="text-sm text-zinc-500 font-normal mt-4 leading-relaxed">
          {headerDesc}
        </p>
        <button
          id="trigger-team-reg-modal"
          onClick={() => setShowRegModal(true)}
          className="mt-6 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs tracking-wide px-6 py-3 rounded-full flex items-center gap-1.5 transition duration-300 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          신규 팀 가입 신청
        </button>
      </div>

      {/* Control Panel: Filters & Search */}
      <div className="bg-zinc-50 border border-zinc-200/60 rounded-3xl p-6 mb-8 flex flex-col gap-6">
        
        {/* Category Filters */}
        <div>
          <span className="text-xs text-zinc-400 block mb-3 font-semibold">종목 분류 필터</span>
          <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 rounded-2xl w-max">
            {['all', ...teamCategories.map(c => c.id)].map((cat) => (
              <button
                id={`filter-team-${cat}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs tracking-wide transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                }`}
              >
                {cat === 'all' ? '전체 종목' : getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Region Filters */}
          <div className="md:col-span-6">
            <span className="text-xs text-zinc-400 block mb-2 font-semibold">지역구 선택</span>
            <div className="flex flex-wrap gap-1.5">
              {availableRegions.map((reg) => (
                <button
                  id={`filter-region-${reg}`}
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1.5 rounded-lg text-xs tracking-wide transition-all duration-300 cursor-pointer border ${
                    selectedRegion === reg
                      ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {reg === 'all' ? '전체 지역' : reg}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="md:col-span-6">
            <span className="text-xs text-zinc-400 block mb-2 font-semibold">검색어 검색 (팀명, 지도자명, 소개글)</span>
            <div className="relative">
              <input
                id="search-team-input"
                type="text"
                placeholder="팀명 혹은 감독 이름을 입력하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-100 text-zinc-800 transition shadow-sm"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Teams (Board Style) */}
      <div className="relative z-10">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-zinc-200 bg-zinc-50 rounded-3xl">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h4 className="text-base text-zinc-700 font-medium">검색된 팀이 없습니다.</h4>
            <p className="text-xs text-zinc-400 font-light mt-1">지역과 카테고리 필터를 변경하거나 새로운 검색어로 조회해 보십시오.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="hidden lg:table w-full border-collapse text-left text-xs md:text-sm">
              <thead>
                <tr className="border-t-2 border-b border-zinc-900 text-zinc-800 font-bold bg-zinc-50/70 text-center">
                  <th className="py-4 px-3 w-28 text-center">종목 구분</th>
                  <th className="py-4 px-3 w-28 text-center">지역 지부</th>
                  <th className="py-4 px-4 text-left">팀명 및 주요 소개</th>
                  <th className="py-4 px-3 w-24 text-center">선수단 수</th>
                  <th className="py-4 px-3 w-28 text-center">지도자(감독)</th>
                  <th className="py-4 px-3 w-28 text-center">창단년도</th>
                  <th className="py-4 px-3 w-36 text-center">연락처</th>
                  {isAdminMode && <th className="py-4 px-3 w-20 text-center">관리</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr
                    id={`team-row-${team.id}`}
                    key={team.id}
                    className="border-b border-zinc-150 bg-white hover:bg-zinc-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-3 text-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${getCategoryTheme(team.category)}`}>
                        {getCategoryLabel(team.category).split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-center font-medium text-zinc-700">
                      <span className="flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                        {team.region} 지부
                      </span>
                    </td>
                    <td className="py-4 px-4 text-left">
                      <h4 className="text-sm font-bold text-zinc-950 truncate max-w-xs">
                        {team.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-light line-clamp-1 mt-0.5">
                        {team.description}
                      </p>
                    </td>
                    <td className="py-4 px-3 text-center font-semibold text-zinc-800">
                      {team.memberCount}명
                    </td>
                    <td className="py-4 px-3 text-center text-zinc-700 font-medium">
                      {team.coach}
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-zinc-500">
                      {team.established}
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-xs">
                      <a href={`tel:${team.contact}`} className="hover:text-blue-600 hover:underline text-zinc-600 transition">
                        {team.contact}
                      </a>
                    </td>
                    {isAdminMode && (
                      <td className="py-4 px-3 text-center">
                        <button
                          id={`delete-team-btn-${team.id}`}
                          onClick={(e) => handleDeleteTeam(team.id, e)}
                          className="p-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
                          title="팀 제거"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tablet & Mobile Grid View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTeams.map((team, idx) => (
                <div
                  id={`team-mobile-card-${team.id}`}
                  key={team.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 transition-all flex flex-col justify-between relative"
                >
                  {isAdminMode && (
                    <button
                      id={`delete-team-btn-mob-${team.id}`}
                      onClick={(e) => handleDeleteTeam(team.id, e)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-3 pr-6">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${getCategoryTheme(team.category)}`}>
                        {getCategoryLabel(team.category).split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        {team.region} 지부
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-950 truncate mb-1">
                      {team.name}
                    </h4>
                    <p className="text-xs text-zinc-500 font-light line-clamp-2 mb-4 leading-relaxed">
                      {team.description}
                    </p>
                  </div>

                  <div className="border-t border-zinc-100 pt-3 mt-auto grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-zinc-500 font-mono">
                    <div>선수: <strong className="text-zinc-800 font-semibold">{team.memberCount}명</strong></div>
                    <div>감독: <strong className="text-zinc-800 font-semibold">{team.coach}</strong></div>
                    <div>창단: {team.established}</div>
                    <div className="truncate">연락처: <a href={`tel:${team.contact}`} className="text-blue-600">{team.contact}</a></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Team Registration Modal */}
      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegModal(false)}
              className="absolute inset-0"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto z-10 text-slate-900"
            >
              <button 
                id="close-reg-team-modal"
                onClick={() => setShowRegModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-semibold text-slate-950 mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-700" />
                KCF 신규 등록 신청서
              </h3>
              <p className="text-xs text-slate-500 font-light mb-6">
                한국치어리딩협회 중앙이사회 및 심의 규정을 바탕으로, 정식 자격을 획득하고자 하는 단체는 하기 폼을 입력해 주십시오.
              </p>

              <form onSubmit={handleRegisterTeam} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-semibold">단체 / 팀 공식 명칭</label>
                  <input
                    id="reg-team-name"
                    type="text"
                    required
                    placeholder="예: 서울 드림 올스타즈"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1.5 font-semibold">종목 분류</label>
                    <select
                      id="reg-team-category"
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-700"
                    >
                      {teamCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-semibold">연고지 / 지부</label>
                    <select
                      id="reg-team-region"
                      value={regRegion}
                      onChange={(e) => setRegRegion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-700"
                    >
                      {teamRegions.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1.5 font-semibold">대표 지도자 성명</label>
                    <input
                      id="reg-team-coach"
                      type="text"
                      required
                      placeholder="자격증 보유 감독명"
                      value={regCoach}
                      onChange={(e) => setRegCoach(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-semibold">소속 선수 인원 (수)</label>
                    <input
                      id="reg-team-membercount"
                      type="number"
                      required
                      min={5}
                      max={100}
                      value={regMemberCount}
                      onChange={(e) => setRegMemberCount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5 font-semibold">연락처 / 사무국 전화</label>
                  <input
                    id="reg-team-contact"
                    type="text"
                    required
                    placeholder="예: 010-XXXX-XXXX 또는 02-XXX-XXXX"
                    value={regContact}
                    onChange={(e) => setRegContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5 font-semibold">팀 역사 및 주요 소개 (공백 포함 300자 내외)</label>
                  <textarea
                    id="reg-team-desc"
                    rows={4}
                    placeholder="팀의 창단 일화, 주로 입상한 대회 경력, 팀 지향점 등을 자유롭게 적어주세요."
                    value={regDescription}
                    onChange={(e) => setRegDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-700 resize-none"
                  />
                </div>

                <div className="flex gap-2 items-start py-1">
                  <input
                    id="agree-rules-check"
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-slate-300 bg-slate-50 text-blue-700 shrink-0 mt-0.5"
                  />
                  <label htmlFor="agree-rules-check" className="text-[10px] text-slate-500 leading-snug">
                    본 신청 단체는 KCF 스포츠 폭력 예방 지침을 엄수하고, 규격 매트 및 공인 보조자(Spotter) 배치 의무 등 안전 규칙 제반 규정을 충실히 이행할 것을 서약합니다.
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    id="cancel-reg-team-btn"
                    type="button"
                    onClick={() => setShowRegModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-full font-medium text-slate-700 transition cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    id="submit-reg-team-btn"
                    type="submit"
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-full transition cursor-pointer shadow-md shadow-blue-100"
                  >
                    등록서 제출하기
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
