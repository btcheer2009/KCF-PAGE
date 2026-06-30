import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldCheck, User, Calendar, Award, CheckCircle, 
  AlertTriangle, CreditCard, RefreshCw, X, Users, Check
} from 'lucide-react';
import { Athlete } from '../types';

interface AthleteLookupProps {
  athletes: Athlete[];
  headerBadge?: string;
  headerTitle?: string;
  headerDesc?: string;
}

export default function AthleteLookup({ 
  athletes,
  headerBadge = 'KCF INTEGRATED REGISTRY',
  headerTitle = '사무처 공인 선수 자격 조회 시스템',
  headerDesc = '한국치어리딩협회(KCF) 전산 데이터베이스에 공식 승인 등록된 지도자 및 선수단의 자격을 실시간으로 조회합니다. 등록 성명 또는 선수 등록번호를 입력해 주십시오.'
}: AthleteLookupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      setSearchResults([]);
      setHasSearched(false);
      setSelectedAthlete(null);
      return;
    }

    const matches = athletes.filter(ath => 
      ath.name.toLowerCase().includes(query) || 
      ath.regNumber.toLowerCase().includes(query) ||
      ath.teamName.toLowerCase().includes(query)
    );

    setSearchResults(matches);
    setHasSearched(true);
    
    // If exactly one match, select it immediately
    if (matches.length === 1) {
      setSelectedAthlete(matches[0]);
    } else {
      setSelectedAthlete(null);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setSelectedAthlete(null);
  };

  const getStatusClass = (status: Athlete['status']) => {
    switch (status) {
      case '정상등록':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case '갱신필요':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case '정지':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          {headerBadge}
        </span>
        <h3 className="text-3xl md:text-5xl font-serif text-zinc-950 font-black tracking-tight uppercase leading-tight">
          {headerTitle}
        </h3>
        <p className="text-sm text-zinc-500 font-normal mt-4 leading-relaxed">
          {headerDesc}
        </p>
      </div>

      {/* Main Grid: Lookup controls & details card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Search Panel & Quick Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-zinc-900 mb-1 flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-500" />
              선수 정보 검색 필드
            </h4>
            <p className="text-[11px] text-zinc-400 mb-4 font-light">등록번호 전체 혹은 선수 성명을 입력하세요.</p>

            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="예: ooo 또는 KCF-2026-0101"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-4 pr-10 py-3.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 focus:bg-white font-medium transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs py-3.5 px-6 rounded-2xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  실시간 인증 조회
                </button>
              </div>
            </form>

            {/* Quick Helper Tips */}
            <div className="mt-5 pt-4 border-t border-zinc-100 flex items-start gap-2.5 text-[10px] text-zinc-400 font-light leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                등록 후 데이터 동기화에는 일정 시간 소요될 수 있습니다. 
                선수 보호자 및 지도자는 명칭 및 자격 만료 기간을 항시 관리해 주시기 바랍니다.
              </div>
            </div>
          </div>

          {/* Search Result Matches List */}
          {hasSearched && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-200/60 pb-2">
                <h5 className="text-[11px] font-bold text-zinc-700">검색 매칭 결과 ({searchResults.length}건)</h5>
                {searchResults.length > 0 && (
                  <span className="text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded font-bold font-mono">LIVE MATCH</span>
                )}
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {searchResults.map((ath) => (
                    <button
                      key={ath.id}
                      onClick={() => setSelectedAthlete(ath)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs transition duration-300 flex items-center justify-between gap-3 cursor-pointer ${
                        selectedAthlete?.id === ath.id
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/10'
                          : 'bg-white border-zinc-200 hover:border-zinc-400 text-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5 text-sm">
                          <span>{ath.name}</span>
                          <span className={`text-[10px] font-light ${selectedAthlete?.id === ath.id ? 'text-zinc-300' : 'text-zinc-400'}`}>
                            ({ath.gender}, {ath.birthDate.split('-')[0]}년생)
                          </span>
                        </div>
                        <div className={`text-[10px] mt-1 font-mono ${selectedAthlete?.id === ath.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {ath.regNumber}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${selectedAthlete?.id === ath.id ? 'text-zinc-400 font-light' : 'text-zinc-400'}`}>
                          {ath.teamName}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          selectedAthlete?.id === ath.id
                            ? 'bg-white/10 text-white border border-white/20'
                            : getStatusClass(ath.status)
                        }`}>
                          {ath.status}
                        </span>
                        {selectedAthlete?.id === ath.id && (
                          <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5 mt-1">
                            <Check className="w-3 h-3" /> 인증됨
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 px-4 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                  <div>
                    <span className="font-bold text-zinc-800 block mb-1">검색 결과가 존재하지 않습니다</span>
                    입력하신 검색어가 선수 성명 혹은 협회 고유 등록번호와 정확히 일치하는지 다시 확인해 주시기 바랍니다.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Association Registration Metrics Bento Box */}
          <div className="bg-zinc-900 text-zinc-300 rounded-3xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <span className="text-[9px] text-blue-400 font-bold tracking-widest uppercase block mb-1">DATA INSIGHTS</span>
            <h5 className="text-xs font-bold text-white mb-4">KCF 가입선수 인증 통계현황</h5>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-white text-xl font-black font-mono">{athletes.length}</div>
                <div className="text-[9px] text-zinc-400 mt-1">등록 선수</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-emerald-400 text-xl font-black font-mono">
                  {athletes.length > 0 ? Math.round((athletes.filter(a => a.status === '정상등록').length / athletes.length) * 100) : 100}%
                </div>
                <div className="text-[9px] text-zinc-400 mt-1">정상 승인율</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-amber-400 text-xl font-black font-mono">
                  {athletes.filter(a => a.status === '갱신필요').length}
                </div>
                <div className="text-[9px] text-zinc-400 mt-1">갱신 만료자</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Official Association ID Card Display */}
        <div className="lg:col-span-7 flex justify-center">
          <AnimatePresence mode="wait">
            {selectedAthlete ? (
              <motion.div
                key={selectedAthlete.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md relative"
              >
                {/* ID Card Front */}
                <div className="bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-white rounded-3xl border-4 border-amber-400/80 shadow-2xl overflow-hidden p-6 relative">
                  
                  {/* Subtle holographic line / grid pattern overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
                  
                  {/* Holographic glowing badge */}
                  <div className="absolute top-0 right-10 w-24 h-24 bg-gradient-to-b from-amber-400/20 to-blue-500/0 rounded-full blur-xl pointer-events-none"></div>

                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-5 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center border border-white/20 shadow">
                        <Award className="w-4 h-4 text-zinc-900" />
                      </div>
                      <div className="text-left">
                        <h5 className="text-[10px] font-black tracking-widest text-amber-400 uppercase leading-none font-sans">KOREA CHEERLEADING</h5>
                        <span className="text-[8px] tracking-wide text-zinc-400 font-light block mt-0.5">사단법인 한국치어리딩협회 공인선수</span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-white/10 border border-white/20 text-zinc-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Official ID
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="grid grid-cols-12 gap-5 relative z-10 items-center">
                    
                    {/* Athlete Photo Area */}
                    <div className="col-span-4 flex flex-col items-center">
                      <div className="w-24 h-28 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 border-white/15 overflow-hidden flex flex-col items-center justify-center relative shadow-inner group">
                        {selectedAthlete.imageUrl ? (
                          <img
                            src={selectedAthlete.imageUrl}
                            alt={selectedAthlete.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <>
                            {/* Avatar representation based on gender */}
                            <div className="w-12 h-12 rounded-full bg-zinc-700/60 border border-white/10 flex items-center justify-center text-zinc-300">
                              <User className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] text-zinc-400 font-bold mt-2 tracking-wider">KCF ATHLETE</span>
                          </>
                        )}
                        
                        {/* Status bar overlays on bottom of photo */}
                        <div className="absolute bottom-0 inset-x-0 bg-amber-400/90 text-zinc-900 text-[8px] font-black text-center py-0.5 uppercase tracking-widest shadow">
                          {selectedAthlete.gender === '남' ? 'MEMBER.M' : 'MEMBER.F'}
                        </div>
                      </div>
                      <div className="text-[8px] font-mono text-zinc-500 mt-1.5 tracking-widest">{selectedAthlete.regNumber.split('-')[2]}</div>
                    </div>

                    {/* Athlete Details */}
                    <div className="col-span-8 space-y-2.5 text-left text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">성명 (Name)</span>
                        <div className="font-extrabold text-white text-base flex items-center gap-1.5">
                          {selectedAthlete.name}
                          <span className="text-[11px] text-zinc-400 font-normal">({selectedAthlete.gender} / {selectedAthlete.birthDate})</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">선수 등록번호 (Registration No.)</span>
                        <div className="font-bold text-amber-400 font-mono text-xs">{selectedAthlete.regNumber}</div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">공식 소속팀 (Affiliated Team)</span>
                        <div className="font-bold text-zinc-200">{selectedAthlete.teamName}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">인증 분류</span>
                          <div className="font-bold text-zinc-300 text-[10px] truncate" title={selectedAthlete.category}>{selectedAthlete.category}</div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">공인 레벨</span>
                          <div className="font-bold text-zinc-300 text-[10px]">{selectedAthlete.level}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Divider */}
                  <div className="border-t border-white/5 my-4 pt-4 relative z-10 flex justify-between items-center text-[10px]">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">자격 만료시점 (Valid Until)</span>
                      <span className="font-mono text-zinc-300 font-bold">{selectedAthlete.validUntil}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-bold border ${
                        selectedAthlete.status === '정상등록'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : selectedAthlete.status === '갱신필요'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          selectedAthlete.status === '정상등록'
                            ? 'bg-emerald-400'
                            : selectedAthlete.status === '갱신필요'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`} />
                        {selectedAthlete.status}
                      </span>
                    </div>
                  </div>

                  {/* Official Gold Seal / Stamp representation */}
                  <div className="absolute bottom-6 right-6 w-14 h-14 border border-amber-500/30 rounded-full flex items-center justify-center transform rotate-12 pointer-events-none">
                    <div className="w-12 h-12 border-2 border-dashed border-amber-500/40 rounded-full flex flex-col items-center justify-center text-[7px] text-amber-500/50 font-black font-sans uppercase tracking-tighter">
                      <span>KCF SEAL</span>
                      <span>사무처</span>
                    </div>
                  </div>
                  
                  {/* Bottom Strip */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-red-600"></div>
                </div>

                {/* Additional verification confirmation banner */}
                <div className="mt-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <span className="text-[11px] font-black text-zinc-900 block">한국치어리딩협회 중앙 전산망 검증 완료</span>
                    <p className="text-[10px] text-zinc-500">본 자격증은 KCF 공인 라이선스 데이터와 완벽히 일치함을 확인하였습니다.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-md h-[340px] border-2 border-dashed border-zinc-200 bg-zinc-50/50 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                <CreditCard className="w-12 h-12 text-zinc-300 mb-3" />
                <span className="text-xs font-bold text-zinc-700 block mb-1">선수 자격 인증 카드가 대기 중입니다</span>
                <p className="text-[11px] text-zinc-400 max-w-xs font-light leading-relaxed">
                  좌측 검색기에서 선수 성함이나 선수등록번호를 입력하신 후 검색 결과에서 선수를 클릭하시면, 
                  공인 선수 인증증이 여기에 활성화됩니다.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
