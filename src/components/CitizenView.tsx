import React, { useState, useEffect } from 'react';
import {
  PublicReportPin,
  Report,
  ReportType,
  User,
} from '../types/nabd';
import { nabdStore, DAMMAM_SECTORS } from '../services/nabdStore';
import { NabdMap } from './NabdMap';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Upload,
  Layers,
  Sparkles,
  Info,
  Building2,
  UserCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CitizenViewProps {
  currentUser: User;
}

// Damage Categories with Frequency ranking + "أخرى" right beside them
const DAMAGE_CATEGORIES: Array<{
  type: ReportType;
  label: string;
  badge?: string;
  icon: string;
}> = [
  { type: 'pothole', label: 'حفرة أسفلتية', badge: 'الأكثر تكراراً', icon: '⚠️' },
  { type: 'depression', label: 'هبوط أسفلتي وتصدع', badge: 'متكرر', icon: '🕳️' },
  { type: 'lighting', label: 'عطل عمود إنارة', badge: 'متكرر', icon: '💡' },
  { type: 'leak', label: 'تسريب وتجمع مياه', badge: 'شائع', icon: '💧' },
  { type: 'sidewalk', label: 'أرصفة وبردورات متهالكة', icon: '🚧' },
  { type: 'other', label: 'أخرى (حدد نوع الضرر)', icon: '✍️' },
];

const DAMAGE_PHOTO_CATALOG = [
  {
    label: 'حفرة أسفلتية عميقة (وسط الدمام)',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
    type: 'pothole' as ReportType,
  },
  {
    label: 'تآكل أسفلتي وتشقق (شارع 18)',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    type: 'pothole' as ReportType,
  },
  {
    label: 'عمود إنارة معطل (الفيصلية)',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    type: 'lighting' as ReportType,
  },
  {
    label: 'تدفق مياه على الرصيف (الشاطئ)',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    type: 'leak' as ReportType,
  },
];

