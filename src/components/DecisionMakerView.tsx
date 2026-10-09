import React, { useState, useEffect } from 'react';
import { SectorAggregate, User } from '../types/nabd';
import { nabdStore } from '../services/nabdStore';
import { NabdMap } from './NabdMap';
import { SmartAssistantPanel } from './SmartAssistantPanel';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  Flame,
  Layers,
  Lock,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
  Sliders,
  ArrowRight,
  Building2,
} from 'lucide-react';

interface DecisionMakerViewProps {
  currentUser: User;
  onOpenSettings: () => void;
}

export const DecisionMakerView: React.FC<DecisionMakerViewProps> = ({
  currentUser,
  onOpenSettings,
}) => {
  const [aggregates, setAggregates] = useState<{
    topMetrics: {
      totalConfirmed: number;
      pendingDecisions: number;
      referredToContractor: number;
    };
    sectors: SectorAggregate[];
    heatmapPoints: [number, number, number][];
  }>({
    topMetrics: { totalConfirmed: 0, pendingDecisions: 0, referredToContractor: 0 },
    sectors: [],
    heatmapPoints: [],
  });

  const [highlightSectorId, setHighlightSectorId] = useState<string | null>('sec_central');
  const [approvalSuccessMsg, setApprovalSuccessMsg] = useState<string | null>(null);

  const costRates = nabdStore.getCostRates();

  const refreshData = () => {
    setAggregates(nabdStore.getDecisionMakerAggregates());
  };

  useEffect(() => {
    refreshData();
    const unsub = nabdStore.subscribe(refreshData);
    return unsub;
  }, []);

  const handleApproveResurfacing = (sectorId: string, sectorName: string) => {
    try {
      const order = nabdStore.approveSectorResurfacing(sectorId, currentUser);
      setApprovalSuccessMsg(
        `تم بنجاح اعتماد وإحالة إعادة سفلتة ${sectorName} للمقاول المتعاقد بموجب أمر العمل (${order.workOrderNo}).`
      );
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء اعتماد القرار');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. SMART ASSISTANT COPILOT */}
      <SmartAssistantPanel currentUser={currentUser} role="decision_maker" />

      {/* 2. EXECUTIVE BRIEFING BAR (Airy, Light, High-End GovTech Look) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 font-cairo">
                منظومة القيادة البلدية والاستثمار الذكي في أصول الطرق
              </h2>
              <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                مستوى وكيل الأمانة
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              حوكمة صارمة وعزل بيانات كامل: تُعرض مجاميع ومؤشرات قطاعية فقط لحماية الخصوصية ومنع
              التعامل مع البلاغات الفردية على المستوى القيادي.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenSettings}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>لوائح وضوابط التكاليف</span>
          </button>
        </div>
      </div>

      {/* APPROVAL SUCCESS BANNER */}
      {approvalSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-xs font-bold leading-relaxed">{approvalSuccessMsg}</div>
          </div>
          <button
            onClick={() => setApprovalSuccessMsg(null)}
            className="text-xs text-emerald-700 underline font-medium cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* 3. THREE TOP KPI METRIC CARDS (Spacious, Crisp Numbers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">إجمالي البلاغات المؤكدة بحاضرة الدمام</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0B3A5B] font-inter">
              {aggregates.topMetrics.totalConfirmed}
            </div>
            <div className="text-[11px] text-slate-400">عبر كافة قطاعات وأحياء الحاضرة</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0B3A5B] flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">قرارات بانتظار الاعتماد (عتبة ≥80%)</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-red-600 font-inter">
              {aggregates.topMetrics.pendingDecisions}
            </div>
            <div className="text-[11px] text-red-600 font-medium">
              قطاعات ترجح الجدوى الاقتصادية لإعادة السفلتة
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">بلاغات محالة للمقاول المتعاقد</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-inter">
              {aggregates.topMetrics.referredToContractor}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              أوامر عمل نشطة قيد التنفيذ الميداني
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. HEATMAP GEOSPATIAL MAP SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" />
            <h3 className="text-xs font-bold text-slate-900">
              الخريطة الحرارية لكثافة الأضرار وتركّز الحفر بحاضرة الدمام
            </h3>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>اللون الداكن يوضح البؤر الحرجة عالية التكرار</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          </div>
        </div>

        <div className="h-80 rounded-2xl overflow-hidden border border-slate-200/80">
          <NabdMap
            currentUser={currentUser}
            role="decision_maker"
            heatmapPoints={aggregates.heatmapPoints}
            highlightSectorId={highlightSectorId}
          />
        </div>
      </div>

      {/* 5. SECTOR EVALUATION & ACTION CARDS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#D4AF37]" />
            <span>تقييم القطاعات وقرارات إعادة السفلتة (معيار الـ 80%)</span>
          </h3>
          <span className="text-xs text-slate-500">
            المعادلة: الترقيع المتوقع (12 شهر) = عدد الحفر × {costRates.potholePatch.toLocaleString()} × 4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {aggregates.sectors.map((sec) => {
            const isResurface = sec.ratio >= 0.8;
            const percentage = Math.round(sec.ratio * 100);

            return (
              <div
                key={sec.sectorId}
                onMouseEnter={() => setHighlightSectorId(sec.sectorId)}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-xs hover:shadow-md space-y-4 ${
                  isResurface
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 bg-amber-50/15'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Sector Header */}
                <div className="pb-3 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <span className="font-inter text-[10px] text-slate-400 block font-semibold">
                      {sec.sectorCode}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{sec.sectorName}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isResurface
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    أولوية: {sec.priorityLevel}
                  </span>
                </div>

                {/* Counts Summary */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">حفر مؤكدة</span>
                    <span className="font-inter font-bold text-sm text-[#0B3A5B]">
                      {sec.confirmedPotholesCount}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">أعطال أخرى</span>
                    <span className="font-inter font-bold text-sm text-slate-700">
                      {sec.confirmedLightingCount + sec.confirmedLeakCount}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">نسبة التكلفة</span>
                    <span
                      className={`font-inter font-bold text-sm ${
                        isResurface ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Costs Comparison */}
                <div className="space-y-1.5 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">الترقيع المتوقع (12 شهراً):</span>
                    <span className="font-inter font-bold text-slate-800">
                      {sec.expectedPatching12m.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">تكلفة إعادة السفلتة الشاملة:</span>
                    <span className="font-inter font-bold text-[#0B3A5B]">
                      {sec.resurfacingCost.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">الوفر المتحقق:</span>
                    <span className="text-amber-800 font-bold">قيد القياس</span>
                  </div>
                </div>

                {/* System Recommendation */}
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                    isResurface
                      ? 'bg-amber-100/70 text-amber-950 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{sec.recommendation}</span>
                </div>

                {/* Approval Action Button */}
                <button
                  onClick={() => handleApproveResurfacing(sec.sectorId, sec.sectorName)}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                    isResurface
                      ? 'bg-[#0B3A5B] hover:bg-[#16537E] text-white hover:shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>اعتماد وإحالة للمقاول المتعاقد</span>
                  <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
