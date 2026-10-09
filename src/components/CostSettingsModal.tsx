import React, { useState } from 'react';
import { CostRatesConfig } from '../types/nabd';
import { DEFAULT_COST_RATES, nabdStore } from '../services/nabdStore';
import { Sliders, RotateCcw, Check, X, Building2 } from 'lucide-react';

interface CostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CostSettingsModal: React.FC<CostSettingsModalProps> = ({ isOpen, onClose }) => {
  const [rates, setRates] = useState<CostRatesConfig>(nabdStore.getCostRates());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    nabdStore.updateCostRates(rates);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const handleResetDefaults = () => {
    setRates({ ...DEFAULT_COST_RATES });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#0B3A5B] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-bold text-sm font-cairo">
                لوائح وضوابط تكاليف الصيانة البلدية
              </h3>
              <p className="text-[11px] text-slate-300">
                المعايير الرياضية المعتمدة لحساب الجدوى والتكرار وإعادة السفلتة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                تكلفة ترقيع الحفرة (ر.س):
              </label>
              <input
                type="number"
                value={rates.potholePatch}
                onChange={(e) => setRates({ ...rates, potholePatch: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-inter text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                تكلفة صيانة الإنارة (ر.س):
              </label>
              <input
                type="number"
                value={rates.lighting}
                onChange={(e) => setRates({ ...rates, lighting: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-inter text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                معالجة تسريب المياه (ر.س):
              </label>
              <input
                type="number"
                value={rates.leak}
                onChange={(e) => setRates({ ...rates, leak: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-inter text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                إعادة سفلتة القطاع المعياري (ر.س):
              </label>
              <input
                type="number"
                value={rates.resurfacePerSector}
                onChange={(e) =>
                  setRates({ ...rates, resurfacePerSector: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-inter text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                مسافة رصد التكرار (أمتار):
              </label>
              <input
                type="number"
                value={rates.recurrenceDistanceMeters}
                onChange={(e) =>
                  setRates({ ...rates, recurrenceDistanceMeters: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-inter text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                نافذة التكرار الزمنية (أيام):
              </label>
              <input
                type="number"
                value={rates.recurrenceDaysWindow}
                onChange={(e) =>
                  setRates({ ...rates, recurrenceDaysWindow: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-inter text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                عتبة حظر الترقيع (مرات تكرار):
              </label>
              <input
                type="number"
                value={rates.potholeEscalationThreshold}
                onChange={(e) =>
                  setRates({ ...rates, potholeEscalationThreshold: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-inter text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                نسبة جدوى إعادة السفلتة:
              </label>
              <input
                type="number"
                step="0.05"
                value={rates.resurfaceDecisionThresholdRatio}
                onChange={(e) =>
                  setRates({
                    ...rates,
                    resurfaceDecisionThresholdRatio: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-inter text-xs"
                required
              />
              <span className="text-[10px] text-slate-500">0.8 = 80% من تكلفة السفلتة</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة اللائحة القياسية</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B3A5B] hover:bg-[#16537E] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تم الحفظ</span>
                  </>
                ) : (
                  <span>حفظ التعديلات</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
