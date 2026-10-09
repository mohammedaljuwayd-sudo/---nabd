import React, { useState, useEffect } from 'react';
import { Activity, Bell, Radio, Zap, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

const LIVE_EVENTS = [
  { text: 'رصد بلاغ جديد: حفرة أسفلتية بشارع 18 (وسط الدمام)', time: 'الآن', tag: 'بلاغ مباشر' },
  { text: 'فحص ميداني منجز: صيانة إنارة بحي الفيصلية', time: 'قبل دقيقتين', tag: 'إنجاز ميداني' },
  { text: 'حوكمة آلية: رصد تكرار 4 حفر بوسط الدمام - ترشيح لإعادة السفلتة', time: 'قبل 5 دقائق', tag: 'خوارزمية نبض' },
  { text: 'تحرك فرقة الصيانة السريعة: معالجة تجمع مياه بطريق الشاطئ', time: 'قبل 8 دقائق', tag: 'استجابة سريعة' },
  { text: 'إسناد أمر عمل للمقاول المتعاقد رقم WO-8921', time: 'قبل 11 دقيقة', tag: 'أمر عمل' },
];

export const LiveOperationsTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = LIVE_EVENTS[currentIndex];

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 px-4 sm:px-8 py-2 text-xs flex items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-3 overflow-hidden max-w-3xl">
        {/* Soft Live Indicator */}
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>مباشر</span>
        </div>

        {/* Dynamic Event text */}
        <div className="flex items-center gap-2 truncate text-slate-700">
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {current.tag}
          </span>
          <span className="truncate text-xs font-medium text-slate-800">{current.text}</span>
          <span className="text-slate-400 font-inter text-[11px] shrink-0">({current.time})</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-500 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-slate-700 font-medium">28 فرقة رقابة نشطة</span>
        </div>
        <span className="text-slate-300">·</span>
        <div className="flex items-center gap-1.5">
          <span>متوسط الاستجابة:</span>
          <strong className="text-slate-800 font-inter font-semibold">18 دقيقة</strong>
        </div>
      </div>
    </div>
  );
};
