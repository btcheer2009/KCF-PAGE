import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Lock, CheckCircle2, AlertCircle, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { hashPassword } from '../lib/cryptoUtils';

interface AdminSettingsManagerProps {
  currentPasswordHash: string;
  onUpdatePasswordHash: (newHash: string) => Promise<void>;
  onLogout: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminSettingsManager({
  currentPasswordHash,
  onUpdatePasswordHash,
  onLogout,
  showToast,
}: AdminSettingsManagerProps) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. 모든 입력값이 작성되었는지 확인
    if (!currentPw.trim()) {
      const msg = '현재 관리자 비밀번호를 입력해 주세요.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    if (!newPw.trim()) {
      const msg = '새 관리자 비밀번호를 입력해 주세요.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    if (!confirmPw.trim()) {
      const msg = '새 관리자 비밀번호 확인을 입력해 주세요.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. 현재 비밀번호가 실제 관리자 비밀번호와 일치하는지 확인
      const enteredHash = await hashPassword(currentPw);
      if (enteredHash !== currentPasswordHash) {
        const msg = '현재 관리자 비밀번호가 올바르지 않습니다.';
        setErrorMsg(msg);
        showToast(msg, 'error');
        setIsSubmitting(false);
        return;
      }

      // 3. 새 비밀번호와 새 비밀번호 확인 값이 일치하는지 확인
      if (newPw !== confirmPw) {
        const msg = '새 비밀번호가 서로 일치하지 않습니다.';
        setErrorMsg(msg);
        showToast(msg, 'error');
        setIsSubmitting(false);
        return;
      }

      // 4. 현재 비밀번호와 새 비밀번호가 동일하지 않은지 확인
      if (currentPw === newPw) {
        const msg = '기존 비밀번호와 다른 비밀번호를 입력해 주세요.';
        setErrorMsg(msg);
        showToast(msg, 'error');
        setIsSubmitting(false);
        return;
      }

      // 5. 새 비밀번호가 최소 8자 이상인지 확인
      if (newPw.length < 8) {
        const msg = '새 비밀번호는 8자 이상으로 설정해 주세요.';
        setErrorMsg(msg);
        showToast(msg, 'error');
        setIsSubmitting(false);
        return;
      }

      // 비밀번호 변경 저장 (해시 저장)
      const newHash = await hashPassword(newPw);
      await onUpdatePasswordHash(newHash);

      // 성공 메시지 및 리셋
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setErrorMsg('');

      showToast('관리자 비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요.', 'success');

      // 변경 후 자동 로그아웃 및 로그인 화면으로 전환
      setTimeout(() => {
        onLogout();
      }, 800);
    } catch (err) {
      console.error('Password change error:', err);
      showToast('비밀번호 변경 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-200">
        <h4 className="text-base sm:text-lg font-extrabold text-zinc-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>관리자 설정</span>
        </h4>
        <p className="text-xs text-zinc-500 mt-0.5">
          관리자 보안 설정 | 관리자 제어센터 접속에 사용하는 비밀번호를 변경합니다.
        </p>
      </div>

      {/* Admin Password Change Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-150">
          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-zinc-900">관리자 비밀번호 변경</h5>
            <p className="text-xs text-zinc-500 mt-0.5">
              비밀번호 변경 후에는 보안을 위해 자동으로 로그아웃됩니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-800">
              현재 관리자 비밀번호 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => {
                  setCurrentPw(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="현재 사용 중인 관리자 비밀번호"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-zinc-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 p-0.5 transition cursor-pointer"
                title={showCurrentPw ? '비밀번호 숨기기' : '비밀번호 표시'}
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-800">
                새 관리자 비밀번호 <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-blue-600">8자 이상 (영문, 숫자, 특수문자 조합 권장)</span>
            </div>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPw}
                onChange={(e) => {
                  setNewPw(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="새 관리자 비밀번호 입력 (최소 8자 이상)"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-zinc-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 p-0.5 transition cursor-pointer"
                title={showNewPw ? '비밀번호 숨기기' : '비밀번호 표시'}
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-800">
              새 관리자 비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => {
                  setConfirmPw(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="새 관리자 비밀번호 재입력"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-zinc-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 p-0.5 transition cursor-pointer"
                title={showConfirmPw ? '비밀번호 숨기기' : '비밀번호 표시'}
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>변경 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>관리자 비밀번호 변경</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Status Info Card */}
      <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-2 text-xs text-zinc-600">
        <div className="font-bold text-zinc-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>안전한 관리자 인증 수칙</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-zinc-500 text-[11px] leading-relaxed">
          <li>관리자 비밀번호는 SHA-256 단방향 보안 해시 알고리즘으로 안전하게 데이터베이스에 저장됩니다.</li>
          <li>비밀번호 변경이 성공하면 기존 관리자 세션이 즉시 로그아웃되며 새 비밀번호로 다시 로그인해야 합니다.</li>
          <li>비밀번호 연속 5회 입력 오류 시 보안을 위해 30초간 로그인이 자동 제한됩니다.</li>
        </ul>
      </div>
    </div>
  );
}

