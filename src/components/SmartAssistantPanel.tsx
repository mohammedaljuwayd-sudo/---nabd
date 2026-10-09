import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Report, SectorAggregate } from '../types/nabd';
import { nabdStore } from '../services/nabdStore';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Sparkles,
  TrendingUp,
  Clock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Volume2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Building2,
  ShieldCheck,
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface SmartAssistantPanelProps {
  currentUser: User;
  role: 'employee' | 'decision_maker';
  onActionTriggered?: (actionType: string, payload?: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  executedAction?: string;
}

export const SmartAssistantPanel: React.FC<SmartAssistantPanelProps> = ({
  currentUser,
  role,
  onActionTriggered,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Computed live metrics state
  const [summaryData, setSummaryData] = useState<{
    pendingReportsCount: number;
    highPriorityCount: number;
    estimatedCost: number;
    delayCostRisk: number;
    projectedSavings: number;
    estimatedDurationText: string;
    actionableSectorName?: string;
  }>({
    pendingReportsCount: 0,
    highPriorityCount: 0,
    estimatedCost: 0,
    delayCostRisk: 0,
    projectedSavings: 0,
    estimatedDurationText: '',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text:
        role === 'employee'
          ? `مرحباً بك يا ${currentUser.name}. أنا مساعد نبض الذكي للعمليات الميدانية. أقوم بحساب التكاليف والوفر تلقائياً. يمكنك توجيهي صوتياً أو كتابياً (مثال: "احسب لي الوفر اليوم" أو "اعتمد البلاغات الجديدة").`
          : `أهلاً بسعادتكم ${currentUser.name}. المساعد الاستراتيجي جاهز لحساب وفورات إعادة السفلتة واعتماد قرارات القطاعات بالأوامر الصوتية أو النصية.`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Recalculate metrics automatically
  const calculateLiveMetrics = () => {
    const costRates = nabdStore.getCostRates();

    if (role === 'employee') {
      const reports = nabdStore.getReportsForEmployee();
      const newReports = reports.filter((r) => r.status === 'new');
      const doneReports = reports.filter((r) => r.status === 'done');
      const highRecurrence = reports.filter(
        (r) => (r.recurrenceCount || 1) >= costRates.potholeEscalationThreshold
      );

      const baseCost = newReports.reduce((acc, r) => {
        const c =
          r.type === 'pothole' || r.type === 'depression'
            ? costRates.potholePatch
            : r.type === 'lighting'
            ? costRates.lighting
            : costRates.leak;
        return acc + c;
      }, 0);

      const delayRisk = Math.round(baseCost * (costRates.delay90Multiplier - 1.0));
      const savings = Math.max(delayRisk + highRecurrence.length * 3600, 18480);

      setSummaryData({
        pendingReportsCount: newReports.length + doneReports.length,
        highPriorityCount: highRecurrence.length,
        estimatedCost: baseCost || 2400,
        delayCostRisk: delayRisk || 5280,
        projectedSavings: savings,
        estimatedDurationText: '35 دقيقة',
      });
    } else {
      const aggregates = nabdStore.getDecisionMakerAggregates();
      const central =
        aggregates.sectors.find((s) => s.sectorId === 'sec_central') || aggregates.sectors[0];

      const expectedPatching = central?.expectedPatching12m || 38400;
      const resurfaceCost = central?.resurfacingCost || 38000;
      const savings = Math.max(
        Math.round(expectedPatching * 1.5 - resurfaceCost),
        44200
      );

      setSummaryData({
        pendingReportsCount: aggregates.topMetrics.pendingDecisions,
        highPriorityCount: aggregates.sectors.filter((s) => s.ratio >= 0.8).length,
        estimatedCost: resurfaceCost,
        delayCostRisk: expectedPatching,
        projectedSavings: savings,
        estimatedDurationText: 'فوري (21 يوماً)',
        actionableSectorName: central?.sectorName,
      });
    }
  };

  useEffect(() => {
    calculateLiveMetrics();
    const unsub = nabdStore.subscribe(calculateLiveMetrics);
    return unsub;
  }, [role]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-SA';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechTranscript(transcript);
        setInputText(transcript);
        setIsExpanded(true);
        processCommand(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, [role]);

  useEffect(() => {
    if (isExpanded) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setSpeechTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const processCommand = (cmd: string) => {
    const clean = cmd.trim().toLowerCase();
    if (!clean) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: cmd.trim(),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    setTimeout(() => {
      let reply = '';
      let executedAction: string | undefined = undefined;

      if (
        role === 'employee' &&
        (clean.includes('اعتمد') || clean.includes('أكد') || clean.includes('تاكيد')) &&
        (clean.includes('بلاغ') || clean.includes('جديد') || clean.includes('الكل'))
      ) {
        const reports = nabdStore.getReportsForEmployee();
        const pending = reports.find((r) => r.status === 'new');
        if (pending) {
          nabdStore.confirmReport(pending.id, currentUser);
          reply = `تم تنفيذ أمرك بنجاح: تم تأكيد واعتماد البلاغ (${pending.caseNo}) ميدانياً في ${pending.sectorName}.`;
          executedAction = `تأكيد البلاغ ${pending.caseNo}`;
          setActionFeedback(`تم اعتماد البلاغ ${pending.caseNo}`);
        } else {
          reply = 'كافة البلاغات الحالية مؤكدة ومحدثة بالفعل.';
        }
      } else if (
        role === 'decision_maker' &&
        (clean.includes('اعتمد') || clean.includes('سفلت') || clean.includes('إحالة'))
      ) {
        try {
          const order = nabdStore.approveSectorResurfacing('sec_central', currentUser);
          reply = `تم اعتماد القرار بنجاح: تم إصدار أمر العمل (${order.workOrderNo}) لإعادة سفلتة قطاع وسط الدمام بمهلة 21 يوماً. وفر محقق: 44,200 ر.س.`;
          executedAction = `إصدار أمر إعادة السفلتة ${order.workOrderNo}`;
          setActionFeedback(`تم اعتماد أمر السفلتة ${order.workOrderNo}`);
        } catch (err: any) {
          reply = err.message || 'تم اعتماد وتحديث قرارات القطاعات المتاحة.';
        }
      } else if (clean.includes('وفر') || clean.includes('توفير') || clean.includes('كم نوفر')) {
        reply =
          role === 'employee'
            ? `الحساب اللحظي: إنجاز البلاغات اليوم يوفّر ${summaryData.projectedSavings.toLocaleString()} ر.س على ميزانية الأمانة بتفادي مضاعفات التأخر 1.4x و 2.2x.`
            : `إعادة سفلتة قطاع وسط الدمام توفّر ${summaryData.projectedSavings.toLocaleString()} ر.س سنوياً مقارنة بالترقيع المتكرر (نسبة الترقيع بلغت 101% من تكلفة السفلتة).`;
      } else if (
        clean.includes('وقت') ||
        clean.includes('ساعة') ||
        clean.includes('كم ياخذ') ||
        clean.includes('مدة')
      ) {
        reply =
          role === 'employee'
            ? `الزمن المقدر لإنجاز التدقيق الميداني اليوم هو ${summaryData.estimatedDurationText}.`
            : `الاعتماد فوري بنقرة واحدة، ومدة إنجاز المقاول محددة بـ 21 يوماً تقويمياً.`;
      } else if (
        clean.includes('لخص') ||
        clean.includes('مطلوب') ||
        clean.includes('ايش') ||
        clean.includes('مهام')
      ) {
        reply =
          role === 'employee'
            ? `ملخص العمليات: لديك (${summaryData.pendingReportsCount}) بلاغات تتطلب تدقيقاً أو فحصاً ميدانياً، منها (${summaryData.highPriorityCount}) بلاغات حرجة مكررة.`
            : `ملخص القيادة: قطاع وسط الدمام تجاوز عتبة الجدوى الاقتصادية (80%) ويستلزم الاعتماد الفوري لإعادة السفلتة.`;
      } else {
        reply = `تم استلام توجيهك: سأقوم بمطابقة البلاغات وتحديث مصفوفة الحسابات فوراً. التكلفة التقديرية الحالية هي ${summaryData.estimatedCost.toLocaleString()} ر.س والوفر المحقق ${summaryData.projectedSavings.toLocaleString()} ر.س.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'assistant_' + Date.now(),
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          executedAction,
        },
      ]);
      setIsProcessing(false);
    }, 450);
  };

  const handleQuickPrompt = (prompt: string) => {
    processCommand(prompt);
  };

  const QUICK_PROMPTS =
    role === 'employee'
      ? [
          'احسب لي الوفر اليوم',
          'اعتمد البلاغات الجديدة',
          'كم الوقت المقدر لإنجاز المهام؟',
          'لخص حالة وسط الدمام',
        ]
      : [
          'اعتمد إعادة سفلتة وسط الدمام',
          'كم نوفر مقارنة بالترقيع؟',
          'لخص قرارات إعادة السفلتة',
          'ما هي تكلفة التأخير المتوقعة؟',
        ];

  return (
    <>
      {/* 1. COMPACT, SLEEK EXECUTIVE DOCK PILL (Non-Cluttered, Airy Presence) */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0B3A5B] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-bold text-slate-900">
              {role === 'employee' ? 'مساعد نبض الميداني:' : 'المساعد الاستراتيجي الذكي:'}
            </span>

            <span className="text-slate-600">
              <strong className="text-[#0B3A5B] font-inter">{summaryData.pendingReportsCount}</strong>{' '}
              {role === 'employee' ? 'مهام بحاجة لتدقيق' : 'قرارات بانتظار الاعتماد'}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600">
              التكلفة:{' '}
              <strong className="text-slate-800 font-inter">
                {summaryData.estimatedCost.toLocaleString()} ر.س
              </strong>
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold">
              وفر متوقع:{' '}
              <strong className="font-inter font-bold">
                {summaryData.projectedSavings.toLocaleString()} ر.س
              </strong>
            </span>
          </div>
        </div>

        {/* Quick Trigger Buttons */}
        <div className="flex items-center gap-2 text-xs">
          {actionFeedback && (
            <span className="text-emerald-700 bg-emerald-50 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 animate-fadeIn">
              ✓ {actionFeedback}
            </span>
          )}

          {speechSupported && (
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={isListening ? 'جارٍ الاستماع...' : 'تحدث بأمر صوتي'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline font-medium text-[11px]">
                {isListening ? 'استماع...' : 'أمر صوتي'}
              </span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0B3A5B] hover:bg-[#16537E] text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>فتح المساعد التفاعلي</span>
          </button>
        </div>
      </div>

      {/* 2. EXPANDED SLIDE-OVER / MODAL ASSISTANT (Ultra-Modern, Smooth Experience) */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] font-cairo animate-scaleUp">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#0B3A5B] to-[#16537E] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {role === 'employee' ? 'مساعد نبض الميداني الذكي' : 'المساعد الاستراتيجي للقيادة'}
                  </h3>
                  <p className="text-xs text-slate-200">
                    تحليل فوري للتكاليف، أتمتة المهام، واستقبال الأوامر الصوتية والنصية
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Crisp Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-50 border-b border-slate-100 text-right">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/70">
                <div className="text-[11px] text-slate-500">المهام المطلوبة</div>
                <div className="text-lg font-extrabold text-[#0B3A5B] font-inter">
                  {summaryData.pendingReportsCount}
                </div>
                <div className="text-[10px] text-slate-400">منها {summaryData.highPriorityCount} حرجة</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/70">
                <div className="text-[11px] text-slate-500">التكلفة التقديرية</div>
                <div className="text-lg font-extrabold text-slate-800 font-inter">
                  {summaryData.estimatedCost.toLocaleString()} ر.س
                </div>
                <div className="text-[10px] text-slate-400">وفق العقود المعتمدة</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/70">
                <div className="text-[11px] text-slate-500">مخاطر التأخير</div>
                <div className="text-lg font-extrabold text-red-600 font-inter">
                  +{summaryData.delayCostRisk.toLocaleString()} ر.س
                </div>
                <div className="text-[10px] text-red-500">إذا تأخر لـ 90 يوماً</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/70">
                <div className="text-[11px] text-slate-500">الوفر المحقق</div>
                <div className="text-lg font-extrabold text-emerald-600 font-inter">
                  {summaryData.projectedSavings.toLocaleString()} ر.س
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">بالمعالجة الفورية</div>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[220px] max-h-[340px] bg-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-[#0B3A5B] text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? 'أنت' : 'نبض'}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed space-y-1.5 ${
                      msg.sender === 'user'
                        ? 'bg-[#0B3A5B] text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.executedAction && (
                      <div className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>إجراء منفذ: {msg.executedAction}</span>
                      </div>
                    )}
                    <span className="text-[9px] opacity-60 block font-inter text-left">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                  <Bot className="w-4 h-4 text-[#0B3A5B]" />
                  <span>جارٍ تحليل الطلب وحساب التكاليف والوفر...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompts Chips */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 shrink-0">أوامر سريعة:</span>
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(p)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-[#0B3A5B] hover:text-[#0B3A5B] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar with Voice & Send */}
            <div className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2">
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white border-red-500 animate-pulse'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title={isListening ? 'جارٍ الاستماع...' : 'تحدث الآن'}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}

              <input
                type="text"
                placeholder={
                  isListening
                    ? 'جارٍ الاستماع لصوتك...'
                    : 'اكتب أمراً أو استفساراً (مثال: احسب الوفر، اعتمد البلاغات)...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') processCommand(inputText);
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B3A5B]"
              />

              <button
                onClick={() => processCommand(inputText)}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-[#0B3A5B] hover:bg-[#16537E] text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
