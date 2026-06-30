/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { CompetitionPost } from '../types';
import { 
  Search, Calendar, Eye, ShieldAlert, Plus, Trash2, Edit, X, Image, MapPin, Award, ArrowRight, CheckCircle, Upload, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompetitionBoardProps {
  competitions: CompetitionPost[];
  setCompetitions: React.Dispatch<React.SetStateAction<CompetitionPost[]>>;
  isAdminMode: boolean;
  showConfirm?: (title: string, message: string, onConfirm: () => void) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  headerBadge?: string;
  headerTitle?: string;
  headerDesc?: string;
}

export default function CompetitionBoard({ 
  competitions, 
  setCompetitions, 
  isAdminMode, 
  showConfirm, 
  showToast,
  headerBadge = 'KCF TOURNAMENT REGISTRY',
  headerTitle = 'KCF 공식 대회 및 챔피언십 정보',
  headerDesc = '사단법인 한국치어리딩협회가 주관하는 공식 국내대회 및 연대 국제대회 일정 정보입니다.'
}: CompetitionBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'domestic' | 'international'>('all');
  const [selectedPost, setSelectedPost] = useState<CompetitionPost | null>(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<CompetitionPost | null>(null);

  // Drag & drop file upload state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // New post form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'domestic' | 'international'>('domestic');
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCompDate, setNewCompDate] = useState('');

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info') => {
    if (showToast) {
      showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  const saveCompetitions = (updated: CompetitionPost[]) => {
    setCompetitions(updated);
  };

  // Convert File to Base64
  const handleFileProcess = (file: File, callback: (base64: string) => void) => {
    if (!file.type.startsWith('image/')) {
      triggerToast('이미지 파일만 업로드할 수 있습니다.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
      triggerToast('이미지가 성공적으로 첨부되었습니다.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, callback: (base64: string) => void) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file, callback);
    }
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      triggerToast('제목과 내용을 입력해 주세요.', 'error');
      return;
    }

    const newPost: CompetitionPost = {
      id: `comp-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toISOString().split('T')[0],
      views: 1,
      imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
      organizer: newOrganizer.trim() || '사단법인 한국치어리딩협회 (KCF)',
      location: newLocation.trim() || '협회 공식 지정 체육관',
      compDate: newCompDate.trim() || new Date().toISOString().split('T')[0]
    };

    const updated = [newPost, ...competitions];
    saveCompetitions(updated);
    triggerToast('대회 게시글이 성공적으로 등록되었습니다.', 'success');

    // Reset Form
    setNewTitle('');
    setNewCategory('domestic');
    setNewContent('');
    setNewImageUrl('');
    setNewOrganizer('');
    setNewLocation('');
    setNewCompDate('');
    setShowAddModal(false);
  };

  const handleEditPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    if (!showEditModal.title.trim() || !showEditModal.content.trim()) {
      triggerToast('제목과 내용을 입력해 주세요.', 'error');
      return;
    }

    const updated = competitions.map(c => 
      c.id === showEditModal.id ? showEditModal : c
    );
    saveCompetitions(updated);
    triggerToast('대회 게시글이 성공적으로 수정되었습니다.', 'success');
    setShowEditModal(null);
    
    if (selectedPost && selectedPost.id === showEditModal.id) {
      setSelectedPost(showEditModal);
    }
  };

  const handleDeletePost = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const doDelete = () => {
      const updated = competitions.filter(c => c.id !== id);
      saveCompetitions(updated);
      triggerToast('대회 게시글이 성공적으로 삭제되었습니다.', 'success');
      setSelectedPost(null);
    };

    if (showConfirm) {
      showConfirm(
        '대회 정보 게시글 삭제',
        '정말 이 대회 정보 게시글을 완전히 삭제하시겠습니까?',
        doDelete
      );
    } else if (window.confirm('정말 이 대회 정보 게시글을 삭제하시겠습니까?')) {
      doDelete();
    }
  };

  const handleViewPost = (post: CompetitionPost) => {
    setSelectedPost(post);
    // Increment view count
    const updated = competitions.map(c => 
      c.id === post.id ? { ...c, views: c.views + 1 } : c
    );
    saveCompetitions(updated);
  };

  const filteredCompetitions = competitions.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.organizer && c.organizer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="kcf-competition-board" className="bg-white text-zinc-900 rounded-3xl border border-zinc-200/80 p-6 md:p-10 shadow-sm relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center relative z-10">
        <span className="inline-flex items-center gap-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          {headerBadge}
        </span>
        <h3 className="text-3xl md:text-5xl font-serif text-zinc-950 font-black tracking-tight uppercase leading-tight">
          {headerTitle}
        </h3>
        <p className="text-sm text-zinc-500 font-normal mt-4 leading-relaxed">
          {headerDesc}
        </p>
      </div>

      {/* Category Selection Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 border-b border-zinc-100 pb-6 relative z-10">
        <div className="flex bg-zinc-100/80 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: 'all', label: '전체대회' },
            { id: 'domestic', label: '국내대회' },
            { id: 'international', label: '국제대회' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-4.5 py-2 text-xs font-bold rounded-lg transition duration-200 cursor-pointer text-center flex-1 md:flex-initial ${
                selectedCategory === tab.id
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="대회명, 개최 장소 또는 주최사 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white transition"
          />
        </div>
      </div>

      {/* List Layout - Tabular Board with Thumbnails */}
      <div className="relative z-10">
        {filteredCompetitions.length === 0 ? (
          <div className="py-16 text-center bg-zinc-50/50 border border-zinc-150 rounded-2xl">
            <Award className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-xs text-zinc-500 font-semibold">등록된 대회 정보가 존재하지 않습니다.</p>
            <p className="text-[10px] text-zinc-400 mt-1">검색어를 다른 용어로 변경해 보시거나 관리자 로그인 후 신규 대회를 생성해 보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop View */}
            <table className="hidden md:table w-full border-collapse text-left text-xs md:text-sm">
              <thead>
                <tr className="border-t-2 border-b border-zinc-900 text-zinc-800 font-bold bg-zinc-50/70 text-center">
                  <th className="py-4 px-3 w-24 text-center whitespace-nowrap">구분</th>
                  <th className="py-4 px-3 w-28 text-center whitespace-nowrap">포스터</th>
                  <th className="py-4 px-4 text-left whitespace-nowrap">대회명 / 요강</th>
                  <th className="py-4 px-3 w-40 text-center whitespace-nowrap">대회 일시</th>
                  <th className="py-4 px-3 w-36 text-center whitespace-nowrap">개최 장소</th>
                  <th className="py-4 px-3 w-32 text-center whitespace-nowrap">주관</th>
                  <th className="py-4 px-3 w-16 text-center whitespace-nowrap">조회</th>
                  {isAdminMode && <th className="py-4 px-3 w-24 text-center whitespace-nowrap">관리</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCompetitions.map((post) => (
                  <tr
                    id={`comp-row-${post.id}`}
                    key={post.id}
                    onClick={() => handleViewPost(post)}
                    className="border-b border-zinc-150 bg-white hover:bg-zinc-50 transition-colors duration-200 cursor-pointer text-center"
                  >
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span className={`text-[9px] font-black tracking-wide px-2 py-1 rounded uppercase ${
                        post.category === 'domestic'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {post.category === 'domestic' ? '국내대회' : '국제대회'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="w-20 aspect-video rounded-md overflow-hidden bg-zinc-100 border border-zinc-200 mx-auto">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition duration-300 hover:scale-105"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-left">
                      <h4 className="text-sm font-bold text-zinc-950 hover:text-blue-600 hover:underline transition truncate max-w-xs lg:max-w-md font-medium">
                        {post.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-light line-clamp-1 mt-0.5">
                        {post.content}
                      </p>
                    </td>
                    <td className="py-4 px-3 text-center text-xs font-semibold text-zinc-700 font-mono whitespace-nowrap">
                      {post.compDate || post.date}
                    </td>
                    <td className="py-4 px-3 text-center text-xs text-zinc-600 truncate max-w-[120px]">
                      {post.location || '추후 공지'}
                    </td>
                    <td className="py-4 px-3 text-center text-xs text-zinc-500 truncate max-w-[110px]">
                      {post.organizer || 'KCF'}
                    </td>
                    <td className="py-4 px-3 text-center text-xs text-zinc-400 font-mono whitespace-nowrap">
                      {post.views}
                    </td>
                    {isAdminMode && (
                      <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setShowEditModal(post)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                            title="수정"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-zinc-150 border-t border-b border-zinc-200">
              {filteredCompetitions.map((post) => (
                <div
                  id={`comp-mobile-card-${post.id}`}
                  key={post.id}
                  onClick={() => handleViewPost(post)}
                  className="py-4 px-2 bg-white active:bg-zinc-50 transition-colors cursor-pointer flex gap-4"
                >
                  <div className="w-24 shrink-0 aspect-video rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          post.category === 'domestic'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {post.category === 'domestic' ? '국내' : '국제'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono ml-auto">
                          {post.date}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-950 truncate">
                        {post.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                        일정: {post.compDate}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono mt-1">
                      <span>조회수 {post.views}</span>
                      {isAdminMode && (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setShowEditModal(post)}
                            className="px-2 py-0.5 rounded border border-zinc-200 bg-white"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="px-2 py-0.5 rounded border border-zinc-200 bg-white hover:text-red-600"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Overlay Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white text-zinc-900 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-5 right-5 z-20 bg-white/90 border border-zinc-200 text-zinc-800 hover:text-zinc-950 p-2 rounded-full shadow-md hover:scale-105 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative aspect-video w-full bg-zinc-100">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                  <span className={`text-[9px] font-black tracking-widest px-2.5 py-1.5 rounded-md uppercase mb-3 inline-block ${
                    selectedPost.category === 'domestic'
                      ? 'bg-blue-600 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {selectedPost.category === 'domestic' ? '국내 공식 대회' : '국제 가맹 대회'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-snug drop-shadow-sm">
                    {selectedPost.title}
                  </h3>
                </div>
              </div>

              {/* Modal Metadata & Content */}
              <div className="p-6 md:p-8 space-y-6 text-left">
                {/* Meta Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 border border-zinc-150 p-4 rounded-2xl">
                  <div className="space-y-0.5 text-xs">
                    <span className="text-zinc-400 font-semibold text-[10px] uppercase">대회 일시</span>
                    <p className="text-zinc-800 font-bold font-mono">{selectedPost.compDate || '미정'}</p>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <span className="text-zinc-400 font-semibold text-[10px] uppercase">개최 장소</span>
                    <p className="text-zinc-800 font-bold">{selectedPost.location || '추후 공지'}</p>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <span className="text-zinc-400 font-semibold text-[10px] uppercase">주관/주최사</span>
                    <p className="text-zinc-800 font-bold">{selectedPost.organizer || '한국치어리딩협회 (KCF)'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 border-b border-zinc-100 pb-4">
                  <span>작성일: {selectedPost.date}</span>
                  <span className="w-1.5 h-1.5 bg-zinc-200 rounded-full"></span>
                  <span>누적 조회수: {selectedPost.views}회</span>
                </div>

                {/* Main Body Content */}
                <div className="text-zinc-700 text-xs md:text-sm leading-relaxed font-light whitespace-pre-wrap">
                  {selectedPost.content}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-zinc-100">
                  <div className="flex gap-2">
                    {isAdminMode && (
                      <>
                        <button
                          onClick={() => {
                            setShowEditModal(selectedPost);
                            setSelectedPost(null);
                          }}
                          className="flex items-center gap-1.5 bg-zinc-100 text-zinc-800 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-zinc-200 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          수정하기
                        </button>
                        <button
                          onClick={() => handleDeletePost(selectedPost.id)}
                          className="flex items-center gap-1.5 bg-rose-50 text-rose-600 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-rose-100 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          삭제하기
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="bg-zinc-950 text-white font-semibold px-5 py-2.5 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Add Competition Post Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white text-zinc-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-zinc-950">공식 대회 정보 신규 등록</h3>
                  <p className="text-[10px] text-zinc-400 mt-1">국내외 대회 일시와 개최지 및 공식 요강을 기입하여 게시글을 포스팅합니다.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 p-2 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddPost} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-semibold block">대회 카테고리 *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    >
                      <option value="domestic">국내대회 (Domestic)</option>
                      <option value="international">국제대회 (International)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-semibold block">대회 기간 *</label>
                    <input
                      type="text"
                      value={newCompDate}
                      onChange={(e) => setNewCompDate(e.target.value)}
                      required
                      placeholder="예: 2026-09-12 또는 2026-11-27 ~ 11-29"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-semibold block">대회명 (게시글 제목) *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="공식 챔피언십 대회 타이틀을 기입하세요."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-semibold block">주관/주최처 *</label>
                    <input
                      type="text"
                      value={newOrganizer}
                      onChange={(e) => setNewOrganizer(e.target.value)}
                      required
                      placeholder="예: 사단법인 한국치어리딩협회 (KCF)"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-semibold block">개최 장소 *</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      required
                      placeholder="예: 서울 장충체육관"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                {/* Drag-and-drop Photo Upload or URL Paste Input */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-semibold block">대회 이미지 등록 (사진 업로드 / 드래그 앤 드롭) *</label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, setNewImageUrl)}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileProcess(file, setNewImageUrl);
                      }}
                      className="hidden"
                    />
                    
                    {newImageUrl ? (
                      <div className="relative w-40 aspect-video rounded-lg overflow-hidden border border-zinc-200/80">
                        <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewImageUrl('');
                          }}
                          className="absolute top-1 right-1 bg-zinc-950/80 text-white rounded-full p-1 hover:bg-zinc-950 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-zinc-400" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-700">기기에서 이미지 파일을 끌어다 놓거나 클릭하여 선택</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5">PNG, JPG, WEBP 포맷의 이미지 등록 지원 (Base64 변환 저장)</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Image className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="또는 Unsplash, Imgur 등 외부 이미지 URL을 직접 입력하세요."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-semibold block">대회 요강 및 상세 정보 *</label>
                  <textarea
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                    placeholder="참가 신청 기간, 세부 일정, 안전 규정 요약 등 상세 요강을 줄바꿈을 포함하여 자유롭게 입력하세요."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-light resize-none leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-white border border-zinc-200 text-zinc-700 font-semibold px-4.5 py-2.5 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="bg-zinc-950 text-white font-semibold px-5 py-2.5 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer"
                  >
                    대회 등록하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Edit Competition Post Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white text-zinc-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-zinc-950">대회 정보 포스팅 수정</h3>
                  <p className="text-[10px] text-zinc-400 mt-1">기존에 등록된 대회 요강과 기간, 이미지 사양을 재조정합니다.</p>
                </div>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 p-2 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditPostSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-semibold block">대회 카테고리 *</label>
                    <select
                      value={showEditModal.category}
                      onChange={(e) => setShowEditModal({ ...showEditModal, category: e.target.value as any })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    >
                      <option value="domestic">국내대회 (Domestic)</option>
                      <option value="international">국제대회 (International)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-semibold block">대회 기간 *</label>
                    <input
                      type="text"
                      value={showEditModal.compDate || ''}
                      onChange={(e) => setShowEditModal({ ...showEditModal, compDate: e.target.value })}
                      required
                      placeholder="예: 2026-09-12"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-semibold block">대회명 (게시글 제목) *</label>
                  <input
                    type="text"
                    value={showEditModal.title}
                    onChange={(e) => setShowEditModal({ ...showEditModal, title: e.target.value })}
                    required
                    placeholder="공식 챔피언십 대회 타이틀을 기입하세요."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-semibold block">주관/주최처 *</label>
                    <input
                      type="text"
                      value={showEditModal.organizer || ''}
                      onChange={(e) => setShowEditModal({ ...showEditModal, organizer: e.target.value })}
                      required
                      placeholder="예: 사단법인 한국치어리딩협회 (KCF)"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-semibold block">개최 장소 *</label>
                    <input
                      type="text"
                      value={showEditModal.location || ''}
                      onChange={(e) => setShowEditModal({ ...showEditModal, location: e.target.value })}
                      required
                      placeholder="예: 서울 장충체육관"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                {/* Drag-and-drop Image Upload or URL Paste for Edit */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-semibold block">대회 이미지 변경 (사진 업로드 / 드래그 앤 드롭) *</label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, (url) => setShowEditModal({ ...showEditModal, imageUrl: url }))}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300'
                    }`}
                    onClick={() => editFileInputRef.current?.click()}
                  >
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileProcess(file, (url) => setShowEditModal({ ...showEditModal, imageUrl: url }));
                      }}
                      className="hidden"
                    />
                    
                    {showEditModal.imageUrl ? (
                      <div className="relative w-40 aspect-video rounded-lg overflow-hidden border border-zinc-200/80">
                        <img src={showEditModal.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal({ ...showEditModal, imageUrl: '' });
                          }}
                          className="absolute top-1 right-1 bg-zinc-950/80 text-white rounded-full p-1 hover:bg-zinc-950 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-zinc-400" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-700">기기에서 이미지 파일을 끌어다 놓거나 클릭하여 선택</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5">PNG, JPG, WEBP 포맷의 이미지 등록 지원</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Image className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <input
                      type="text"
                      value={showEditModal.imageUrl || ''}
                      onChange={(e) => setShowEditModal({ ...showEditModal, imageUrl: e.target.value })}
                      placeholder="또는 외부 이미지 URL을 직접 입력하세요."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-semibold block">대회 요강 및 상세 정보 *</label>
                  <textarea
                    rows={6}
                    value={showEditModal.content}
                    onChange={(e) => setShowEditModal({ ...showEditModal, content: e.target.value })}
                    required
                    placeholder="참가 신청 기간, 세부 일정 등 상세 내용을 입력하세요."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-light resize-none leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    className="bg-white border border-zinc-200 text-zinc-700 font-semibold px-4.5 py-2.5 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="bg-zinc-950 text-white font-semibold px-5 py-2.5 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    수정 완료
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
