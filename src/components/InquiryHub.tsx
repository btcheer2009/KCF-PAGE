/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InquirySubmission, AssociationInfo } from '../types';
import { 
  Send, Mail, Phone, MapPin, MessageSquare, ClipboardList, CheckCircle, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InquiryHubProps {
  inquiries: InquirySubmission[];
  setInquiries: React.Dispatch<React.SetStateAction<InquirySubmission[]>>;
  showConfirm?: (title: string, message: string, onConfirm: () => void) => void;
  associationInfo?: AssociationInfo;
  headerBadge?: string;
  headerTitle?: string;
  headerDesc?: string;
}

export default function InquiryHub({ 
  inquiries, 
  setInquiries, 
  showConfirm, 
  associationInfo,
  headerBadge = 'KCF INQUIRY HUB',
  headerTitle = 'KCF 소통 및 문의 허브',
  headerDesc = '협회 등록 문의, 가입 심사, 연수 안내 등 모든 공식 질의사항을 신속하게 답변해 드립니다.'
}: InquiryHubProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<InquirySubmission['type']>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [showToast, setShowToast] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !email.trim() || !subject.trim() || !message.trim()) return;

    const newInquiry: InquirySubmission = {
      id: `inq-${Date.now()}`,
      name,
      contact,
      email,
      type,
      subject,
      message,
      date: new Date().toISOString().split('T')[0],
      status: 'received',
    };

    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);

    // Reset Form
    setName('');
    setContact('');
    setEmail('');
    setType('general');
    setSubject('');
    setMessage('');

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleClearHistory = () => {
    const doClear = () => {
      setInquiries([]);
    };

    if (showConfirm) {
      showConfirm(
        '이력 초기화',
        '문의 이력을 모두 초기화하시겠습니까?',
        doClear
      );
    } else if (window.confirm('문의 이력을 모두 초기화하시겠습니까?')) {
      doClear();
    }
  };

  const getTypeLabel = (t: InquirySubmission['type']) => {
    switch (t) {
      case 'competition': return '대회 참가 신청';
      case 'coaching': return '지도자 교육/연수';
      case 'team_reg': return '가입 및 연동 문의';
      default: return '일반/제휴 제안';
    }
  };

  const getStatusBadge = (status: InquirySubmission['status']) => {
    switch (status) {
      case 'replied': 
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">답변 완료</span>;
      case 'in_progress':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold font-sans">검토 대기</span>;
      default:
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-semibold">접수 완료</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          {headerBadge}
        </span>
        <h3 className="text-3xl md:text-5xl font-serif text-zinc-950 font-black tracking-tight uppercase leading-tight">
          {headerTitle}
        </h3>
        <p className="text-sm text-zinc-500 font-normal mt-4 leading-relaxed">
          {headerDesc}
        </p>
      </div>

      <div id="kcf-inquiry-hub" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch text-zinc-900">
      
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            id="toast-inquiry-success"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-10 right-10 z-50 bg-white border border-zinc-200 text-zinc-950 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl max-w-sm"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-600">사무국 전송 완료</p>
              <p className="text-[11px] text-zinc-500 font-light mt-0.5">접수된 문의는 24시간 내에 기재하신 이메일로 회신해 드립니다.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side: Form submission */}
      <div className="lg:col-span-7 bg-white border border-zinc-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Direct Channel</span>
          </div>

          <h4 className="text-2xl font-serif text-zinc-950 font-black tracking-tight mb-2 uppercase">통합 문의 및 <span className="text-blue-600">접수 창구</span></h4>
          <p className="text-xs text-zinc-400 font-light mb-8 leading-relaxed">
            대회 참가 관련 문의, 팀 공식 가입 서류 보충, 연수 세미나 협의 등 문의사항을 남겨주시면 KCF 사무처장이 직접 검토 후 24시간 이내 연락해 드립니다.
          </p>

          <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-600 mb-1.5">이름 / 단체 담당자</label>
                <input
                  id="inq-name"
                  type="text"
                  required
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-800 font-normal focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-100 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1.5">연락처</label>
                <input
                  id="inq-contact"
                  type="text"
                  required
                  placeholder="010-1234-5678"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-800 font-normal focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-100 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1.5">이메일 주소</label>
                <input
                  id="inq-email"
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-800 font-normal focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-100 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-zinc-600 mb-1.5">문의 유형</label>
                <select
                  id="inq-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as InquirySubmission['type'])}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-800 focus:outline-none focus:border-zinc-900 shadow-sm"
                >
                  <option value="general">일반/제휴 제안</option>
                  <option value="competition">대회 참가 신청</option>
                  <option value="coaching">지도자 교육/연수</option>
                  <option value="team_reg">가입 및 연동 문의</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-600 mb-1.5">제목</label>
                <input
                  id="inq-subject"
                  type="text"
                  required
                  placeholder="문의 한 줄 요약을 입력해 주세요."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-800 font-normal focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-100 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 mb-1.5">세부 사유 및 문의 본문</label>
              <textarea
                id="inq-message"
                required
                rows={5}
                placeholder="세부적인 문의 상황과 회신받으실 적합한 수단 또는 용건을 기재해 주세요."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-800 font-normal focus:outline-none focus:border-zinc-900 resize-none focus:ring-1 focus:ring-zinc-100 shadow-sm"
              />
            </div>

            <button
              id="submit-inquiry-btn"
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold p-3.5 rounded-xl flex items-center justify-center gap-2 transition duration-300 cursor-pointer text-xs mt-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              온라인 사무국에 문의 접수하기
            </button>
          </form>
        </div>
      </div>

      {/* Right side: Central Office Contact Information */}
      <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200/60 p-6 md:p-8 rounded-3xl flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-zinc-600" />
            <h5 className="text-base font-bold text-zinc-950">공식 협조 요청 안내</h5>
          </div>

          <div className="space-y-4 text-xs text-zinc-600 leading-relaxed font-light bg-white border border-zinc-200 p-5 rounded-2xl">
            <p className="font-semibold text-zinc-800">
              📌 KCF 온라인 사무국 접수 안내
            </p>
            <p>
              제출하신 민원 및 상담 접수 내역은 실시간 대외협력 위원회 및 사무국 전산망에 안전하게 등록됩니다.
            </p>
            <p>
              등록된 이력 및 상세 진행 상태는 보안 강화를 위해 <span className="font-semibold text-blue-600">관리자 계정</span>으로만 열람이 가능합니다. 검토 및 답변 처리는 영업일 기준 24시간 내에 완료됩니다.
            </p>
          </div>
        </div>

        {/* Association Office Meta info */}
        <div className="mt-8 border-t border-zinc-200 pt-6 space-y-4">
          <h6 className="text-xs font-bold text-zinc-950">
            {associationInfo?.officeName || 'KCF 서울 중앙 사무국'}
          </h6>
          
          <div className="space-y-3.5 text-xs text-zinc-500 font-normal">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                {associationInfo?.address || '서울특별시 송파구 올림픽로 424 올림픽공원 한라관 203호'}
              </span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>
                대표전화: {associationInfo?.phone || '02-421-8890'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>
                이메일: {associationInfo?.email || 'kcf_office@cheerleading.or.kr'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
    </div>
  );
}
