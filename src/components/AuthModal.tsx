import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { 
  X, Sparkles, ShieldCheck, Mail, Lock, User, Eye, EyeOff, 
  AlertCircle, CheckCircle2, Crown, Shield, UserCheck, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogleCredential, loginWithEmailPassword, registerUser, loginDemoUser } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  // Loading, Error & Success Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Clear messages on tab change
  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Basic email format validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Submit Sign In
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = signInEmail.trim();
    if (!cleanEmail || !signInPassword) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = loginWithEmailPassword(cleanEmail, signInPassword);
      setIsLoading(false);
      if (result.success) {
        setSuccessMessage('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับ!');
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
        }, 700);
      } else {
        setErrorMessage(result.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    }, 300);
  };

  // Submit Sign Up
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = signUpName.trim();
    const cleanEmail = signUpEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !signUpPassword || !signUpConfirmPassword) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('รูปแบบอีเมลไม่ถูกต้อง (เช่น user@example.com)');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = registerUser(cleanName, cleanEmail, signUpPassword);
      setIsLoading(false);
      if (result.success) {
        setSuccessMessage('สมัครสมาชิกและเข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!');
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
        }, 700);
      } else {
        setErrorMessage(result.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative text-left max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Brand */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {mode === 'signin' ? 'เข้าสู่ระบบ (Sign In)' : 'สมัครสมาชิก (Sign Up)'}
            </h3>
            <p className="text-xs text-slate-500">
              JAPAN TABI • ระบบวางแผนท่องเที่ยวญี่ปุ่น
            </p>
          </div>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => handleSwitchMode('signin')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('signup')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล (Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Fill Links */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                คลิกเพื่อทดสอบเข้าสู่ระบบตามสิทธิ์:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSignInEmail('muhammadrokibchemat@gmail.com');
                    setSignInPassword('Admin@123456');
                  }}
                  className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold text-left truncate flex items-center gap-1 border border-amber-200 cursor-pointer"
                  title="Super Admin: muhammadrokibchemat@gmail.com"
                >
                  <Crown className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInEmail('seree999@gmail.com');
                    setSignInPassword('Admin@123456');
                  }}
                  className="px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[10px] font-bold text-left truncate flex items-center gap-1 border border-indigo-200 cursor-pointer"
                  title="Admin: seree999@gmail.com"
                >
                  <Shield className="w-3 h-3 text-indigo-600 shrink-0" />
                  <span className="truncate">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInEmail('somchai@japan.com');
                    setSignInPassword('password123');
                  }}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[10px] font-bold text-left truncate flex items-center gap-1 border border-slate-200 cursor-pointer"
                  title="User: somchai@japan.com"
                >
                  <UserCheck className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="truncate">User ทั่วไป</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm cursor-pointer mt-1 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        )}

        {/* 2. SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล / ชื่อเล่น</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี หรือ Kenji"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล (Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSignUpConfirmPassword ? 'text' : 'password'}
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}</span>
              {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 absolute">
            หรือดำเนินการต่อด้วย
          </span>
        </div>

        {/* 3. GOOGLE OAUTH SECTION */}
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  loginWithGoogleCredential(credentialResponse.credential);
                  onClose();
                }
              }}
              onError={() => {
                console.error('Google Sign-In Failed');
                setErrorMessage('การเข้าสู่ระบบผ่าน Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
              }}
              shape="pill"
              theme="outline"
              size="large"
              text="continue_with"
            />
          </div>

          <div className="w-full flex items-center justify-center pt-1">
            <div className="text-[10px] text-slate-400 text-center">
              รองรับทั้ง Google One Tap และอีเมลทั่วไป
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ข้อมูลปลอดภัยและจัดเก็บเป็นความลับ</span>
        </div>
      </div>
    </div>
  );
};
