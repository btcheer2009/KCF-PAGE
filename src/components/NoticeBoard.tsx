/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notice } from '../types';
import { 
  Search, Megaphone, Eye, Image as ImageIcon
} from 'lucide-react';

interface NoticeBoardProps {
  notices: Notice[];
  setNotices: React.Dispatch<React.SetStateAction<Notice[]>>;
  isAdminMode: boolean;
  setIsAdminMode: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirm?: (title: string, message: string, onConfirm: () => void) => void;
  headerBadge?: string;
  headerTitle?: string;
  headerDesc?: string;
}

export default function NoticeBoard({ 
  notices, 
  headerBadge = 'KCF NOTICE BOARD',
  headerTitle = 'KCF 공식 새소식 & 알림마당',
  headerDesc = '대한민국 치어리딩의 주요 소식, 일정 및 행정 사항을 가장 빠르고 정확하게 전달합니다.'
}: NoticeBoardProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleViewNotice = (notice: Notice) => {
    navigate(`/board/${notice.id}`);
  };

  // Filter logic
  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: Notice['category']) => {
    switch (category) {
      case 'competition': return '대회 소식';
      case 'education': return '지도자 교육';
      case 'selection': return '국가대표 선발';
      case 'admin': return '협회 행정';
      default: return '일반 공지';
    }
  };

  const getCategoryColor = (category: Notice['category']) => {
    switch (category) {
      case 'selection': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'education': return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'competition': return 'bg-red-50 text-red-500 border border-red-100';
      case 'admin': return 'bg-purple-50 text-purple-600 border border-purple-100';
      default: return 'bg-zinc-50 text-zinc-600 border border-zinc-200/60';
    }
  };

  return (
    <div id="kcf-noticeboard-section" className="bg-white text-zinc-900 rounded-3xl border border-zinc-200/80 p-6 md:p-10 shadow-sm relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center relative z-10">
        <span className="inline-flex items-center gap-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          <Megaphone className="w-3.5 h-3.5 text-amber-400" />
          {headerBadge}
        </span>
        <h3 className="text-3xl md:text-5xl font-serif text-zinc-950 font-black tracking-tight uppercase leading-tight">
          {headerTitle}
        </h3>
        <p className="text-sm text-zinc-500 font-normal mt-4 leading-relaxed">
          {headerDesc}
        </p>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60 relative z-10">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 rounded-xl">
          {['all', 'selection', 'competition', 'education', 'admin', 'general'].map((cat) => (
            <button
              id={`tab-notice-${cat}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs tracking-wide transition-all duration-350 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
              }`}
            >
              {cat === 'all' ? '전체 보기' : getCategoryLabel(cat as Notice['category'])}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            id="search-notice-input"
            type="text"
            placeholder="공지사항 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white border border-slate-300 rounded-xl py-2 pl-9 pr-4 text-xs font-light text-slate-800 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-100 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Notice List */}
      <div className="relative z-10">
        {filteredNotices.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-light">조건에 부합하는 공지사항이 존재하지 않습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="hidden md:table w-full border-collapse text-left text-xs md:text-sm">
              <thead>
                <tr className="border-t-2 border-b border-zinc-900 text-zinc-800 font-bold bg-zinc-50/70 text-center">
                  <th className="py-4 px-4 w-16 text-center">번호</th>
                  <th className="py-4 px-3 w-32 text-center">구분</th>
                  <th className="py-4 px-4 text-left">제목</th>
                  <th className="py-4 px-3 w-28 text-center">등록일</th>
                  <th className="py-4 px-3 w-20 text-center">조회수</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotices.map((notice, idx) => {
                  const isImportant = notice.isImportant;
                  return (
                    <tr
                      id={`notice-row-${notice.id}`}
                      key={notice.id}
                      onClick={() => handleViewNotice(notice)}
                      className={`border-b border-zinc-150 transition-colors duration-200 cursor-pointer ${
                        isImportant 
                          ? 'bg-rose-50/40 hover:bg-rose-50/70 font-semibold' 
                          : 'bg-white hover:bg-zinc-50'
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        {isImportant ? (
                          <span className="inline-flex items-center justify-center bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                            공지
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-mono">
                            {filteredNotices.length - idx}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(notice.category)}`}>
                          {getCategoryLabel(notice.category)}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-normal text-zinc-950 text-left">
                        <div className="flex items-center gap-2">
                          <span className="hover:underline hover:text-blue-600 transition truncate max-w-[320px] lg:max-w-md block font-medium">
                            {notice.title}
                          </span>
                          {notice.isImportant && (
                            <span className="text-red-500 text-[10px] shrink-0 font-bold">[중요]</span>
                          )}
                          {((notice.images && notice.images.length > 0) || (notice.imageUrls && notice.imageUrls.length > 0) || notice.imageUrl) && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono border border-blue-100 shrink-0">
                              <ImageIcon className="w-3 h-3" />
                              {(notice.images?.length || notice.imageUrls?.length || 1)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-light line-clamp-1 mt-0.5">
                          {notice.content}
                        </p>
                      </td>
                      <td className="py-4 px-3 text-center font-mono text-zinc-500 text-xs">
                        {notice.date}
                      </td>
                      <td className="py-4 px-3 text-center font-mono text-zinc-500 text-xs">
                        {notice.views}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile View - Beautiful List Rows */}
            <div className="md:hidden divide-y divide-zinc-150 border-t border-b border-zinc-200">
              {filteredNotices.map((notice) => (
                <div
                  id={`notice-mobile-card-${notice.id}`}
                  key={notice.id}
                  onClick={() => handleViewNotice(notice)}
                  className={`py-4 px-2 transition-colors cursor-pointer ${
                    notice.isImportant 
                      ? 'bg-rose-50/30' 
                      : 'bg-white active:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {notice.isImportant && (
                      <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        중요
                      </span>
                    )}
                    <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${getCategoryColor(notice.category)}`}>
                      {getCategoryLabel(notice.category)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono ml-auto">
                      {notice.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-950 mb-1 active:text-blue-600 truncate">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-zinc-500 font-light line-clamp-1 mb-2">
                    {notice.content}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-zinc-300" />
                      조회수 {notice.views}
                    </span>
                    {((notice.images && notice.images.length > 0) || (notice.imageUrls && notice.imageUrls.length > 0) || notice.imageUrl) && (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <ImageIcon className="w-3 h-3" />
                        사진 {(notice.images?.length || notice.imageUrls?.length || 1)}장
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
