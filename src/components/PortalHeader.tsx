import React from 'react';
import { User, UserRole } from '../types/nabd';
import { NabdLogo, NabdEmblem } from './NabdLogo';
import {
  Activity,
  LogOut,
  Sliders,
  Building2,
  Grid,
  Bell,
  Shield,
  Layers,
  ChevronDown,
  UserCheck,
  Briefcase,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface PortalHeaderProps {
  currentUser: User;
  onLogout: () => void;
  onOpenSettings: () => void;
  onReturnToGateway: () => void;
  onChangePortal: (role: UserRole) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentUser,
  onLogout,
  onOpenSettings,
  onReturnToGateway,
  onChangePortal,
}) => {
  const getPortalInfo = () => {
    switch (currentUser.role) {
      case 'citizen':
        return {
          title: 'بوابة المواطن والمقيم',
          badge: 'خدمات المستفيدين',
          icon: UserCheck,
          accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'employee':
        return {
          title: 'بوابة العمليات الميدانية والرقابة',
          badge: 'منسوبو الأمانة',
          icon: Briefcase,
          accent: 'text-blue-700 bg-blue-50 border-blue-200',
        };
      case 'decision_maker':
        return {
          title: 'منظومة القيادة وصانع القرار',
          badge: 'القيادات البلدية',
          icon: ShieldCheck,
          accent: 'text-amber-800 bg-amber-50 border-amber-200',
        };
    }
  };

  const portalInfo = getPortalInfo();
  const IconComp = portalInfo.icon;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand with Official Logo and Nabd text */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToGateway}
            className="cursor-pointer group hover:opacity-90 transition-opacity flex items-center gap-2.5"
            title="العودة للبوابة الرئيسية"
          >
            <NabdLogo variant="horizontal" size="sm" showSubtitle={true} />
          </button>

          <div className="border-r border-slate-200 pr-3 mr-0.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-light">|</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 font-cairo">
                {portalInfo.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              <span>أمانة المنطقة الشرقية · حاضرة الدمام</span>
              <span>·</span>
              <button
                onClick={onReturnToGateway}
                className="text-[#0B3A5B] hover:underline font-semibold cursor-pointer"
              >
                البوابة الرئيسية
              </button>
            </div>
          </div>
        </div>

        {/* Clean Segmented Portal Switcher */}
        <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 text-xs">
          <button
            onClick={() => onChangePortal('citizen')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              currentUser.role === 'citizen'
                ? 'bg-white text-[#0B3A5B] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بوابة المواطن
          </button>
          <button
            onClick={() => onChangePortal('employee')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              currentUser.role === 'employee'
                ? 'bg-white text-[#0B3A5B] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بوابة الموظف
          </button>
          <button
            onClick={() => onChangePortal('decision_maker')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              currentUser.role === 'decision_maker'
                ? 'bg-[#0B3A5B] text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            منصة القيادة
          </button>
        </div>

        {/* User Account & Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800 truncate max-w-[170px]">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-400 font-inter dir-ltr">
              هوية: {currentUser.maskedId}
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="معايير ولوائح تكاليف الصيانة"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
