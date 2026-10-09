import React from 'react';
import { User, UserRole } from '../types/nabd';
import { Activity, ShieldCheck, UserCheck, Briefcase, RotateCcw, Sliders, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onRoleSwitch: (role: UserRole) => void;
  onResetDemo: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleSwitch,
  onResetDemo,
  onOpenSettings,
  onLogout,
  onOpenLoginModal,
}) => {
  return (
    <header className="bg-[#0B3A5B] text-white border-b border-[#07253B] sticky top-0 z-40 shadow-xs">
      <div className="bg-[#07253B] text-xs py-1 px-4 text-slate-300 flex justify-between items-center border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
          <span className="font-medium text-slate-200">منظومة «نبض» لمرافق الأمانة</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">حاضرة الدمام</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-200 text-[11px]">
            أمانة المنطقة الشرقية
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
          <span>تدفق الدخول مصمَّم على النفاذ الوطني</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B3A5B] to-[#16537E] border border-white/20 flex items-center justify-center shadow-inner">
            <Activity className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-cairo">نَبْض</span>
              <span className="text-xs bg-white/10 text-slate-200 px-2 py-0.5 rounded font-normal">
                مرافق الأمانة
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-none mt-0.5">
              الحوكمة الرقمية للصيانة وإعادة السفلتة
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
