import React, { useState } from 'react';
import { MediaPost } from '../types';
import { 
  Plus, Trash2, Edit, Upload, X, Film, Camera, Newspaper, ImageIcon, ExternalLink, Link as LinkIcon, Check, FileText, Search, Eye, EyeOff, Play, AlertCircle, RefreshCw, Layers, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToCloudinary, deleteFromCloudinary } from '../lib/cloudinary';
import { saveItem, deleteItem } from '../lib/db';

interface AdminMediaManagerProps {
  mediaPosts: MediaPost[];
  setMediaPosts: React.Dispatch<React.SetStateAction<MediaPost[]>>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  uploadFileToStorage: (pathStr: string, file: File) => Promise<string>;
}

export default function AdminMediaManager({
  mediaPosts,
  setMediaPosts,
  showToast,
  showConfirm,
  uploadFileToStorage
}: AdminMediaManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<MediaPost | null>(null);
  const [previewingPost, setPreviewingPost] = useState<MediaPost | null>(null);

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'photo' | 'video' | 'press'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'private'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Field States
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'press'>('photo');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isImportant, setIsImportant] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [coverImage, setCoverImage] = useState('');
  const [coverImagePublicId, setCoverImagePublicId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailPublicId, setThumbnailPublicId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPublicId, setVideoPublicId] = useState('');
  const [videoType, setVideoType] = useState<'youtube' | 'vimeo' | 'mp4' | 'cloudinary' | 'auto'>('youtube');
  const [videoDescription, setVideoDescription] = useState('');
  const [pressName, setPressName] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [summary, setSummary] = useState('');
  
  // Async Process States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Stats calculation
  const totalCount = mediaPosts.length;
  const photoCount = mediaPosts.filter(p => p.type === 'photo').length;
  const videoCount = mediaPosts.filter(p => p.type === 'video').length;
  const pressCount = mediaPosts.filter(p => p.type === 'press').length;

  const resetForm = () => {
    setShowAddForm(false);
    setEditingPost(null);
    setMediaType('photo');
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsImportant(false);
    setIsPublished(true);
    setCoverImage('');
    setCoverImagePublicId('');
    setImages([]);
    setThumbnail('');
    setThumbnailPublicId('');
    setVideoUrl('');
    setVideoPublicId('');
    setVideoType('youtube');
    setVideoDescription('');
    setPressName('');
    setOriginalUrl('');
    setAttachmentUrl('');
    setSummary('');
    setIsSaving(false);
    setIsUploading(false);
    setUploadProgressText('');
  };

  const handleStartEdit = (post: MediaPost) => {
    setEditingPost(post);
    setMediaType(post.type);
    setTitle(post.title || '');
    setContent(post.content || '');
    setDate(post.date || new Date().toISOString().split('T')[0]);
    setIsImportant(!!post.isImportant);
    setIsPublished(post.isPublished !== false);
    setCoverImage(post.coverImage || '');
    setCoverImagePublicId(post.publicId || '');
    setImages(post.images || []);
    setThumbnail(post.thumbnail || '');
    setThumbnailPublicId(post.thumbnailPublicId || '');
    setVideoUrl(post.videoUrl || (post.videoUrls && post.videoUrls[0]) || '');
    setVideoType(post.videoType || 'youtube');
    setVideoDescription(post.videoDescription || '');
    setPressName(post.pressName || '');
    setOriginalUrl(post.originalUrl || '');
    setAttachmentUrl(post.attachmentUrl || '');
    setSummary(post.summary || '');
    setShowAddForm(true);
  };

  // Upload handler for cover / thumbnail / photo attachments / videos / files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'thumbnail' | 'photos' | 'video' | 'attachment') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > 50 * 1024 * 1024) {
        showToast(`파일 용량이 50MB를 초과합니다. (${file.name})`, 'error');
        continue;
      }

      try {
        setUploadProgressText(`${file.name} Cloudinary 업로드 중... (${i + 1}/${fileList.length})`);
        const folderName = target === 'video' ? 'media_videos' : target === 'attachment' ? 'media_docs' : 'media_images';
        
        let url = '';
        let publicIdGenerated = '';

        try {
          const res = await uploadToCloudinary(file, folderName);
          url = res.secure_url;
          publicIdGenerated = res.public_id;
        } catch (cErr) {
          console.warn('Direct Cloudinary upload fallback to storage:', cErr);
          const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const timestamp = Date.now();
          publicIdGenerated = `kcf_${target}_${timestamp}_${safeFileName}`;
          const pathStr = `${folderName}/${timestamp}_${safeFileName}`;
          url = await uploadFileToStorage(pathStr, file);
        }

        if (target === 'cover') {
          setCoverImage(url);
          setCoverImagePublicId(publicIdGenerated);
        } else if (target === 'thumbnail') {
          setThumbnail(url);
          setThumbnailPublicId(publicIdGenerated);
        } else if (target === 'photos') {
          setImages(prev => [...prev, url]);
        } else if (target === 'video') {
          setVideoUrl(url);
          setVideoPublicId(publicIdGenerated);
          if (file.type.includes('video')) {
            setVideoType('cloudinary');
          }
        } else if (target === 'attachment') {
          setAttachmentUrl(url);
        }
        showToast(`${file.name} Cloudinary 파일 업로드가 완료되었습니다.`, 'success');
      } catch (err: any) {
        console.error('File upload failed:', err);
        showToast(`업로드 실패: ${err.message || String(err)}`, 'error');
      }
    }

    setIsUploading(false);
    setUploadProgressText('');
    e.target.value = '';
  };

  const handleSaveMedia = async () => {
    if (!title.trim()) {
      showToast('게시글 제목을 입력해 주세요.', 'error');
      return;
    }

    if (mediaType === 'press' && !pressName.trim()) {
      showToast('보도자료 언론사명을 입력해 주세요.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const existingMediaId = editingPost ? editingPost.id : `media-${Date.now()}`;
      
      const newPostItem: MediaPost = {
        id: existingMediaId,
        type: mediaType,
        title: title.trim(),
        date: date || new Date().toISOString().split('T')[0],
        views: editingPost ? (editingPost.views || 0) : 1,
        isImportant,
        isPublished,
        content: content.trim(),
        coverImage: coverImage.trim() || (images[0] || ''),
        images: mediaType === 'photo' ? (images.length > 0 ? images : (coverImage ? [coverImage] : [])) : undefined,
        thumbnail: thumbnail.trim() || coverImage.trim(),
        videoUrl: videoUrl.trim(),
        videoUrls: videoUrl.trim() ? [videoUrl.trim()] : undefined,
        videoType,
        videoDescription: videoDescription.trim(),
        pressName: pressName.trim(),
        originalUrl: originalUrl.trim(),
        attachmentUrl: attachmentUrl.trim(),
        summary: summary.trim(),
        publicId: coverImagePublicId || undefined,
        thumbnailPublicId: thumbnailPublicId || undefined,
        videoPublicId: videoPublicId || undefined,
      };

      await saveItem<MediaPost>('media_posts', newPostItem);

      let updated: MediaPost[];
      if (editingPost) {
        updated = mediaPosts.map(p => p.id === existingMediaId ? newPostItem : p);
        showToast('미디어 게시물이 수정되었습니다.', 'success');
      } else {
        updated = [newPostItem, ...mediaPosts];
        showToast('새 미디어 게시물이 등록되었습니다.', 'success');
      }

      setMediaPosts(updated);
      resetForm();
    } catch (e: any) {
      console.error('Failed to save media:', e);
      showToast('미디어 게시물 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = (id: string) => {
    const targetPost = mediaPosts.find(p => p.id === id);
    showConfirm(
      '미디어 게시물 삭제',
      '이 미디어 게시물을 삭제하시겠습니까?\n삭제한 게시물은 복구할 수 없습니다.',
      async () => {
        setIsDeleting(id);
        try {
          if (targetPost) {
            if (targetPost.publicId) {
              await deleteFromCloudinary(targetPost.publicId, 'image');
            }
            if (targetPost.thumbnailPublicId) {
              await deleteFromCloudinary(targetPost.thumbnailPublicId, 'image');
            }
            if (targetPost.videoPublicId) {
              await deleteFromCloudinary(targetPost.videoPublicId, 'video');
            }
          }

          await deleteItem('media_posts', id);
          const updated = mediaPosts.filter(p => p.id !== id);
          setMediaPosts(updated);
          showToast('미디어 게시글 및 클라우드 파일이 영구 삭제되었습니다.', 'success');
        } catch (err) {
          console.error('Delete error exception:', err);
          showToast('게시물 삭제 완료되었습니다.', 'info');
        } finally {
          setIsDeleting(null);
        }
      }
    );
  };

  const toggleIsPublished = async (post: MediaPost) => {
    const nextStatus = post.isPublished === false ? true : false;
    const updatedPost = { ...post, isPublished: nextStatus };
    const updated = mediaPosts.map(p => p.id === post.id ? updatedPost : p);
    setMediaPosts(updated);
    try {
      await saveItem<MediaPost>('media_posts', updatedPost);
    } catch (e) {
      console.error('Failed to update published status:', e);
    }
    showToast(`게시글 상태가 [${nextStatus ? '공개' : '비공개'}]로 변경되었습니다.`, 'info');
  };

  // Filtered List calculation
  const filteredList = mediaPosts.filter(post => {
    const matchesCategory = categoryFilter === 'all' || post.type === categoryFilter;
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'published' 
        ? post.isPublished !== false 
        : post.isPublished === false;
    
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      post.title.toLowerCase().includes(query) ||
      (post.content && post.content.toLowerCase().includes(query)) ||
      (post.pressName && post.pressName.toLowerCase().includes(query)) ||
      (post.summary && post.summary.toLowerCase().includes(query)) ||
      (post.videoDescription && post.videoDescription.toLowerCase().includes(query));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Title & Stats Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-zinc-200">
          <div>
            <h4 className="text-base sm:text-lg font-extrabold text-zinc-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-blue-600 shrink-0" />
              <span>미디어 관리</span>
            </h4>
            <p className="text-xs text-zinc-500 mt-0.5">
              홈페이지의 포토갤러리, 비디오 영상, 보도자료 게시물을 실시간으로 등록, 수정, 삭제 관리합니다.
            </p>
          </div>

          <button
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                resetForm();
                setShowAddForm(true);
              }
            }}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? '작성 취소' : '새 미디어 등록'}</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-50 border border-zinc-200/80 p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[11px] text-zinc-500 font-semibold block">전체 게시물 수</span>
            <div className="text-2xl font-black text-zinc-900 tracking-tight mt-1">{totalCount}<span className="text-xs font-normal text-zinc-400 ml-1">건</span></div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200/80 p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" />
              포토갤러리 수
            </span>
            <div className="text-2xl font-black text-emerald-900 tracking-tight mt-1">{photoCount}<span className="text-xs font-normal text-emerald-600 ml-1">건</span></div>
          </div>
          <div className="bg-blue-50/60 border border-blue-200/80 p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
              <Film className="w-3.5 h-3.5" />
              비디오 수
            </span>
            <div className="text-2xl font-black text-blue-900 tracking-tight mt-1">{videoCount}<span className="text-xs font-normal text-blue-600 ml-1">건</span></div>
          </div>
          <div className="bg-purple-50/60 border border-purple-200/80 p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
              <Newspaper className="w-3.5 h-3.5" />
              보도자료 수
            </span>
            <div className="text-2xl font-black text-purple-900 tracking-tight mt-1">{pressCount}<span className="text-xs font-normal text-purple-600 ml-1">건</span></div>
          </div>
        </div>
      </div>

      {/* 2. Media Registration / Edit Form (Expandable) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-50 border border-zinc-250 rounded-2xl p-4 sm:p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h5 className="text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  {editingPost ? '미디어 게시물 수정' : '새 미디어 게시물 등록'}
                </h5>
                <span className="text-[11px] text-zinc-400 font-medium">* 필수 항목</span>
              </div>

              {/* Step 1: Select Media Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">미디어 유형 선택 *</label>
                <div className="grid grid-cols-3 gap-2 sm:w-96">
                  <button
                    type="button"
                    onClick={() => setMediaType('photo')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                      mediaType === 'photo'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>포토갤러리</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                      mediaType === 'video'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>비디오</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('press')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                      mediaType === 'press'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <Newspaper className="w-3.5 h-3.5" />
                    <span>보도자료</span>
                  </button>
                </div>
              </div>

              {/* Common Fields: Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-800">제목 *</label>
                  <input
                    type="text"
                    placeholder="미디어 게시물 제목을 입력해 주세요."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800">
                    {mediaType === 'press' ? '보도일자 *' : '작성일자 *'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-zinc-900"
                  />
                </div>
              </div>

              {/* Category-Specific Form Fields */}

              {/* A. PHOTO GALLERY FORM */}
              {mediaType === 'photo' && (
                <div className="space-y-4 pt-2 border-t border-zinc-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800">본문 및 행사 설명</label>
                    <textarea
                      rows={4}
                      placeholder="포토갤러리 상세 설명이나 현장 스케치 본문을 입력해 주세요."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-zinc-900 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Representative Cover Image */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800">대표 이미지 커버 URL</label>
                      <label className={`cursor-pointer text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 ${isUploading ? 'opacity-50' : ''}`}>
                        <Upload className="w-3 h-3" />
                        <span>[대표 이미지 파일 업로드]</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => handleFileUpload(e, 'cover')}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="대표 이미지 URL을 직접 입력하거나 업로드 버튼을 사용하세요."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>

                  {/* Multi-Photo Attachments */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>첨부 이미지 (여러 장 등록 가능)</span>
                      </label>
                      <label className={`cursor-pointer inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition shadow-xs ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? '업로드 진행 중...' : '사진 파일 추가'}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => handleFileUpload(e, 'photos')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 p-3 bg-white border border-zinc-200 rounded-xl">
                        {images.map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="relative group rounded-lg overflow-hidden border border-zinc-200 aspect-square bg-zinc-100 shadow-xs flex items-center justify-center">
                            <img 
                              src={imgUrl} 
                              alt={`첨부 ${imgIdx + 1}`} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer" 
                              onError={(evt) => {
                                evt.currentTarget.src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setCoverImage(imgUrl)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow cursor-pointer"
                                title="대표 이미지로 설정"
                              >
                                대표
                              </button>
                              <button
                                type="button"
                                onClick={() => setImages(prev => prev.filter((_, i) => i !== imgIdx))}
                                className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition shadow cursor-pointer"
                                title="사진 삭제"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono">
                              #{imgIdx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic bg-white p-3 rounded-xl border border-zinc-200/70">
                        [사진 파일 추가] 버튼을 클릭해 행사 갤러리 이미지들을 한 번에 등록할 수 있습니다.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* B. VIDEO FORM */}
              {mediaType === 'video' && (
                <div className="space-y-4 pt-2 border-t border-zinc-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-800">영상 URL 또는 동영상 파일 *</label>
                        <label className={`cursor-pointer text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 ${isUploading ? 'opacity-50' : ''}`}>
                          <Upload className="w-3 h-3" />
                          <span>[동영상 파일 업로드]</span>
                          <input
                            type="file"
                            accept="video/*"
                            disabled={isUploading}
                            onChange={(e) => handleFileUpload(e, 'video')}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="예: https://www.youtube.com/watch?v=VIDEO_ID 또는 MP4 URL"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800">영상 플랫폼 유형</label>
                      <select
                        value={videoType}
                        onChange={(e) => setVideoType(e.target.value as any)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs font-medium text-zinc-800 focus:outline-none focus:border-zinc-900"
                      >
                        <option value="youtube">YouTube (유튜브)</option>
                        <option value="vimeo">Vimeo (비메오)</option>
                        <option value="mp4">Direct MP4 URL</option>
                        <option value="cloudinary">Cloudinary 동영상</option>
                        <option value="auto">자동 감지</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800">영상 상세 설명</label>
                    <textarea
                      rows={3}
                      placeholder="영상 내용이나 대회 경기 영상을 설명해 주세요."
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800">영상 썸네일 이미지</label>
                      <label className={`cursor-pointer text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 ${isUploading ? 'opacity-50' : ''}`}>
                        <Upload className="w-3 h-3" />
                        <span>[썸네일 이미지 업로드]</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => handleFileUpload(e, 'thumbnail')}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="썸네일 이미지 URL을 입력하거나 업로드하세요."
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* C. PRESS RELEASE FORM */}
              {mediaType === 'press' && (
                <div className="space-y-4 pt-2 border-t border-zinc-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800">언론사명 (보도 매체) *</label>
                      <input
                        type="text"
                        placeholder="예: 연합뉴스, 스포츠조선, YTN, KBS 등"
                        value={pressName}
                        onChange={(e) => setPressName(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800">원문 기사 URL</label>
                      <input
                        type="text"
                        placeholder="예: https://n.news.naver.com/article/..."
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800">보도 요약</label>
                    <input
                      type="text"
                      placeholder="기사 주요 핵심 내용을 한 줄로 요약해 주세요."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800">보도자료 전문 / 본문</label>
                    <textarea
                      rows={5}
                      placeholder="보도자료 기사 본문 내용을 작성해 주세요."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-800">대표 이미지 / 언론사 로고</label>
                        <label className={`cursor-pointer text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1 ${isUploading ? 'opacity-50' : ''}`}>
                          <Upload className="w-3 h-3" />
                          <span>[이미지 업로드]</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={(e) => handleFileUpload(e, 'cover')}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="대표 이미지 URL"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-800">첨부파일 (PDF/HWP/ZIP 등)</label>
                        <label className={`cursor-pointer text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1 ${isUploading ? 'opacity-50' : ''}`}>
                          <Upload className="w-3 h-3" />
                          <span>[파일 업로드]</span>
                          <input
                            type="file"
                            disabled={isUploading}
                            onChange={(e) => handleFileUpload(e, 'attachment')}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="첨부파일 다운로드 URL"
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status & Options: Published Status & Important Tag */}
              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-zinc-200">
                <div className="flex items-center gap-2">
                  <input
                    id="admin-media-published"
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <label htmlFor="admin-media-published" className="text-xs font-bold text-zinc-800 cursor-pointer flex items-center gap-1">
                    {isPublished ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
                    <span>홈페이지 공개 표시 ({isPublished ? '공개' : '비공개/임시저장'})</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="admin-media-important"
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-red-600 focus:ring-red-600 cursor-pointer"
                  />
                  <label htmlFor="admin-media-important" className="text-xs font-bold text-zinc-800 cursor-pointer">
                    상단 대표 추천 미디어로 강조 부착
                  </label>
                </div>
              </div>

              {/* Uploading progress notification */}
              {isUploading && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="font-semibold">{uploadProgressText || 'Cloudinary에 파일 업로드 중...'}</span>
                </div>
              )}

              {/* Form Controls */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving || isUploading}
                  className="bg-white border border-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveMedia}
                  disabled={isSaving || isUploading}
                  className="bg-zinc-950 text-white font-bold px-6 py-2 rounded-xl text-xs hover:bg-zinc-800 transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>저장 중...</span>
                    </>
                  ) : (
                    <span>{editingPost ? '수정 사항 저장' : '새 미디어 게시물 등록'}</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Filter Bar & Search Input */}
      <div className="bg-white border border-zinc-200 p-3.5 rounded-2xl shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              categoryFilter === 'all' ? 'bg-zinc-900 text-white shadow-2xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            전체 ({totalCount})
          </button>
          <button
            onClick={() => setCategoryFilter('photo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
              categoryFilter === 'photo' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Camera className="w-3 h-3" />
            포토갤러리 ({photoCount})
          </button>
          <button
            onClick={() => setCategoryFilter('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
              categoryFilter === 'video' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Film className="w-3 h-3" />
            비디오 ({videoCount})
          </button>
          <button
            onClick={() => setCategoryFilter('press')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
              categoryFilter === 'press' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Newspaper className="w-3 h-3" />
            보도자료 ({pressCount})
          </button>
        </div>

        {/* Public Status Filter & Search */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-zinc-900 cursor-pointer"
          >
            <option value="all">전체 상태</option>
            <option value="published">공개 게시글</option>
            <option value="private">비공개 게시글</option>
          </select>

          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="제목, 본문 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-900"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-400" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Media List Display Table / Cards */}
      <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto">
              <Film className="w-6 h-6 opacity-60" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-zinc-800">등록된 미디어 게시물이 없습니다.</p>
              <p className="text-xs text-zinc-500">새 미디어 등록 버튼을 눌러 첫 게시물을 등록해 주세요.</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="mt-2 inline-flex items-center gap-1.5 bg-zinc-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 미디어 등록</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-zinc-600 min-w-[760px]">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-4 py-3 w-[140px]">썸네일</th>
                  <th className="px-4 py-3">분류</th>
                  <th className="px-4 py-3">제목 / 내용 요약</th>
                  <th className="px-4 py-3">작성일 / 보도일</th>
                  <th className="px-4 py-3 text-center">조회수</th>
                  <th className="px-4 py-3 text-center">공개 여부</th>
                  <th className="px-4 py-3 text-right">관리 조작</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredList.map(post => {
                  const thumb = post.coverImage || post.thumbnail || (post.images && post.images[0]);
                  const isVis = post.isPublished !== false;

                  return (
                    <tr key={post.id} className="hover:bg-zinc-50/60 transition">
                      {/* Thumbnail with exact requirements styling */}
                      <td className="px-4 py-3">
                        <div className="admin-media-thumbnail w-[120px] aspect-video overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200 relative flex items-center justify-center shrink-0">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={post.title}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerHTML = '<div class="text-[10px] text-zinc-400 p-1 text-center font-medium">이미지 손상</div>';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 text-zinc-400 p-1">
                              {post.type === 'photo' ? <Camera className="w-5 h-5 opacity-40" /> : post.type === 'video' ? <Film className="w-5 h-5 opacity-40" /> : <Newspaper className="w-5 h-5 opacity-40" />}
                            </div>
                          )}
                          {post.type === 'video' && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                              <Play className="w-4 h-4 text-white fill-current" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-4 py-3 font-bold shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          post.type === 'photo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          post.type === 'video' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {post.type === 'photo' ? <Camera className="w-3 h-3" /> : post.type === 'video' ? <Film className="w-3 h-3" /> : <Newspaper className="w-3 h-3" />}
                          <span>{post.type === 'photo' ? '포토갤러리' : post.type === 'video' ? '비디오' : '보도자료'}</span>
                        </span>
                      </td>

                      {/* Title and Press */}
                      <td className="px-4 py-3 max-w-xs sm:max-w-md">
                        <div className="space-y-0.5">
                          <div className="font-bold text-zinc-900 text-xs flex items-center flex-wrap gap-1.5 leading-snug">
                            {post.isImportant && (
                              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">
                                대표
                              </span>
                            )}
                            {post.pressName && (
                              <span className="text-purple-600 font-extrabold shrink-0">[{post.pressName}]</span>
                            )}
                            <span className="hover:text-blue-600 transition truncate max-w-full">{post.title}</span>
                          </div>
                          {(post.summary || post.content || post.videoDescription) && (
                            <p className="text-[11px] text-zinc-400 line-clamp-1">
                              {post.summary || post.content || post.videoDescription}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{post.date}</td>

                      {/* Views */}
                      <td className="px-4 py-3 text-center font-mono text-xs text-zinc-600">{post.views || 0}</td>

                      {/* Public Status Toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleIsPublished(post)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                            isVis 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {isVis ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{isVis ? '공개' : '비공개'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Homepage view button */}
                          <button
                            type="button"
                            onClick={() => setPreviewingPost(post)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-lg px-2.5 py-1 transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            title="홈페이지에서 보기 미리보기"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden lg:inline">홈페이지에서 보기</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(post)}
                            className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg px-2.5 py-1 transition text-[10px] font-bold cursor-pointer"
                          >
                            수정
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            disabled={isDeleting === post.id}
                            className="text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded-lg px-2.5 py-1 transition text-[10px] font-bold cursor-pointer disabled:opacity-50"
                          >
                            {isDeleting === post.id ? '삭제 중...' : '삭제'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Homepage View Preview Modal */}
      <AnimatePresence>
        {previewingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zinc-200 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setPreviewingPost(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-3 border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                    홈페이지 미리보기
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">{previewingPost.date}</span>
                </div>
                <h3 className="text-xl font-extrabold text-zinc-900 font-serif">{previewingPost.title}</h3>
                {previewingPost.pressName && (
                  <p className="text-xs font-bold text-purple-600">언론 보도: {previewingPost.pressName}</p>
                )}
              </div>

              {/* Video Player or Image Preview */}
              <div className="space-y-4">
                {previewingPost.type === 'video' && previewingPost.videoUrl && (
                  <div className="media-video-preview w-full max-w-[800px] mx-auto bg-black rounded-2xl overflow-hidden shadow-lg aspect-video flex items-center justify-center">
                    {previewingPost.videoUrl.includes('youtube.com') || previewingPost.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          previewingPost.videoUrl.includes('youtu.be') 
                            ? previewingPost.videoUrl.split('youtu.be/')[1]?.split('?')[0] 
                            : previewingPost.videoUrl.split('v=')[1]?.split('&')[0]
                        }`}
                        title={previewingPost.title}
                        className="w-full h-full aspect-video border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video 
                        src={previewingPost.videoUrl} 
                        controls 
                        className="w-full h-full object-contain bg-black"
                      />
                    )}
                  </div>
                )}

                {(previewingPost.coverImage || previewingPost.thumbnail) && (
                  <div className="media-preview max-w-full mx-auto bg-zinc-50 rounded-2xl p-2 border border-zinc-200">
                    <img 
                      src={previewingPost.coverImage || previewingPost.thumbnail} 
                      alt={previewingPost.title} 
                      className="max-w-full w-auto h-auto max-h-[450px] mx-auto object-contain rounded-xl" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Multiple Images Grid */}
                {previewingPost.images && previewingPost.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {previewingPost.images.map((img, idx) => (
                      <div key={idx} className="aspect-square bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200">
                        <img src={img} alt={`갤러리 ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}

                {(previewingPost.content || previewingPost.videoDescription || previewingPost.summary) && (
                  <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed">
                    {previewingPost.content || previewingPost.videoDescription || previewingPost.summary}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-zinc-200">
                <button
                  onClick={() => setPreviewingPost(null)}
                  className="bg-zinc-900 text-white text-xs font-bold px-5 py-2 rounded-xl hover:bg-zinc-800 cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
