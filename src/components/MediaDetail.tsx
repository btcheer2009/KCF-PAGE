import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MediaPost } from '../types';
import { 
  ArrowLeft, Calendar, Eye, Share2, ChevronLeft, ChevronRight, Image as ImageIcon,
  X, ZoomIn, Check, Film, Newspaper, Camera, ExternalLink, Download, Play, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getItem } from '../lib/db';

interface MediaDetailProps {
  mediaPosts: MediaPost[];
  setMediaPosts: React.Dispatch<React.SetStateAction<MediaPost[]>>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function MediaDetail({ mediaPosts, setMediaPosts, showToast }: MediaDetailProps) {
  const { id, type } = useParams<{ id: string; type?: string }>();
  const navigate = useNavigate();

  const [fetchedPost, setFetchedPost] = useState<MediaPost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Find media post from props or fetched single doc
  const postInProps = mediaPosts.find(p => String(p.id) === String(id));
  const post = postInProps || fetchedPost;

  // Filter same category for Prev / Next navigation
  const sameCategoryPosts = mediaPosts.filter(p => !post || p.type === post.type);
  const categoryIndex = sameCategoryPosts.findIndex(p => String(p.id) === String(id));
  const prevPost = categoryIndex > 0 ? sameCategoryPosts[categoryIndex - 1] : null;
  const nextPost = categoryIndex !== -1 && categoryIndex < sameCategoryPosts.length - 1 ? sameCategoryPosts[categoryIndex + 1] : null;

  // Direct fetch by URL ID if not yet in state
  useEffect(() => {
    let isMounted = true;

    const resolvePost = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      // 1. If found in mediaPosts list
      const inList = mediaPosts.find(p => String(p.id) === String(id));
      if (inList) {
        if (isMounted) {
          setFetchedPost(inList);
          setIsLoading(false);
        }
        return;
      }

      // 2. Fetch directly from persistent storage (Firestore)
      try {
        const single = await getItem<MediaPost>('media_posts', id);
        if (isMounted) {
          if (single) {
            setFetchedPost(single);
            setMediaPosts(prev => {
              if (prev.some(p => String(p.id) === String(id))) return prev;
              return [...prev, single];
            });
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch media post directly from storage:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    resolvePost();

    return () => {
      isMounted = false;
    };
  }, [id, mediaPosts]);

  // Increment view count on mount / id change
  useEffect(() => {
    if (post) {
      const updated = mediaPosts.map(p => 
        String(p.id) === String(post.id) ? { ...p, views: (p.views || 0) + 1 } : p
      );
      setMediaPosts(updated);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, post?.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      if (showToast) showToast('게시글 주소가 클립보드에 복사되었습니다.', 'success');
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Copy link failed:', err);
    });
  };

  // Helper to parse Video Embed URLs safely
  const getEmbedVideoUrl = (url?: string, videoType?: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // YouTube
    if (cleanUrl.includes('youtube.com/watch') || cleanUrl.includes('youtu.be/')) {
      let videoId = '';
      if (cleanUrl.includes('youtu.be/')) {
        videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (cleanUrl.includes('v=')) {
        videoId = cleanUrl.split('v=')[1]?.split('&')[0] || '';
      }
      if (videoId) {
        return { isIframe: true, src: `https://www.youtube.com/embed/${videoId}?rel=0` };
      }
    }

    // YouTube Shorts or Embed directly
    if (cleanUrl.includes('youtube.com/embed/') || cleanUrl.includes('youtube.com/shorts/')) {
      const parts = cleanUrl.split('/shorts/');
      if (parts[1]) {
        return { isIframe: true, src: `https://www.youtube.com/embed/${parts[1].split('?')[0]}` };
      }
      return { isIframe: true, src: cleanUrl };
    }

    // Vimeo
    if (cleanUrl.includes('vimeo.com/')) {
      const vimeoId = cleanUrl.split('vimeo.com/')[1]?.split('?')[0] || '';
      if (vimeoId) {
        return { isIframe: true, src: `https://player.vimeo.com/video/${vimeoId}` };
      }
    }

    // Direct MP4 or Cloudinary Video or default video tag
    return { isIframe: false, src: cleanUrl };
  };

  const getMediaBadge = (postType: MediaPost['type']) => {
    switch (postType) {
      case 'photo':
        return { label: '포토갤러리', icon: Camera, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'video':
        return { label: '비디오', icon: Film, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'press':
        return { label: '보도자료', icon: Newspaper, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: '미디어', icon: ImageIcon, color: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
    }
  };

  if (isLoading && !post) {
    return (
      <div className="min-h-[65vh] max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-blue-600 animate-spin">
          <RefreshCw className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm font-bold text-zinc-700">미디어 게시물을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[65vh] max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4 text-zinc-400">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 mb-2">존재하지 않거나 삭제된 미디어 게시물입니다.</h2>
        <p className="text-xs sm:text-sm text-zinc-500 mb-8 max-w-md">
          요청하신 미디어 자료가 존재하지 않거나 관리자에 의해 삭제되었을 수 있습니다.
        </p>
        <button
          onClick={() => navigate('/media')}
          className="bg-zinc-900 text-white font-semibold text-xs px-6 py-3 rounded-full hover:bg-zinc-800 transition shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          미디어 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const badge = getMediaBadge(post.type);
  const BadgeIcon = badge.icon;

  // Attached images list
  const photoImages = post.images && post.images.length > 0
    ? post.images
    : (post.coverImage ? [post.coverImage] : []);

  // Video embeds list
  const videoList = post.videoUrls && post.videoUrls.length > 0
    ? post.videoUrls
    : (post.videoUrl ? [post.videoUrl] : []);

  return (
    <div className="bg-zinc-50/50 min-h-screen py-10 md:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/media/${post.type}`)}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 px-4 py-2 rounded-full shadow-xs hover:shadow-sm transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{badge.label} 목록으로</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 px-3.5 py-2 rounded-full shadow-xs hover:bg-zinc-50 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{copied ? '복사완료' : '공유하기'}</span>
          </button>
        </div>

        {/* Article Container */}
        <article className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm p-6 sm:p-10 md:p-12 overflow-hidden">
          
          {/* Header */}
          <header className="space-y-4 pb-6 md:pb-8 border-b border-zinc-200/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}>
                <BadgeIcon className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                {badge.label}
              </span>
              {post.pressName && (
                <span className="bg-purple-100 text-purple-800 text-xs font-extrabold px-3 py-1 rounded-full border border-purple-200">
                  {post.pressName}
                </span>
              )}
              {post.isImportant && (
                <span className="bg-red-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                  주요 공지
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 font-serif leading-snug tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-500 font-medium pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                등록일: {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-zinc-400" />
                조회수: {post.views + 1}
              </span>
              <span className="text-zinc-400 font-medium">사단법인 한국치어리딩협회 (KCF)</span>
            </div>
          </header>

          {/* Body Description Text */}
          {(post.summary || post.content || post.videoDescription) && (
            <div className="py-6 md:py-8 text-zinc-800 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-wrap">
              {post.summary && (
                <div className="bg-zinc-50 border-l-4 border-blue-600 p-4 rounded-r-2xl text-zinc-700 font-medium text-xs sm:text-sm mb-6">
                  {post.summary}
                </div>
              )}
              {post.content || post.videoDescription}
            </div>
          )}

          {/* 1. PHOTO GALLERY SECTION (Vertical Stack, Natural Aspect Ratio, No Crop) */}
          {post.type === 'photo' && photoImages.length > 0 && (
            <div className="py-8 border-t border-zinc-150 space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <Camera className="w-4.5 h-4.5 text-emerald-600" />
                <span>현장 포토 갤러리 ({photoImages.length}장)</span>
                <span className="text-xs font-normal text-zinc-400">(사진을 클릭하시면 큰 화면으로 감상할 수 있습니다)</span>
              </div>

              {/* Vertical 1-column image stack with natural aspect ratios */}
              <div className="flex flex-col gap-6">
                {photoImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveLightboxImage(imgUrl)}
                    className="group relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50/50 cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 w-full flex justify-center items-center"
                  >
                    <img
                      src={imgUrl}
                      alt={`${post.title} 사진 ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-auto max-w-full object-contain rounded-2xl group-hover:scale-[1.008] transition duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800';
                      }}
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

          {/* 2. VIDEO SECTION (Responsive 16:9 Player, Safe Overflow, Object Contain) */}
          {post.type === 'video' && (
            <div className="py-8 border-t border-zinc-150 space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <Film className="w-4.5 h-4.5 text-blue-600" />
                <span>영상 플레이어</span>
              </div>

              {videoList.length === 0 ? (
                <div className="bg-zinc-100 rounded-2xl p-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-zinc-400" />
                  <span>등록된 영상 URL이 없습니다.</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {videoList.map((vUrl, vIdx) => {
                    const embedInfo = getEmbedVideoUrl(vUrl, post.videoType);

                    if (!embedInfo) {
                      return (
                        <div key={vIdx} className="bg-zinc-100 rounded-2xl p-6 text-center text-zinc-500 text-xs">
                          유효하지 않은 영상 주소입니다: {vUrl}
                        </div>
                      );
                    }

                    return (
                      <div key={vIdx} className="space-y-2">
                        {/* 16:9 Video Player Container */}
                        <div className="relative w-full max-w-[1000px] mx-auto aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                          {embedInfo.isIframe ? (
                            <iframe
                              src={embedInfo.src}
                              title={`${post.title} 영상 ${vIdx + 1}`}
                              className="w-full h-full border-0 object-contain"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={embedInfo.src}
                              controls
                              playsInline
                              preload="metadata"
                              poster={post.thumbnail}
                              className="w-full h-full object-contain"
                            >
                              <source src={embedInfo.src} />
                              영상을 재생할 수 없는 브라우저 환경입니다.
                            </video>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. PRESS RELEASE SECTION (Press logo, original article link, attachments) */}
          {post.type === 'press' && (
            <div className="py-8 border-t border-zinc-150 space-y-6">
              {post.coverImage && (
                <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 max-w-2xl mx-auto">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-auto max-w-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 bg-purple-50/70 border border-purple-200/80 p-5 rounded-2xl">
                <div>
                  <span className="text-[11px] text-purple-600 font-bold uppercase tracking-wider block">원문 보도 언론사</span>
                  <p className="text-sm font-extrabold text-purple-950">{post.pressName || '언론사 보도자료'}</p>
                </div>

                {post.originalUrl && (
                  <a
                    href={post.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xs transition cursor-pointer"
                  >
                    <span>원문 기사 전체보기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {post.attachmentUrl && (
                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-zinc-700">첨부 보도 자료문</span>
                  <a
                    href={post.attachmentUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>다운로드</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Footer & Navigation */}
          <footer className="pt-8 border-t border-zinc-200/80 mt-8 space-y-6">
            {/* Prev & Next Posts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prevPost ? (
                <button
                  onClick={() => navigate(`/media/${prevPost.type}/${prevPost.id}`)}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/80 transition text-left group cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">이전 게시글</span>
                    <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-blue-600 transition">
                      {prevPost.title}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/30 text-zinc-400 text-xs italic">
                  이전 게시글이 없습니다.
                </div>
              )}

              {nextPost ? (
                <button
                  onClick={() => navigate(`/media/${nextPost.type}/${nextPost.id}`)}
                  className="flex items-center justify-end gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/80 transition text-right group cursor-pointer"
                >
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">다음 게시글</span>
                    <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-blue-600 transition">
                      {nextPost.title}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 shrink-0" />
                </button>
              ) : (
                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/30 text-zinc-400 text-xs italic text-right">
                  다음 게시글이 없습니다.
                </div>
              )}
            </div>

            {/* Back button */}
            <div className="text-center pt-4">
              <button
                onClick={() => navigate(`/media/${post.type}`)}
                className="inline-flex items-center gap-2 bg-zinc-950 text-white font-bold text-xs px-8 py-3.5 rounded-full hover:bg-zinc-800 transition shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                미디어 목록으로
              </button>
            </div>
          </footer>
        </article>
      </div>

      {/* Lightbox Modal */}
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
