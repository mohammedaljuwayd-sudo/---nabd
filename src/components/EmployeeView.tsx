import React, { useState, useEffect } from 'react';
import { AuditLogEntry, Report, ReportStatus, User } from '../types/nabd';
import { nabdStore } from '../services/nabdStore';
import { NabdMap } from './NabdMap';
import { SmartAssistantPanel } from './SmartAssistantPanel';
import {
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  History,
  Lock,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
  XCircle,
  Zap,
  UserCheck,
  X,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building2,
  ChevronLeft,
} from 'lucide-react';

interface EmployeeViewProps {
  currentUser: User;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({ currentUser }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'audit'>('reports');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReportId, setSelectedReportId] = useState<string | null>('rep_004');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Contractor Completion Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState<boolean>(false);
  const [actualCost, setActualCost] = useState<number>(2400);
  const [donePhotoUrl, setDonePhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?w=600&auto=format&fit=crop&q=80'
  );

  const costRates = nabdStore.getCostRates();

  const refreshData = () => {
    setReports(nabdStore.getReportsForEmployee());
    setAuditLog(nabdStore.getAuditLog());
  };

  useEffect(() => {
    refreshData();
    const unsub = nabdStore.subscribe(refreshData);
    return unsub;
  }, []);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.caseNo.toLowerCase().includes(term) ||
        r.sectorName.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleOpenInspector = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsInspectorOpen(true);
  };

  const handleConfirm = (reportId: string) => {
    try {
      nabdStore.confirmReport(reportId, currentUser);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تأكيد البلاغ');
    }
  };

  const handleOpenReject = (reportId: string) => {
    setSelectedReportId(reportId);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedReport) return;
    try {
      nabdStore.rejectReport(selectedReport.id, rejectionReason, currentUser);
      setIsRejectModalOpen(false);
      setIsInspectorOpen(false);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء رفض البلاغ');
    }
  };

  const handleAssignRoutine = (reportId: string, isEmergency: boolean = false) => {
    try {
      nabdStore.assignRoutineMaintenance(
        reportId,
        'شركة اليمامة للمقاولات (عقد الصيانة الدورية)',
        currentUser,
        isEmergency
      );
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إسناد الصيانة');
    }
  };

  const handleOpenCompleteModal = (reportId: string) => {
    setSelectedReportId(reportId);
    const rep = reports.find((r) => r.id === reportId);
    if (rep?.type === 'lighting') setActualCost(900);
    else if (rep?.type === 'leak') setActualCost(6500);
    else setActualCost(2400);

    setIsCompleteModalOpen(true);
  };

  const handleConfirmCompletion = () => {
    if (!selectedReport) return;
    try {
      nabdStore.recordWorkDone({
        reportId: selectedReport.id,
        donePhotoUrl,
        actualCost: Number(actualCost),
        currentUser,
      });
      setIsCompleteModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تسجيل الإنجاز');
    }
  };

  const handleFieldInspectionClose = (reportId: string) => {
    try {
      nabdStore.closeReportWithInspection(reportId, currentUser);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء استلام الأعمال');
    }
  };

  const getBaseCost = (rep: Report) => {
    if (rep.type === 'lighting') return costRates.lighting;
    if (rep.type === 'leak') return costRates.leak;
    return costRates.potholePatch;
  };

  const currentBaseCost = selectedReport ? getBaseCost(selectedReport) : 2400;
  const costAfter30 = Math.round(currentBaseCost * costRates.delay30Multiplier);
  const costAfter90 = Math.round(currentBaseCost * costRates.delay90Multiplier);

  const recurrence = selectedReport?.recurrenceCount || 1;
  const isHighRecurrence =
    (selectedReport?.type === 'pothole' || selectedReport?.type === 'depression') &&
    recurrence >= costRates.potholeEscalationThreshold;

  return (
    <div className="space-y-5">
      {/* 1. SLEEK SMART ASSISTANT COPILOT */}
      <SmartAssistantPanel currentUser={currentUser} role="employee" />

      {/* 2. SUB-NAVIGATION TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-[#0B3A5B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>لوحة البلاغات والعمليات</span>
            <span className="bg-[#D4AF37] text-slate-950 font-inter text-[11px] font-bold px-2 py-0.5 rounded-full">
              {reports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-[#0B3A5B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل التدقيق الرقابي</span>
            <span className="bg-slate-100 text-slate-700 font-inter text-[11px] font-bold px-2 py-0.5 rounded-full">
              {auditLog.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden md:flex items-center gap-2 px-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>كافة صلاحيات التفتيش، الإسناد، والاستلام الميداني متاحة ومباشرة</span>
        </div>
      </div>

      {/* 3. FLUID WORKSPACE: MAP (7 cols) + FEED (5 cols) */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Operations Map Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0B3A5B]" />
                <span>الخريطة الميدانية لحاضرة الدمام</span>
              </span>
              <span className="text-[11px] text-slate-400">انقر على أي دبوس للمعاينة الفورية</span>
            </div>

            <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200/80">
              <NabdMap
                currentUser={currentUser}
                role="employee"
                reports={reports}
                selectedReportId={selectedReportId}
                onSelectReport={(id) => handleOpenInspector(id)}
              />
            </div>
          </div>

          {/* List Feed Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث برقم البلاغ، الحي، أو الوصف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B3A5B]"
                />
              </div>

              {/* Status Segmented Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {[
                  { key: 'all', label: 'الكل' },
                  { key: 'new', label: 'جديد' },
                  { key: 'confirmed', label: 'مؤكد' },
                  { key: 'assigned', label: 'محال' },
                  { key: 'done', label: 'منجز' },
                  { key: 'closed', label: 'مغلق' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      statusFilter === tab.key
                        ? 'bg-[#0B3A5B] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports Cards */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredReports.map((r) => {
                const isSelected = selectedReportId === r.id;
                const rec = r.recurrenceCount || 1;
                const isHigh =
                  (r.type === 'pothole' || r.type === 'depression') &&
                  rec >= costRates.potholeEscalationThreshold;

                return (
                  <div
                    key={r.id}
                    onClick={() => handleOpenInspector(r.id)}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-[#0B3A5B] ring-2 ring-[#0B3A5B]/15 bg-slate-50/50'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                          {r.donePhotoUrl || r.photoUrl ? (
                            <img
                              src={r.donePhotoUrl || r.photoUrl}
                              alt={r.caseNo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-1 text-slate-400">
                              <UserCheck className="w-5 h-5 mx-auto text-[#0B3A5B]" />
                              <span className="text-[8px] block">طلب مسّاح</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-inter font-bold text-xs text-[#0B3A5B]">
                              {r.caseNo}
                            </span>
                            <span className="text-xs text-slate-800 font-semibold">
                              {r.customTypeName ||
                                (r.type === 'pothole'
                                  ? 'حفرة أسفلتية'
                                  : r.type === 'depression'
                                  ? 'هبوط وتصدع'
                                  : r.type === 'lighting'
                                  ? 'عطل إنارة'
                                  : r.type === 'leak'
                                  ? 'تسريب مياه'
                                  : 'أرصفة')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{r.sectorName}</div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1">
                        {r.status === 'new' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            جديد
                          </span>
                        )}
                        {r.status === 'confirmed' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            مؤكد
                          </span>
                        )}
                        {r.status === 'assigned' && (
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            محال
                          </span>
                        )}
                        {r.status === 'done' && (
                          <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            منجز
                          </span>
                        )}
                        {r.status === 'closed' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            مغلق
                          </span>
                        )}
                        {r.status === 'rejected' && (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            مرفوض
                          </span>
                        )}

                        {rec > 1 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-inter ${
                              isHigh ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            تكرار: {rec}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">
                      {r.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOG TIMELINE */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">سجل التدقيق الرقابي غير القابل للتعديل</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توثيق كامل لكل انتقال للحالة والقرارات مع بصمة المستخدم والتوقيت الزمني
              </p>
            </div>
            <span className="text-xs font-bold text-[#0B3A5B] bg-slate-100 px-3 py-1 rounded-full font-inter">
              {auditLog.length} قيود مسجلة
            </span>
          </div>

          <div className="space-y-3">
            {auditLog.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-[#0B3A5B]">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{log.action} - {log.note}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      الصفة: {log.actorRole === 'citizen' ? 'مواطن' : log.actorRole === 'employee' ? 'مراقب ميداني' : 'صانع قرار'} · هوية:{' '}
                      {log.actorMaskedId}
                    </div>
                  </div>
                </div>

                <div className="text-left font-inter text-[11px] text-slate-400">
                  {new Date(log.timestamp).toLocaleString('ar-SA')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SLIDE-OVER INSPECTION DRAWER / MODAL */}
      {isInspectorOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] font-cairo animate-scaleUp">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#0B3A5B] to-[#16537E] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-inter font-bold text-sm text-[#D4AF37]">
                    {selectedReport.caseNo}
                  </span>
                  <span className="text-white/60">·</span>
                  <span className="text-xs font-semibold">{selectedReport.sectorName}</span>
                </div>
                <h3 className="text-base font-bold mt-0.5">لوحة الفحص والتدقيق الميداني</h3>
              </div>

              <button
                onClick={() => setIsInspectorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {/* Recurrence Escalation Warning */}
              {isHighRecurrence && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>تنبيه حوكمة: رصد تكرار حرج ({recurrence} بلاغات)</span>
                  </div>
                  <p className="text-[11px] text-red-800 leading-relaxed">
                    تم تجاوز عتبة الترقيع الروتيني ({costRates.potholeEscalationThreshold} حفر).
                    يخضع هذا النطاق لحسابات الجدوى الاقتصادية لنقله لصانع القرار لإعادة السفلتة الشاملة.
                  </p>
                </div>
              )}

              {/* Photos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">توثيق البلاغ الأولي:</span>
                  <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {selectedReport.photoUrl ? (
                      <img
                        src={selectedReport.photoUrl}
                        alt="توثيق أولي"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <UserCheck className="w-8 h-8 mx-auto text-[#0B3A5B] mb-1" />
                        <span className="text-xs block font-bold">طلب فحص مسّاح</span>
                        <span className="text-[10px] block mt-0.5">{selectedReport.fieldVisitReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">توثيق إنجاز المقاول:</span>
                  <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {selectedReport.donePhotoUrl ? (
                      <img
                        src={selectedReport.donePhotoUrl}
                        alt="إنجاز المقاول"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <Clock className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                        <span className="text-xs block font-bold">بانتظار إنجاز الأعمال</span>
                        <span className="text-[10px] block mt-0.5">لم يتم رفع صورة الإصلاح بعد</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statement */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                <span className="text-slate-400 text-[11px] block">وصف البلاغ من المستفيد:</span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedReport.description}
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  مقدم البلاغ: {selectedReport.createdMaskedId} · الإحداثيات:{' '}
                  {selectedReport.lat.toFixed(5)}, {selectedReport.lng.toFixed(5)}
                </div>
              </div>

              {/* Delay Cost Governance Table */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0B3A5B]" />
                  <span>حوكمة التكاليف ومخاطر تأخير المعالجة</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">التكلفة الفورية</span>
                    <span className="font-inter font-bold text-sm text-[#0B3A5B]">
                      {currentBaseCost.toLocaleString()} ر.س
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[10px] text-amber-800 block">بعد 30 يوماً (+40%)</span>
                    <span className="font-inter font-bold text-sm text-amber-900">
                      {costAfter30.toLocaleString()} ر.س
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                    <span className="text-[10px] text-red-800 block">بعد 90 يوماً (+120%)</span>
                    <span className="font-inter font-bold text-sm text-red-900">
                      {costAfter90.toLocaleString()} ر.س
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                إغلاق اللوحة
              </button>

              <div className="flex items-center gap-2">
                {selectedReport.status === 'new' && (
                  <>
                    <button
                      onClick={() => handleOpenReject(selectedReport.id)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
                    >
                      رفض مع ذكر السبب
                    </button>
                    <button
                      onClick={() => handleConfirm(selectedReport.id)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0B3A5B] hover:bg-[#16537E] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>تأكيد واعتماد البلاغ</span>
                    </button>
                  </>
                )}

                {selectedReport.status === 'confirmed' && (
                  <button
                    onClick={() => handleAssignRoutine(selectedReport.id, false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>إسناد أمر عمل للمقاول المتعاقد</span>
                  </button>
                )}

                {selectedReport.status === 'assigned' && (
                  <button
                    onClick={() => handleOpenCompleteModal(selectedReport.id)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>تسجيل إنجاز المقاول الفعلي</span>
                  </button>
                )}

                {selectedReport.status === 'done' && (
                  <button
                    onClick={() => handleFieldInspectionClose(selectedReport.id)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>الفحص الميداني واعتماد الإغلاق النهائي</span>
                  </button>
                )}

                {selectedReport.status === 'closed' && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                    ✓ البلاغ مغلق ومفحوص ميدانياً بالكامل
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-cairo">
            <h4 className="font-bold text-sm text-slate-900">رفض البلاغ ({selectedReport.caseNo})</h4>
            <p className="text-xs text-slate-500">
              يتطلب رفض البلاغ تسجيلاً مسبباً لحفظ حقوق المستفيد في سجل التدقيق الرقابي.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="اكتب سبب الرفض الفني أو خروج الموقع عن نطاق اختصاص الأمانة..."
              className="w-full p-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0B3A5B]"
              required
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white disabled:opacity-40 cursor-pointer"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {isCompleteModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-cairo">
            <h4 className="font-bold text-sm text-slate-900">
              تسجيل إنجاز المقاول ({selectedReport.caseNo})
            </h4>
            <p className="text-xs text-slate-500">
              يتطلب تحويل البلاغ إلى (منجز) إرفاق صورة بعد الإصلاح وإدخال التكلفة الفعلية.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التكلفة الفعلية للأعمال (ر.س):
              </label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-inter"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                صورة توثيق الإنجاز بعد الإصلاح:
              </label>
              <img
                src={donePhotoUrl}
                alt="توثيق الإنجاز"
                className="w-full h-32 object-cover rounded-xl border border-slate-200"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmCompletion}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white cursor-pointer"
              >
                تثبيت الإنجاز
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
