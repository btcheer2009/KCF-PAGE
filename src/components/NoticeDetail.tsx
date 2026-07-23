import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Notice } from '../types';
import { 
  ArrowLeft, Calendar, Eye, Megaphone, Share2, ChevronLeft, ChevronRight, Image as ImageIcon, X, ZoomIn, Check, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getItem } from '../lib/db';

interface NoticeDetailProps {
  notices: Notice[];
  setNotices: React.Dispatch<React.SetStateAction<Notice[]>>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function NoticeDetail({ notices, setNotices, showToast }: NoticeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fetchedNotice, setFetchedNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Find notice in current list or fetched doc
  const noticeInProps = notices.find(n => String(n.id) === String(id));
  const notice = noticeInProps || fetchedNotice;

  const noticeIndex = notices.findIndex(n => String(n.id) === String(id));
  const prevNotice = noticeIndex > 0 ? notices[noticeIndex - 1] : null;
  const nextNotice = noticeIndex !== -1 && noticeIndex < notices.length - 1 ? notices[noticeIndex + 1] : null;

  // Direct fetch by URL ID if not yet in state
  useEffect(() => {
    let isMounted = true;

    const resolveNotice = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      // 1. If found in notices list
      const inList = notices.find(n => String(n.id) === String(id));
      if (inList) {
        if (isMounted) {
          setFetchedNotice(inList);
          setIsLoading(false);
        }
        return;
      }

      // 2. Fetch directly from persistent storage
      try {
        const single = await getItem<Notice>('notices', id);
        if (isMounted) {
          if (single) {
            setFetchedNotice(single);
            setNotices(prev => {
              if (prev.some(n => String(n.id) === String(id))) return prev;
              return [...prev, single];
            });
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch notice directly:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    resolveNotice();

    return () => {
      isMounted = false;
    };
  }, [id, notices]);

  // Increment view count on mount / id change
  useEffect(() => {
    if (notice) {
      const updated = notices.map(n => 
        String(n.id) === String(notice.id) ? { ...n, views: (n.views || 0) + 1 } : n
      );
      setNotices(updated);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, notice?.id]);

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
      case 'selection': return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'education': return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      case 'competition': return 'bg-red-50 text-red-600 border border-red-200';
      case 'admin': return 'bg-purple-50 text-purple-600 border border-purple-200';
      default: return 'bg-zinc-100 text-zinc-700 border border-zinc-200';
    }
  };

  // Extract attached images array
  const noticeImages = notice?.images && notice.images.length > 0 
    ? notice.images 
    : (notice?.imageUrls && notice.imageUrls.length > 0 
        ? notice.imageUrls 
        : (notice?.imageUrl ? [notice.imageUrl] : []));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      if (showToast) showToast('게시글 주소가 클립보드에 복사되었습니다.', 'success');
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Copy link failed:', err);
    });
  };

  if (isLoading && !notice) {
    return (
      <div className="min-h-[65vh] max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-blue-600 animate-spin">
          <RefreshCw className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm font-bold text-zinc-700">공지사항 게시물을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-[65vh] max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4 text-zinc-400">
          <Megaphone className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 mb-2">존재하지 않거나 삭제된 게시물입니다.</h2>
        <p className="text-xs sm:text-sm text-zinc-500 mb-8 max-w-md">
          요청하신 공지사항이 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
        <button
          onClick={() => navigate('/notice')}
          className="bg-zinc-900 text-white font-semibold text-xs px-6 py-3 rounded-full hover:bg-zinc-800 transition shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          공지사항 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50/50 min-h-screen py-10 md:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/notice')}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 px-4 py-2 rounded-full shadow-xs hover:shadow-sm transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </button>
          
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 px-3.5 py-2 rounded-full shadow-xs hover:bg-zinc-50 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{copied ? '복사완료' : '공유하기'}</span>
          </button>
        </div>

        {/* Notice Article Card */}
        <article className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm p-6 sm:p-10 md:p-12 overflow-hidden">
          {/* Article Header */}
          <header className="space-y-4 pb-6 md:pb-8 border-b border-zinc-200/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${getCategoryColor(notice.category)}`}>
                {getCategoryLabel(notice.category)}
              </span>
              {notice.isImportant && (
                <span className="bg-red-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                  중요 공지
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 font-serif leading-snug tracking-tight">
              {notice.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-500 font-medium pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                등록일: {notice.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-zinc-400" />
                조회수: {notice.views + 1}
              </span>
              <span className="text-zinc-400 font-medium">사단법인 한국치어리딩협회 (KCF)</span>
            </div>
          </header>

          {/* Article Text Content */}
          <div className="py-8 md:py-12 text-zinc-800 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-wrap tracking-normal">
            {notice.content}
          </div>

          {/* Attached Images Gallery */}
          {noticeImages.length > 0 && (
            <div className="pt-8 pb-4 border-t border-zinc-150 space-y-5">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <ImageIcon className="w-4.5 h-4.5 text-blue-600" />
                <span>첨부 이미지 ({noticeImages.length}장)</span>
                <span className="text-xs font-normal text-zinc-400">(사진을 클릭하면 크게 보실 수 있습니다)</span>
              </div>

              <div className="flex flex-col gap-5 sm:gap-6">
                {noticeImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveLightboxImage(imgUrl)}
                    className="group relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50/50 cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 w-full flex justify-center items-center"
                  >
                    <img
                      src={imgUrl}
                      alt={`공지 이미지 ${idx + 1}`}
                      className="w-full h-auto max-w-full object-contain rounded-2xl group-hover:scale-[1.008] transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-zinc-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 rounded-2xl">
                      <ZoomIn className="w-4 h-4" />
                      <span>원본 확대보기</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Article Footer & Navigation */}
          <footer className="pt-8 border-t border-zinc-200/80 mt-8 space-y-6">
            {/* Previous & Next Post Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prevNotice ? (
                <button
                  onClick={() => navigate(`/board/${prevNotice.id}`)}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/80 transition text-left group cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">이전글</span>
                    <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-blue-600 transition">
                      {prevNotice.title}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/30 text-zinc-400 text-xs italic">
                  이전글이 없습니다.
                </div>
              )}

              {nextNotice ? (
                <button
                  onClick={() => navigate(`/board/${nextNotice.id}`)}
                  className="flex items-center justify-end gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/80 transition text-right group cursor-pointer"
                >
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">다음글</span>
                    <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-blue-600 transition">
                      {nextNotice.title}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 shrink-0" />
                </button>
              ) : (
                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/30 text-zinc-400 text-xs italic text-right">
                  다음글이 없습니다.
                </div>
              )}
            </div>

            {/* Back to List Action Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => navigate('/notice')}
                className="inline-flex items-center gap-2 bg-zinc-950 text-white font-bold text-xs px-8 py-3.5 rounded-full hover:bg-zinc-800 transition shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                공지사항 목록으로
              </button>
            </div>
          </footer>
        </article>
      </div>

      {/* Lightbox Zoom Modal */}
      <AnimatePresence>
        {activeLightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setActiveLightboxImage(null)}
                className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition cursor-pointer"
                title="닫기"
              >
                <X className="w-6 h-6" />
              </button>

              <img
                src={activeLightboxImage}
                alt="확대 이미지"
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />

              <div className="mt-4 flex items-center gap-3">
                <a
                  href={activeLightboxImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 text-white text-xs px-4 py-2 rounded-full font-medium transition"
                >
                  새 탭에서 원본 크게 보기 ↗
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
