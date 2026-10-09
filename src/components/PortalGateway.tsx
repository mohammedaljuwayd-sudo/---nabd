import React, { useState } from 'react';
import { UserRole } from '../types/nabd';
import { NabdLogo, NabdEmblem } from './NabdLogo';
import {
  Activity,
  UserCheck,
  Briefcase,
  ShieldCheck,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Building2,
  FileText,
  Shield,
  Layers,
  UserPlus,
  LogIn,
  KeyRound,
  Sparkles,
  Zap,
  Clock,
  Compass,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface PortalGatewayProps {
  onSelectPortal: (role: UserRole) => void;
  onOpenAuthModal: (tab: 'register' | 'password' | 'nafath', role?: UserRole) => void;
}

export const PortalGateway: React.FC<PortalGatewayProps> = ({
  onSelectPortal,
  onOpenAuthModal,
}) => {
  const [hoveredPortal, setHoveredPortal] = useState<UserRole | null>(null);

  const PORTALS = [
    {
      id: 'citizen' as UserRole,
      title: 'بوابة المواطن والمقيم',
      badge: 'الخدمات الميدانية للمجتمع',
      desc: 'تسجيل ومتابعة بلاغات الطرق والمرافق الحضرية مع رصد جغرافي دقيق وتنبيه ذكي للتكرار.',
      highlights: [
        'تسجيل بلاغ فوري مع التقاط الإحداثيات آلياً',
        'توثيق بالصور أو ترشيح فوري للزيارة الميدانية',
        'تنبيه التكرار الذكي لمنع ازدواجية البلاغات',
        'متابعة رحلة البلاغ عبر شريط إنجاز من 5 مراحل',
      ],
      icon: UserCheck,
      color: 'from-emerald-500/10 to-transparent',
      borderColor: 'hover:border-emerald-500/40',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
      actionLabel: 'الدخول لبوابة المواطن',
    },
    {
      id: 'employee' as UserRole,
      title: 'بوابة الرقابة والمفتش الميداني',
      badge: 'منسوبو ومفتشو الأمانة',
      desc: 'تدقيق البلاغات، التحقق الميداني، إسناد أوامر الصيانة للمقاول، وحوكمة التكاليف ومخاطر التأخير.',
      highlights: [
        'خريطة عمليات موحدة لجميع بلاغات حاضرة الدمام',
        'تدقيق التكرار والتحقق من اشتراطات الحوكمة',
        'إسناد أوامر الصيانة الروتينية والطارئة للمقاول',
        'سجل تدقيق رقابي غير قابل للتعديل (Audit Log)',
      ],
      icon: Briefcase,
      color: 'from-sky-500/10 to-transparent',
      borderColor: 'hover:border-[#0B3A5B]/50',
      btnBg: 'bg-[#0B3A5B] hover:bg-[#16537E] text-white',
      accentColor: 'text-[#0B3A5B] bg-sky-50 border-sky-200/60',
      actionLabel: 'الدخول لبوابة الموظف',
    },
    {
      id: 'decision_maker' as UserRole,
      title: 'منصة القيادة وصانع القرار',
      badge: 'الإدارة التنفيذية ووكيل الأمانة',
      desc: 'تحليلات مكانية مجمعة وخريطة حرارية لاعتماد مشاريع إعادة السفلتة وحماية المال العام من هدر الترقيع.',
      highlights: [
        'عزل بيانات كامل لحماية خصوصية الأفراد',
        'خريطة حرارية لمؤشرات كثافة وتكرار الأعطال',
        'مقارنة تكلفة الترقيع بميزانية إعادة السفلتة الشاملة',
        'اعتماد فوري لأوامر العمل وتحقيق الوفر المالي',
      ],
      icon: ShieldCheck,
      color: 'from-amber-500/10 to-transparent',
      borderColor: 'hover:border-amber-500/50',
      btnBg: 'bg-slate-900 hover:bg-[#0B3A5B] text-white',
      accentColor: 'text-amber-800 bg-amber-50 border-amber-200/60',
      actionLabel: 'الدخول لمنصة القيادة',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col font-cairo text-slate-900 selection:bg-[#0B3A5B] selection:text-white">
      {/* 1. Modern Minimal Header with Logo at the Top */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NabdLogo variant="horizontal" size="md" showSubtitle={true} />
            <div className="hidden sm:block border-r border-slate-200 pr-3 mr-1">
              <span className="text-xs font-bold text-slate-800 block">أمانة المنطقة الشرقية</span>
              <span className="text-[10px] text-slate-400 block">حاضرة الدمام · منظومة المرافق الذكية</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onOpenAuthModal('nafath')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#0B3A5B] hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>النفاذ الوطني</span>
            </button>
            <button
              onClick={() => onOpenAuthModal('password')}
              className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#0B3A5B] hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => onOpenAuthModal('register', 'citizen')}
              className="px-4 py-2 rounded-xl bg-[#0B3A5B] hover:bg-[#16537E] text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>مستخدم جديد</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Clean, uncluttered, as it was */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>المنظومة الرقمية الموحدة لإدارة الأصول ومرافق الطرق</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B3A5B] tracking-tight leading-tight">
            حوكمة ذكية لحاضرة الدمام، <br />
            <span className="text-slate-900 font-bold">من البلاغ الميداني حتى قرار الاعتماد</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto pt-1">
            منصة متكاملة تربط المواطن والمراقب الميداني وصانع القرار في حلقة عمل واحدة، لأتمتة معالجة
            أعطال الطرق، رصد التكرار الجغرافي، وإيقاف هدر الترقيع المتكرر.
          </p>
        </div>

        {/* 3. The Three Distinct Modern Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 items-stretch">
          {PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                onMouseEnter={() => setHoveredPortal(portal.id)}
                onMouseLeave={() => setHoveredPortal(null)}
                className={`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group ${portal.borderColor}`}
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0B3A5B] group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-[#0B3A5B]" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${portal.accentColor}`}>
                      {portal.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 font-cairo group-hover:text-[#0B3A5B] transition-colors">
                    {portal.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                    {portal.desc}
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100 mb-8">
                    {portal.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onSelectPortal(portal.id)}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group-hover:shadow-md ${portal.btnBg}`}
                  >
                    <span>{portal.actionLabel}</span>
                    <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 transition-transform group-hover:-translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Live Operational Metrics (Calm, Executive, Non-Cluttered) */}
        <div className="mt-14 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D4AF37]" />
                <span>مؤشرات الأداء المباشرة بحاضرة الدمام</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديث فوري يربط مراكز العمليات بالأمانة وفرق المقاولين الميدانية
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>النظام متصل ومستقر</span>
              <span>·</span>
              <span className="font-inter">28 فرقة نشطة</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-right">
            <div className="space-y-1">
              <div className="text-xs text-slate-500">متوسط زمن الاستجابة</div>
              <div className="text-2xl font-extrabold text-[#0B3A5B] font-inter">18 دقيقة</div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                <span>↓ 35% تحسن عن المستهدف</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500">دقة الرصد المكاني</div>
              <div className="text-2xl font-extrabold text-[#0B3A5B] font-inter">99.4%</div>
              <div className="text-[11px] text-slate-500">نطاق حوكمة 70 متراً</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500">معدل منع ازدواجية البلاغات</div>
              <div className="text-2xl font-extrabold text-[#0B3A5B] font-inter">100%</div>
              <div className="text-[11px] text-emerald-700">احتساب التكرار كتعزيز أولوية</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500">الوفر التراكمي المقدر من إعادة السفلتة</div>
              <div className="text-2xl font-extrabold text-emerald-700 font-inter">1,400,000 ر.س</div>
              <div className="text-[11px] text-slate-400">بديلاً عن ترقيع 12 شهراً</div>
            </div>
          </div>
        </div>

        {/* 5. Quiet 3-Step Lifecycle Overview */}
        <div className="mt-12 text-center">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-6">
            دورة حياة البلاغ في منصة نبض
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-right">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
              <div className="text-xs font-bold text-[#0B3A5B] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0B3A5B] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>المواطن والمقيم يرصد</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                تحديد دقيق للموقع مع صورة توثيقية أو ترشيح الزيارة، مع تأكيد فوري إذا وُجد بلاغ سابق.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
              <div className="text-xs font-bold text-[#0B3A5B] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0B3A5B] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>المراقب الميداني يدقق ويسند</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                فحص فني واحتساب لتكاليف التأخير، وتطبيق ضوابط التكرار لإسناد الصيانة الروتينية أو التصعيد.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
              <div className="text-xs font-bold text-[#0B3A5B] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0B3A5B] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>القيادة تعتمد بحوكمة</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                استعراض مؤشرات الكثافة الحرارية وإصدار قرارات إعادة السفلتة للمقاول المتعاقد لتحقيق الوفر المالي.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Discreet Municipal Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200/80 py-6 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NabdLogo variant="compact" size="sm" showSubtitle={false} />
            <span className="text-slate-300">·</span>
            <span>أمانة المنطقة الشرقية · حاضرة الدمام</span>
          </div>
          <div>
            <span>جميع الحقوق محفوظة © أمانة المنطقة الشرقية 2026 · تدفق الدخول مصمَّم على النفاذ الوطني الموحد</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
