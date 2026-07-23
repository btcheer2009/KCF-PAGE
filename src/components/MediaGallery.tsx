import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaPost } from '../types';
import { 
  Search, Camera, Film, Newspaper, Eye, Calendar, ArrowRight, Play, ExternalLink, Image as ImageIcon
} from 'lucide-react';

interface MediaGalleryProps {
  mediaPosts: MediaPost[];
  initialType?: 'photo' | 'video' | 'press' | 'all';
}

export default function MediaGallery({ mediaPosts, initialType = 'all' }: MediaGalleryProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'video' | 'press'>(initialType);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter posts based on active tab and search term
  const filteredPosts = mediaPosts.filter(post => {
    const matchesTab = activeTab === 'all' || post.type === activeTab;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.pressName && post.pressName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getMediaBadge = (type: MediaPost['type']) => {
    switch (type) {
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

  const handleCardClick = (post: MediaPost) => {
    navigate(`/media/${post.type}/${post.id}`);
  };

  return (
    <div className="bg-zinc-50/50 min-h-screen py-10 md:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] tracking-wider px-3.5 py-1.5 rounded-full uppercase">
            <Film className="w-3.5 h-3.5" />
            <span>KCF MEDIA CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-950 tracking-tight font-serif">
            협회 미디어 & 보도 자료
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
            대한민국 치어리딩 생생한 현장 포토, 영상 스케치, 주요 보도자료를 만나보세요.
          </p>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'all'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              전체 보기
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'photo'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>포토갤러리</span>
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>비디오</span>
            </button>
            <button
              onClick={() => setActiveTab('press')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'press'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>보도자료</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="제목, 내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          </div>
        </div>

        {/* Media Grid Cards */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-3">
            <p className="text-base font-bold text-zinc-800">등록된 미디어 자료가 없습니다.</p>
            <p className="text-xs text-zinc-500">다른 검색어를 입력하시거나 카테고리를 변경해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const badge = getMediaBadge(post.type);
              const BadgeIcon = badge.icon;
              const coverImg = post.coverImage || post.thumbnail || (post.images && post.images[0]);

              return (
                <article
                  key={post.id}
                  onClick={() => handleCardClick(post)}
                  className="group bg-white rounded-3xl border border-zinc-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Thumbnail Image Container */}
                    <div className="relative aspect-video w-full bg-zinc-100 overflow-hidden">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                          <BadgeIcon className="w-10 h-10 opacity-40" />
                        </div>
                      )}

                      {/* Video Play Overlay Badge */}
                      {post.type === 'video' && (
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/35 transition">
                          <div className="w-12 h-12 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          </div>
                        </div>
                      )}

                      {/* Type Badge Top Left */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 sm:p-6 space-y-2.5">
                      {post.type === 'press' && post.pressName && (
                        <span className="text-[11px] font-extrabold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md inline-block">
                          {post.pressName}
                        </span>
                      )}

                      <h3 className="text-base font-bold text-zinc-950 font-serif line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                        {post.title}
                      </h3>

                      {(post.summary || post.content || post.videoDescription) && (
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {post.summary || post.content || post.videoDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500 group-hover:text-blue-600 font-bold transition">
                      <span>자세히 보기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
