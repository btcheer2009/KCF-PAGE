import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, ShieldCheck, Download, AlertCircle, FileText, CheckCircle, 
  ExternalLink, Calendar, Landmark, Info, HandCoins, HelpCircle
} from 'lucide-react';
import { DonationRecord } from '../types';

interface DonationDisclosureProps {
  donations: DonationRecord[];
  headerBadge?: string;
  headerTitle?: string;
  headerDesc?: string;
}

export default function DonationDisclosure({
  donations,
  headerBadge = 'KCF DONATION DISCLOSURE',
  headerTitle = '연간 기부금 모금액 및 활용실적',
  headerDesc = '사단법인 한국치어리딩협회는 국세청 지정 기부금 단체로서 회원과 후원자분들의 소중한 기부금을 투명하고 공정하게 관리합니다. 관련 법령에 따라 연간 기부금 모금액과 사용 내역을 투명하게 공시합니다.'
}: DonationDisclosureProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Sort donations by year descending
  const sortedDonations = [...donations].sort((a, b) => b.year - a.year);

  // Filter donations by year if selected
  const filteredDonations = selectedYear === 'all' 
    ? sortedDonations 
    : sortedDonations.filter(d => d.year.toString() === selectedYear);

  // Unique years list for the filter dropdown
  const years = Array.from(new Set(sortedDonations.map(d => d.year.toString()))).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-6xl mx-auto px-4" id="donation-disclosure-root">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-xs">
          <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400/20" />
          {headerBadge}
        </span>
        <h3 className="text-3xl md:text-5xl font-serif text-zinc-950 font-black tracking-tight uppercase leading-tight">
          {headerTitle}
        </h3>
        <p className="text-sm text-zinc-500 font-normal mt-4 leading-relaxed">
          {headerDesc}
        </p>
      </div>

      {/* Trust Dashboard Banner */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 md:p-8 mb-10 shadow-lg border border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2 border-r border-zinc-800 last:border-none pr-4">
            <div className="flex items-center gap-2 text-red-400">
              <Landmark className="w-5 h-5" />
              <h4 className="font-bold text-sm text-zinc-100">공익법인 지정 단체</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              기획재정부장관이 지정 및 고시하는 공익법인으로서 법적 공신력과 기무 자격 요건을 완비하여 엄격하게 소득세법 및 법인세법을 준수합니다.
            </p>
          </div>
          <div className="space-y-2 border-r border-zinc-800 last:border-none pr-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-bold text-sm text-zinc-100">수행 투명성 보장</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              매년 국세청 홈택스 정식 공시 및 연간 수입명세 보고를 이행하며, 협회 정기 내부 감사 및 이사회 정식 심의 보고를 통과한 내역만을 반영합니다.
            </p>
          </div>
          <div className="space-y-2 last:border-none pr-4">
            <div className="flex items-center gap-2 text-blue-400">
              <HandCoins className="w-5 h-5" />
              <h4 className="font-bold text-sm text-zinc-100">기부 기여 대상 사업</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              모금된 소중한 재원은 꿈나무 유소년 대표 발굴, 국가대표 훈련 전지 지원, 일선 학교 보조 안전 매트 보급 및 교육 사업 활성화에 직접 투입됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-lg border border-zinc-200">
            <Calendar className="w-4 h-4 text-zinc-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900">연도별 검색 필터</h4>
            <p className="text-[10px] text-zinc-400">선택한 회계 연도의 공시 자료를 필터링합니다.</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full sm:w-48 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs cursor-pointer"
          >
            <option value="all">모든 연도 실적 보기</option>
            {years.map(y => (
              <option key={y} value={y}>{y}년도 내역</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table / Mobile Cards */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs mb-12">
        
        {/* Desktop Table view (Visible on sm/md and larger) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/70 border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-20 whitespace-nowrap">공시 연도</th>
                <th className="py-4 px-6 w-36 text-right whitespace-nowrap">기부금 모금액</th>
                <th className="py-4 px-6 w-36 text-right whitespace-nowrap">기부금 사용액</th>
                <th className="py-4 px-6 whitespace-nowrap">지출 상세 내역 / 활용 실적 및 목적</th>
                <th className="py-4 px-6 text-center w-40 whitespace-nowrap">공개 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 text-xs">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400 font-medium">
                    조회된 연도의 기부금 공시 자료가 아직 데이터베이스에 존재하지 않습니다.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((item) => {
                  const isPending = item.status === 'pending' || item.usageDetails === '자료 준비 중';
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/40 transition duration-150">
                      {/* Year */}
                      <td className="py-5 px-6 text-center font-bold text-zinc-900 font-serif text-sm whitespace-nowrap">
                        {item.year}년
                      </td>
                      {/* Donation Amount */}
                      <td className="py-5 px-6 text-right font-semibold text-zinc-800 whitespace-nowrap">
                        {item.donationAmount}
                      </td>
                      {/* Used Amount */}
                      <td className="py-5 px-6 text-right font-semibold text-zinc-800 whitespace-nowrap">
                        {item.usedAmount}
                      </td>
                      {/* Usage Details */}
                      <td className="py-5 px-6">
                        {isPending ? (
                          <div className="flex items-center gap-1.5 text-amber-600 font-medium bg-amber-50/50 border border-amber-100 rounded-lg px-2.5 py-1 w-max whitespace-nowrap">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="whitespace-nowrap">해당 회계 연도 종료 및 국세청 공시 전 자료 준비 중</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 font-medium">{item.usageDetails}</span>
                        )}
                      </td>
                      {/* Status / Document Links */}
                      <td className="py-5 px-6 text-center whitespace-nowrap">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                            자료 준비 중
                          </span>
                        ) : (
                          <div className="flex flex-col items-center gap-1 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1 whitespace-nowrap">
                              <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                              정식 공시 완료
                            </span>
                            {item.docUrl && (
                              <a
                                href={item.docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer"
                                className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline decoration-2 underline-offset-2 transition whitespace-nowrap"
                              >
                                <span className="whitespace-nowrap">공식 보고서 보기</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Visible on screens smaller than md) */}
        <div className="block md:hidden divide-y divide-zinc-200">
          {filteredDonations.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs font-medium px-4">
              조회된 연도의 기부금 공시 자료가 아직 데이터베이스에 존재하지 않습니다.
            </div>
          ) : (
            filteredDonations.map((item) => {
              const isPending = item.status === 'pending' || item.usageDetails === '자료 준비 중';
              return (
                <div key={item.id} className="p-5 space-y-4 hover:bg-zinc-50/20 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-zinc-900 font-serif whitespace-nowrap">{item.year}년도 공시 내역</span>
                    {isPending ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap">
                        자료 준비 중
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                        공시 완료
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-150 text-xs">
                    <div>
                      <span className="block text-[9px] text-zinc-400 font-bold uppercase whitespace-nowrap">총 모금액</span>
                      <span className="font-bold text-zinc-800 text-[13px] whitespace-nowrap">{item.donationAmount}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-400 font-bold uppercase whitespace-nowrap">지출액 / 사용실적</span>
                      <span className="font-bold text-zinc-800 text-[13px] whitespace-nowrap">{item.usedAmount}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[9px] text-zinc-400 font-bold uppercase whitespace-nowrap">기부금 활용 상세</span>
                    {isPending ? (
                      <p className="text-xs text-amber-700 font-medium leading-relaxed bg-amber-50/40 border border-amber-100 p-2.5 rounded-xl">
                        해당 사업 연도의 기부금 수입 명세와 사용 명세는 차기 회계 연도 3월 중 정식 공시 기간에 맞춰 일괄 공개될 예정입니다.
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-600 font-medium leading-relaxed">{item.usageDetails}</p>
                    )}
                  </div>

                  {!isPending && item.docUrl && (
                    <div className="pt-2 border-t border-zinc-100">
                      <a
                        href={item.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-950 text-white font-bold text-xs py-2.5 rounded-xl transition whitespace-nowrap"
                      >
                        <FileText className="w-4 h-4 text-zinc-300 shrink-0" />
                        <span className="whitespace-nowrap">국세청 공식 공시 서류 확인</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Guide Section */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 md:p-8 space-y-6 mb-16">
        <h4 className="font-serif text-lg font-bold text-zinc-950 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          기부금 영수증 발급 및 공제 혜택 안내
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600 leading-relaxed">
          <div className="space-y-3 bg-white border border-zinc-150 p-5 rounded-2xl">
            <h5 className="font-bold text-zinc-800 text-sm flex items-center gap-1.5">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
              개인 기부자 (소득세 공제)
            </h5>
            <p>
              사단법인 한국치어리딩협회에 기탁하시는 개인 후원금은 소득세법 제34조에 따른 <strong className="text-zinc-800 font-semibold">지정 기부금(공익법인 기부금)</strong> 범주에 해당합니다. 연말정산 시 연간 소득금액의 30% 범위 내에서 15%(1천만 원 초과분 30%)의 세액공제 혜택을 받으실 수 있습니다.
            </p>
          </div>

          <div className="space-y-3 bg-white border border-zinc-150 p-5 rounded-2xl">
            <h5 className="font-bold text-zinc-800 text-sm flex items-center gap-1.5">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
              기업/법인 기부자 (손비 인정)
            </h5>
            <p>
              기업 및 법인 기부자의 기부금은 법인세법 제24조에 의거, 해당 사업연도 소득금액의 10% 범위 내에서 전액 손비(필요경비) 처리가 가능하여 법인세 절감 혜택을 제공받으실 수 있습니다.
            </p>
          </div>
        </div>

        <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-zinc-500">
          <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-zinc-700">기부금 영수증 발급 신청 방법</p>
            <p>
              사무처 전산망을 통해 안전하게 국세청 연말정산 간소화 서비스에 자동 등록을 추진하고 있습니다. 기부 시 주민등록번호(또는 사업자등록번호)를 사무처로 공식 제출해주시기 바라며, 수동 발급이 필요하신 분은 <strong className="text-zinc-800">사무국 접수처(Contact)</strong> 탭을 통해 언제든 문의하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
