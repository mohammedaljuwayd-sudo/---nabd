import React, { useState } from 'react';
import { UserRole } from '../types/nabd';
import {
  generateEmployeeBotSummary,
  generateDecisionMakerBotSummary,
  askMunicipalAdvisor,
  BotSummary,
} from '../services/municipalBot';
import {
  Bot,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';

interface MunicipalBotWidgetProps {
  role: 'employee' | 'decision_maker';
}

export const MunicipalBotWidget: React.FC<MunicipalBotWidgetProps> = ({ role }) => {
  const [isOpenChat, setIsOpenChat] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const summary: BotSummary =
    role === 'employee' ? generateEmployeeBotSummary() : generateDecisionMakerBotSummary();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userText = question.trim();
    setChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setQuestion('');
    setIsTyping(true);

    try {
      const reply = await askMunicipalAdvisor(userText, role);
      setChatLog((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        { sender: 'bot', text: 'عذراً، حدث خطأ أثناء معالجة الاستفسار. يرجى إعادة المحاولة.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Top Embedded Executive Summary Bar */}
      <div className="bg-gradient-to-r from-[#0B3A5B] to-[#124b74] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-white/10 space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base font-cairo">
                  مستشار نبض الذكي (ملخص المهام والوفر المالي)
                </span>
                <span className="bg-[#D4AF37] text-slate-950 text-[10px] px-2 py-0.5 rounded font-bold">
                  تحليل لحظي مباشر
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                {role === 'employee'
                  ? 'توجيه آلي لحوكمة البلاغات وسرعة الإنجاز الميداني وتفادي غرامات التأخر'
                  : 'تحليل استراتيجي للجدوى الاقتصادية وقرارات إعادة السفلتة'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpenChat(true)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-white/15"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>محادثة المستشار</span>
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={isCollapsed ? 'توسيع' : 'طي'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3 Core Analytical Columns: ايش المطلوب - كم بياخذ - كم بيوفر */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/15 text-xs">
            {/* 1. What is required? */}
            <div className="bg-[#07253B]/70 rounded-xl p-3.5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>المطلوب منك الآن:</span>
              </div>
              <ul className="space-y-1.5 text-slate-200 text-[11px] leading-relaxed">
                {summary.requiredActions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#D4AF37] font-bold">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Estimated Time (كم بياخذ) */}
            <div className="bg-[#07253B]/70 rounded-xl p-3.5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Clock className="w-4 h-4" />
                <span>كم بياخذ الوقت (الزمن المتوقع):</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                {summary.estimatedTimeText}
              </p>
              <div className="pt-1.5 border-t border-white/10 text-[10px] text-slate-300">
                معدل الاستجابة اليومي: <strong>أسرع بـ 42%</strong> من المستهدف البلدي.
              </div>
            </div>

            {/* 3. Financial Savings (كم بيوفر) */}
            <div className="bg-[#07253B]/70 rounded-xl p-3.5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Coins className="w-4 h-4" />
                <span>كم بيوفر للأمانة (الأثر المالي):</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                {summary.savingsText}
              </p>
              <div className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-bold inline-block border border-emerald-500/30">
                {summary.highlightMetric}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Chat Modal with Municipal Advisor */}
      {isOpenChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px]">
            {/* Modal Header */}
            <div className="bg-[#0B3A5B] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-[#D4AF37]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-cairo">
                    المستشار البلدي الذكي (منظومة نبض)
                  </h3>
                  <p className="text-[11px] text-slate-200">
                    اسأل عن الأولويات الميدانية، مدد الإنجاز، والتوفير المالي
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpenChat(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
              {/* Initial message */}
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-[#0B3A5B] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  ن
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tr-xs border border-slate-200 text-slate-800 leading-relaxed shadow-xs">
                  مرحباً بك! أنا مستشارك الذكي في منظومة «نبض». يمكنك سؤالي عن:
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-600">
                    <li>كم التوفير المالي المحقق عند الإنجاز اليوم؟</li>
                    <li>كم المدة الزمنية المقدرة لإنهاء البلاغات المعلقة؟</li>
                    <li>ما هو الإجراء ذو الأولوية القصوى الآن؟</li>
                  </ul>
                </div>
              </div>

              {/* Chat Log */}
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 max-w-[85%] ${
                    msg.sender === 'user' ? 'mr-auto flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user'
                        ? 'bg-[#2E7D32] text-white'
                        : 'bg-[#0B3A5B] text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? 'أنت' : 'ن'}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0B3A5B] text-white rounded-tl-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tr-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                  <Sparkles className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>المستشار يحلل البيانات البلدية...</span>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                type="button"
                onClick={() => setQuestion('كم المبالغ التي نوفرها إذا أنجزنا العمل اليوم؟')}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 rounded-lg text-slate-700 whitespace-nowrap border border-slate-200 cursor-pointer"
              >
                كم بنوفر اليوم؟
              </button>
              <button
                type="button"
                onClick={() => setQuestion('كم الوقت المتوقع لإنهاء البلاغات المفتوحة؟')}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 rounded-lg text-slate-700 whitespace-nowrap border border-slate-200 cursor-pointer"
              >
                كم بياخذ وقت؟
              </button>
              <button
                type="button"
                onClick={() => setQuestion('ما هي أول خطوة مطلوبة مني الآن؟')}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 rounded-lg text-slate-700 whitespace-nowrap border border-slate-200 cursor-pointer"
              >
                ايش المطلوب مني؟
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                placeholder="اكتب استفسارك للمستشار البلدي..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0B3A5B] focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!question.trim()}
                className="p-2.5 bg-[#0B3A5B] hover:bg-[#16537E] disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