export const CitizenView: React.FC<CitizenViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'my_reports'>('create');

  const [myReports, setMyReports] = useState<Report[]>([]);
  const [publicPins, setPublicPins] = useState<PublicReportPin[]>([]);

  // Form State
  const [selectedType, setSelectedType] = useState<ReportType>('pothole');
  const [customTypeName, setCustomTypeName] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 26.4343,
    lng: 50.1029,
  });
  const [description, setDescription] = useState<string>(
    'حفرة عميقة في المسار الأوسط تسبب ارتباكاً مرورياً وتضر بالمركبات قرب تقاطع شارع 18.'
  );

  // Documentation Mode: Photo vs Field Visit Nomination
  const [docMode, setDocMode] = useState<'photo' | 'field_visit'>('photo');
  const [photoUrl, setPhotoUrl] = useState<string>(DAMAGE_PHOTO_CATALOG[0].url);
  const [fieldVisitReason, setFieldVisitReason] = useState<string>(
    'حجم ملف الصورة كبير ويتعذر الرفع'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successCaseNo, setSuccessCaseNo] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Proximity Alert Check
  const [proximityCheck, setProximityCheck] = useState<{
    found: boolean;
    distance: number;
    existingCaseNo?: string;
  }>({ found: false, distance: Infinity });

  const refreshData = () => {
    const data = nabdStore.getReportsForCitizen(currentUser);
    setMyReports(data.myReports);
    setPublicPins(data.publicPins);
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = nabdStore.subscribe(refreshData);
    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    const res = nabdStore.findNearbySimilar(coords.lat, coords.lng, selectedType);
    setProximityCheck(res);
  }, [coords, selectedType]);

  const handlePickLocation = (newCoords: { lat: number; lng: number }) => {
    setCoords(newCoords);
  };

  const handleSelectDistrict = (sectorId: string) => {
    const sec = DAMMAM_SECTORS.find((s) => s.id === sectorId);
    if (sec) {
      setCoords({ lat: sec.center[0], lng: sec.center[1] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    if (selectedType === 'other' && !customTypeName.trim()) {
      alert('يرجى تحديد وتسمية نوع الضرر في حقل (أخرى)');
      return;
    }

    setIsSubmitting(true);
    try {
      const isFieldVisitNominated = docMode === 'field_visit';
      const created = nabdStore.createReport({
        type: selectedType,
        customTypeName: selectedType === 'other' ? customTypeName.trim() : undefined,
        lat: coords.lat,
        lng: coords.lng,
        description: description.trim(),
        photoUrl: isFieldVisitNominated ? undefined : photoUrl || DAMAGE_PHOTO_CATALOG[0].url,
        requiresFieldVisit: isFieldVisitNominated,
        fieldVisitReason: isFieldVisitNominated ? fieldVisitReason : undefined,
        currentUser,
      });

      setSuccessCaseNo(created.caseNo);
      setActiveTab('my_reports');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تسجيل البلاغ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = (status: Report['status']) => {
    switch (status) {
      case 'new':
        return 1;
      case 'confirmed':
        return 2;
      case 'assigned':
        return 3;
      case 'done':
        return 4;
      case 'closed':
        return 5;
      default:
        return 0;
    }
  };

  const STEPS_LABELS = [
    { num: 1, label: 'جديد ومسجل' },
    { num: 2, label: 'مطابقة وتأكيد' },
    { num: 3, label: 'إسناد للمقاول' },
    { num: 4, label: 'إنجاز الإصلاح' },
    { num: 5, label: 'فحص ميداني ومغلق' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Sleek Navigation Segment */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-[#0B3A5B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل بلاغ جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('my_reports')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'my_reports'
                ? 'bg-[#0B3A5B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>بلاغاتي ومتابعة الإنجاز</span>
            {myReports.length > 0 && (
              <span className="bg-[#D4AF37] text-slate-950 font-inter text-[11px] font-bold px-2 py-0.5 rounded-full">
                {myReports.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden md:flex items-center gap-2 px-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>الخصوصية مضمونة: بلاغاتك فقط تظهر بهويتك، وبلاغات الحي مجردة تماماً</span>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {successCaseNo && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-bold">
                تم تسجيل بلاغك بنجاح برقم قيد: {successCaseNo}
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                تم توجيه البلاغ مباشرة لمركز العمليات الميدانية، ويمكنك متابعة مراحل المعالجة في تبويب بلاغاتي.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessCaseNo(null)}
            className="text-xs text-emerald-700 font-semibold underline cursor-pointer shrink-0"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* TAB 1: CREATE NEW REPORT */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Map Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0B3A5B]" />
                <span className="text-xs font-bold text-slate-900">
                  حدد موقع الضرر على خريطة حاضرة الدمام
                </span>
              </div>

              {/* Quick district buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px]">مواقع سريعة:</span>
                <button
                  type="button"
                  onClick={() => setCoords({ lat: 26.4343, lng: 50.1029 })}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0B3A5B] cursor-pointer transition-colors"
                >
                  شارع 18
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDistrict('sec_faisaliyah')}
                  className="text-xs font-medium px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                >
                  الفيصلية
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDistrict('sec_shati')}
                  className="text-xs font-medium px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                >
                  الشاطئ
                </button>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="h-[460px] rounded-2xl overflow-hidden border border-slate-200/80">
              <NabdMap
                currentUser={currentUser}
                role="citizen"
                myReports={myReports}
                publicPins={publicPins}
                isPickingLocation={true}
                pickedLocation={coords}
                onPickLocation={handlePickLocation}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="font-inter">
                الإحداثيات: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </span>
              <span className="text-slate-400">فحص تلقائي لتكرار الأعطال ضمن 70 متراً</span>
            </div>
          </div>

          {/* Form Column (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">تفاصيل البلاغ الميداني</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  أدخل نوع العطل، والوصف، وطريقة التوثيق لمباشرة الصيانة
                </p>
              </div>

              {/* Proximity Alert Notice */}
              {proximityCheck.found && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl text-amber-950 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>يوجد بلاغ مماثل في نفس النطاق (70 متراً)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    بلاغك سيُحتسب تأكيداً فورياً للبلاغ ({proximityCheck.existingCaseNo}) على بعد{' '}
                    <strong>{proximityCheck.distance} متراً</strong>، مما يرفع مؤشر التكرار ويسرع
                    إصدار أمر إعادة السفلتة.
                  </p>
                </div>
              )}

              {/* 1. DAMAGE CATEGORIES (الأكثر تكراراً + أخرى بجانبها) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  نوع العطل أو المرفق:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DAMAGE_CATEGORIES.map((cat) => {
                    const isSelected = selectedType === cat.type;
                    return (
                      <button
                        key={cat.type}
                        type="button"
                        onClick={() => setSelectedType(cat.type)}
                        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#0B3A5B] text-white border-[#0B3A5B] shadow-xs'
                            : 'bg-slate-50/80 text-slate-800 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{cat.icon}</span>
                          {cat.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                isSelected
                                  ? 'bg-[#D4AF37] text-slate-950'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold mt-2">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* If "أخرى" selected, show smooth text field */}
                {selectedType === 'other' && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      حدد مسمى الضرر أو العطل:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: غطاء غرفة تفتيش، حاجز خرساني مكسور..."
                      value={customTypeName}
                      onChange={(e) => setCustomTypeName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B3A5B]"
                      required
                    />
                  </div>
                )}
              </div>

              {/* 2. DESCRIPTION */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  وصف مختصر للموقع والملاحظة:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="صف تفاصيل المشكلة وموقعها على الطريق أو الرصيف..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0B3A5B] transition-colors leading-relaxed"
                  required
                />
              </div>

              {/* 3. FIELD DOCUMENTATION: PHOTO VS FIELD VISIT NOMINATION */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  التوثيق الميداني:
                </label>

                {/* Segmented Switch */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setDocMode('photo')}
                    className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      docMode === 'photo'
                        ? 'bg-white text-[#0B3A5B] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>إرفاق صورة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocMode('field_visit')}
                    className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      docMode === 'field_visit'
                        ? 'bg-white text-[#0B3A5B] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>ترشيح لزيارة ميدانية</span>
                  </button>
                </div>

                {docMode === 'photo' ? (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-100 flex items-center justify-center">
                      <img
                        src={photoUrl}
                        alt="توثيق الضرر"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-bold gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>تم تجهيز الصورة التوثيقية</span>
                      </div>
                    </div>

                    {/* Quick sample pickers */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      <span className="text-slate-400 shrink-0">نماذج صور:</span>
                      {DAMAGE_PHOTO_CATALOG.map((cat, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoUrl(cat.url)}
                          className={`px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap cursor-pointer transition-colors ${
                            photoUrl === cat.url
                              ? 'bg-[#0B3A5B] text-white border-[#0B3A5B]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cat.label.split('(')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      طلب توجيه مراقب مسّاح للمعاينة الميدانية
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      يُستخدم إذا كان حجم الصورة كبيراً، أو تعذر التصوير لأسباب السلامة أثناء القيادة.
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        سبب تعذر إرفاق الصورة:
                      </label>
                      <select
                        value={fieldVisitReason}
                        onChange={(e) => setFieldVisitReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                      >
                        <option value="حجم ملف الصورة كبير ويتعذر الرفع">حجم ملف الصورة كبير ويتعذر الرفع</option>
                        <option value="تعذر التصوير أثناء قيادة المركبة للسلامة">تعذر التصوير أثناء قيادة المركبة للسلامة</option>
                        <option value="ضعف التغطية أو الاتصال بشبكة الإنترنت">ضعف التغطية أو الاتصال بشبكة الإنترنت</option>
                        <option value="الضرر يتطلب فحصاً مساحياً دقيقاً">الضرر يتطلب فحصاً مساحياً دقيقاً</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0B3A5B] hover:bg-[#16537E] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>جارٍ تسجيل البلاغ...</span>
                ) : (
                  <>
                    <span>تسجيل وإرسال البلاغ</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: MY REPORTS & 5-STAGE PROGRESS TRACKER */}
      {activeTab === 'my_reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">سجل بلاغاتي ومتابعة الإنجاز</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع مسار البلاغات عبر شريط الإنجاز المعتمد من 5 مراحل
              </p>
            </div>
            <span className="text-xs font-bold text-[#0B3A5B] bg-slate-100 px-3 py-1 rounded-full font-inter">
              {myReports.length} بلاغات مسجلة
            </span>
          </div>

          {myReports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">لا توجد بلاغات مسجلة حتى الآن</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                يمكنك التبديل إلى تبويب "تسجيل بلاغ جديد" والإبلاغ عن أي ملاحظة في حاضرة الدمام.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-5 py-2 rounded-xl bg-[#0B3A5B] text-white text-xs font-bold cursor-pointer"
              >
                تسجيل بلاغ جديد الآن
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myReports.map((report) => {
                const currentStep = getStepProgress(report.status);
                const isExpanded = expandedReportId === report.id;

                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs transition-all space-y-4"
                  >
                    {/* Top Row: Case info & status badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-base text-[#0B3A5B]">
                          {report.type === 'pothole'
                            ? '⚠️'
                            : report.type === 'lighting'
                            ? '💡'
                            : report.type === 'leak'
                            ? '💧'
                            : '🚧'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#0B3A5B] font-inter">
                              {report.caseNo}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs font-bold text-slate-800">
                              {report.customTypeName ||
                                (report.type === 'pothole'
                                  ? 'حفرة أسفلتية'
                                  : report.type === 'lighting'
                                  ? 'عطل إنارة'
                                  : report.type === 'leak'
                                  ? 'تسريب مياه'
                                  : 'أرصفة وبردورات')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {report.sectorName} · تم التسجيل:{' '}
                            {new Date(report.createdAt).toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            report.status === 'closed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : report.status === 'done'
                              ? 'bg-teal-100 text-teal-800'
                              : report.status === 'assigned'
                              ? 'bg-purple-100 text-purple-800'
                              : report.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {report.status === 'new' && 'قيد التدقيق الأولي'}
                          {report.status === 'confirmed' && 'مؤكد ومجدول'}
                          {report.status === 'assigned' && 'محال للمقاول'}
                          {report.status === 'done' && 'تم إنجاز الصيانة'}
                          {report.status === 'closed' && 'مغلق بعد الفحص الميداني'}
                          {report.status === 'rejected' && 'مرفوض'}
                        </span>

                        <button
                          onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 5-STAGE PROGRESS BAR (Connected and Smooth) */}
                    <div className="pt-2 pb-1">
                      <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                        {/* Connecting Line */}
                        <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 z-0" />
                        <div
                          className="absolute top-3.5 right-4 h-0.5 bg-emerald-600 transition-all duration-500 z-0"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((currentStep - 1) / 4) * 100))}%`,
                          }}
                        />

                        {/* Step Nodes */}
                        {STEPS_LABELS.map((step) => {
                          const isDone = currentStep >= step.num;
                          const isCurrent = currentStep === step.num;

                          return (
                            <div
                              key={step.num}
                              className="relative z-10 flex flex-col items-center gap-1.5 text-center"
                            >
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white border-2 border-slate-300 text-slate-400'
                                } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <span className="font-inter text-[10px]">{step.num}</span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-semibold whitespace-nowrap ${
                                  isDone ? 'text-slate-900 font-bold' : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fadeIn">
                        <div>
                          <div className="font-bold text-slate-700 mb-1">بيان البلاغ:</div>
                          <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl">
                            {report.description}
                          </p>

                          {report.requiresFieldVisit && (
                            <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                              <strong>طلب زيارة ميدانية:</strong> {report.fieldVisitReason}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-slate-700 mb-1">التوثيق الميداني:</div>
                          <div className="flex gap-2">
                            {report.photoUrl && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 block">قبل الإصلاح</span>
                                <img
                                  src={report.photoUrl}
                                  alt="قبل"
                                  className="w-24 h-20 object-cover rounded-xl border border-slate-200"
                                />
                              </div>
                            )}
                            {report.donePhotoUrl && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-emerald-600 font-bold block">
                                  بعد إنجاز المقاول
                                </span>
                                <img
                                  src={report.donePhotoUrl}
                                  alt="بعد"
                                  className="w-24 h-20 object-cover rounded-xl border border-emerald-300"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
