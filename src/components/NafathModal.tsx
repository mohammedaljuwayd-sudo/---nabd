import React, { useState } from 'react';
import { User, UserRole } from '../types/nabd';
import { nafathService } from '../services/nafath';
import { Shield, Smartphone, ArrowRight, CheckCircle2, AlertCircle, X, Building2 } from 'lucide-react';

interface NafathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialRole?: UserRole;
}

export const NafathModal: React.FC<NafathModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'citizen',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [nationalId, setNationalId] = useState<string>(
    initialRole === 'citizen'
      ? '1084291833'
      : initialRole === 'employee'
      ? '1022449955'
      : '1011883344'
  );
  const [step, setStep] = useState<'input' | 'challenge'>('input');
  const [challengeCode, setChallengeCode] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    if (role === 'citizen') {
      setNationalId('1084291833');
    } else if (role === 'employee') {
      setNationalId('1022449955');
    } else {
      setNationalId('1011883344');
    }
  };

  const handleRequestChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanId = nationalId.trim();
    if (!/^[12]\d{9}$/.test(cleanId)) {
      setError('رقم الهوية الوطنية أو الإقامة يجب أن يتكون من 10 أرقام تبدأ بـ 1 أو 2');
      return;
    }

    setIsLoading(true);
    try {
      const res = await nafathService.requestLogin(cleanId, selectedRole);
      setChallengeCode(res.challengeCode);
      setSessionId(res.sessionId);
      setStep('challenge');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال بالنفاذ الوطني');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmNafathChallenge = async () => {
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-[#0B3A5B] p-6 text-white text-center">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 border border-white/20 mb-3 shadow-inner">
            <Shield className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-xl font-bold font-cairo">بوابة النفاذ الوطني الموحد</h2>
          <p className="text-xs text-slate-200 mt-1">
            تسجيل الدخول لمنظومة «نبض» - أمانة المنطقة الشرقية
          </p>
          <div className="mt-3 inline-block bg-[#07253B]/70 px-3 py-1 rounded text-[11px] text-[#D4AF37] border border-[#D4AF37]/30">
            نموذج تجريبي، تدفق الدخول مصمَّم على النفاذ
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'input' ? (
            <form onSubmit={handleRequestChallenge} className="space-y-4">
              {/* Portal Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  تحديد البوابة المطلوبة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('citizen')}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'citizen'
                        ? 'bg-[#0B3A5B] text-white border-[#0B3A5B] shadow-xs font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    بوابة المواطن
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('employee')}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'employee'
                        ? 'bg-[#0B3A5B] text-white border-[#0B3A5B] shadow-xs font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    بوابة الموظف
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('decision_maker')}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'decision_maker'
                        ? 'bg-[#D4AF37] text-slate-900 border-[#D4AF37] shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    منصة القيادة
                  </button>
                </div>
              </div>

              {/* National ID Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  رقم الهوية الوطنية / الإقامة
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                  placeholder="1XXXXXXXXX أو 2XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-inter text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0B3A5B] focus:border-[#0B3A5B] transition-colors"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  * رقم الهوية الوطنية مشفر بالكامل (SHA Hash) للحفاظ على الخصوصية.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#0B3A5B] hover:bg-[#16537E] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span>جاري طلب التحقق من نفاذ...</span>
                ) : (
                  <>
                    <span>متابعة للتحقق</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="text-xs text-emerald-800 font-medium mb-1">
                  رمز التحقق في تطبيق نفاذ
                </div>
                <div className="text-4xl font-extrabold text-[#0B3A5B] font-inter tracking-wider py-2">
                  {challengeCode}
                </div>
                <div className="text-[11px] text-emerald-700 mt-1 flex items-center justify-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span>اختر الرقم أعلاه في تطبيق نفاذ على هاتفك المحمول</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 text-right space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">البوابة المحددة:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedRole === 'citizen'
                      ? 'بوابة المواطن والمقيم'
                      : selectedRole === 'employee'
                      ? 'بوابة منسوبي الأمانة'
                      : 'منصة القيادة وصانع القرار'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الهوية:</span>
                  <span className="font-inter font-medium text-slate-800 dir-ltr">
                    {nationalId.slice(0, 4)}••••{nationalId.slice(-2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmNafathChallenge}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد التحقق عبر تطبيق نفاذ</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto cursor-pointer"
              >
                الرجوع لتعديل رقم الهوية
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
