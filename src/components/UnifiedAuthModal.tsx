import React, { useState } from 'react';
import { User, UserRole } from '../types/nabd';
import { nafathService } from '../services/nafath';
import { NabdLogo } from './NabdLogo';
import {
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  UserPlus,
  LogIn,
  Building2,
  Mail,
  Phone,
  MapPin,
  Lock,
  UserCheck,
} from 'lucide-react';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialTab?: 'register' | 'password' | 'nafath';
  initialRole?: UserRole;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'nafath',
  initialRole = 'citizen',
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'password' | 'nafath'>(initialTab);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Registration Form State
  const [regName, setRegName] = useState<string>('');
  const [regNationalId, setRegNationalId] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regDistrict, setRegDistrict] = useState<string>('وسط الدمام (حي السوق)');
  const [regPassword, setRegPassword] = useState<string>('');

  // Password Login State
  const [loginIdentifier, setLoginIdentifier] = useState<string>('1084291833');
  const [loginPassword, setLoginPassword] = useState<string>('password123');

  // Nafath SSO State
  const [nafathId, setNafathId] = useState<string>('1084291833');
  const [nafathStep, setNafathStep] = useState<'input' | 'challenge'>('input');
  const [challengeCode, setChallengeCode] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // Handle Tab Switch
  const switchTab = (tab: 'register' | 'password' | 'nafath') => {
    setActiveTab(tab);
    setError('');
  };

  // 1. Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regNationalId.trim() || !regPhone.trim() || !regEmail.trim()) {
      setError('يرجى تعبئة كافة الحقول الرئيسية المطلوبة');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await nafathService.registerUser({
        name: regName,
        nationalId: regNationalId,
        phone: regPhone,
        email: regEmail,
        district: regDistrict,
        password: regPassword || 'password123',
        role: selectedRole,
      });

      onSuccess(newUser);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل المستخدم');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Password Login
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);
    try {
      const user = await nafathService.loginWithPassword(
        loginIdentifier,
        loginPassword,
        selectedRole
      );
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Request Nafath Challenge
  const handleRequestNafath = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);
    try {
      const res = await nafathService.requestLogin(nafathId, selectedRole);
      setChallengeCode(res.challengeCode);
      setSessionId(res.sessionId);
      setNafathStep('challenge');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال بالنفاذ');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Confirm Nafath Challenge
  const handleConfirmNafath = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await nafathService.verifyChallenge(sessionId);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل التحقق من رمز نفاذ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Official Logo */}
        <div className="bg-[#0B3A5B] p-5 text-white text-center">
          <div className="inline-block p-3 rounded-2xl bg-white/10 border border-white/15 mb-2 shadow-xs">
            <NabdLogo variant="vertical" size="sm" theme="dark" showSubtitle={true} />
          </div>
          <h2 className="text-base font-bold font-cairo">بوابة الدخول والتسجيل الموحدة</h2>
          <p className="text-[11px] text-slate-200 mt-0.5">
            أمانة المنطقة الشرقية · حاضرة الدمام
          </p>

          {/* 3 Nav Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#07253B]/70 p-1 rounded-xl mt-4 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => switchTab('nafath')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'nafath'
                  ? 'bg-white text-[#0B3A5B] font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              النفاذ الوطني
            </button>
            <button
              type="button"
              onClick={() => switchTab('password')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-white text-[#0B3A5B] font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              اسم المستخدم
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              مستخدم جديد
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Target Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الصفة المستهدفة للدخول:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('citizen')}
                className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'citizen'
                    ? 'bg-[#0B3A5B] text-white border-[#0B3A5B] font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                المواطن والمقيم
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('employee')}
                className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'employee'
                    ? 'bg-[#0B3A5B] text-white border-[#0B3A5B] font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                منسوبو الأمانة
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('decision_maker')}
                className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'decision_maker'
                    ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37] font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                صانع القرار
              </button>
            </div>
          </div>

          {/* TAB 1: NAFATH SSO */}
          {activeTab === 'nafath' && (
            <div>
              {nafathStep === 'input' ? (
                <form onSubmit={handleRequestNafath} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      رقم الهوية الوطنية أو الإقامة
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={nafathId}
                      onChange={(e) => setNafathId(e.target.value.replace(/\D/g, ''))}
                      placeholder="1XXXXXXXXX أو 2XXXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-inter text-slate-900 focus:ring-2 focus:ring-[#0B3A5B]"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      * التحقق الآمن عبر تطبيق نفاذ على جوالك المسجل.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-[#0B3A5B] hover:bg-[#16537E] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>طلب رمز التحقق من نفاذ</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <div className="text-xs text-emerald-800 font-medium">رمز التحقق المطلوب في نفاذ</div>
                    <div className="text-4xl font-extrabold text-[#0B3A5B] font-inter tracking-wider py-2">
                      {challengeCode}
                    </div>
                    <div className="text-[11px] text-emerald-700 flex items-center justify-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 shrink-0" />
                      <span>اختر الرقم أعلاه في تطبيق نفاذ لتأكيد الهوية</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmNafath}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد الدخول عبر تطبيق نفاذ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNafathStep('input')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto cursor-pointer"
                  >
                    الرجوع لتعديل رقم الهوية
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USERNAME & PASSWORD LOGIN */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم المستخدم أو الهوية الوطنية أو البريد:
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="alshammari أو 1084291833 أو user@portal.sa"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-inter"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  كلمة المرور:
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-inter"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#0B3A5B] hover:bg-[#16537E] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            </form>
          )}

          {/* TAB 3: NEW USER REGISTRATION */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الاسم الكامل:
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="محمد بن فهد الدوسري"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم الهوية أو الإقامة (10 أرقام):
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={regNationalId}
                    onChange={(e) => setRegNationalId(e.target.value.replace(/\D/g, ''))}
                    placeholder="1XXXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-inter"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم الجوال:
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-inter"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  البريد الإلكتروني:
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="m.aldosari@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-inter"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الموقع / الحي السكني بحاضرة الدمام:
                </label>
                <select
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="وسط الدمام (حي السوق والعَمامرة)">وسط الدمام (حي السوق والعَمامرة)</option>
                  <option value="حي الفيصلية">حي الفيصلية</option>
                  <option value="حي الشاطئ (الكورنيش)">حي الشاطئ (الكورنيش)</option>
                  <option value="حي أُحُد و 71">حي أُحُد و 71</option>
                  <option value="حي الضباب والصناعية">حي الضباب والصناعية</option>
                  <option value="حي المزروعية">حي المزروعية</option>
                  <option value="حي طيبة">حي طيبة</option>
                  <option value="حي النورس">حي النورس</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  كلمة المرور:
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-inter"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>إنشاء الحساب ودخول النظام مباشرة</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
