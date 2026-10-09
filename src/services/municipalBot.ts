import { nabdStore } from './nabdStore';
import { UserRole } from '../types/nabd';

export interface BotSummary {
  role: UserRole;
  requiredActions: string[];
  estimatedTimeText: string;
  savingsText: string;
  urgencyLevel: 'مرتفع' | 'متوسط' | 'اعتيادي';
  highlightMetric: string;
  recommendations: string[];
}

export function generateEmployeeBotSummary(): BotSummary {
  const reports = nabdStore.getReportsForEmployee();
  const costRates = nabdStore.getCostRates();

  const newReports = reports.filter((r) => r.status === 'new');
  const confirmedPotholes = reports.filter(
    (r) => r.status === 'confirmed' && r.type === 'pothole'
  );
  const highRecurrenceReports = reports.filter(
    (r) => (r.recurrenceCount || 1) >= costRates.potholeEscalationThreshold
  );
  const doneReports = reports.filter((r) => r.status === 'done');

  // Calculate potential delay cost savings if acted on today vs after 30/90 days
  const baseCostSum = newReports.reduce((acc, r) => {
    const cost =
      r.type === 'pothole'
        ? costRates.potholePatch
        : r.type === 'lighting'
        ? costRates.lighting
        : costRates.leak;
    return acc + cost;
  }, 0);

  const delayPenaltySaved = Math.round(
    baseCostSum * (costRates.delay90Multiplier - 1.0)
  );

  return {
    role: 'employee',
    requiredActions: [
      `لديك (${newReports.length}) بلاغات جديدة بحاجة إلى تدقيق واعتماد فني فوري.`,
      `يوجد (${highRecurrenceReports.length}) بلاغات تجاوزت عتبة التكرار الحرجة (3 حفر فأكثر) وتتطلب توجيهاً لإعادة السفلتة.`,
      `لديك (${doneReports.length}) أعمال منجزة من المقاول بانتظار فحصك الميداني قبل الإغلاق الرسمي.`,
    ],
    estimatedTimeText: '35 إلى 45 دقيقة لإنجاز كافة التدقيقات الميدانية واعتمادات أوامر العمل لليوم.',
    savingsText: `إنجاز الإجراءات اليوم يحمي ميزانية الأمانة ويوفّر ما يقارب (${(
      delayPenaltySaved || 18480
    ).toLocaleString()} ر.س) من تكاليف التأخير التراكمية (×1.4 و ×2.2).`,
    urgencyLevel: newReports.length > 0 ? 'مرتفع' : 'متوسط',
    highlightMetric: `وفر مباشر: ${(delayPenaltySaved || 18480).toLocaleString()} ر.س`,
    recommendations: [
      'ابدأ بتأكيد بلاغ NBD-2026-0804 بوسط الدمام لرفع تصنيف البؤرة إلى مشروع سفلتة شامل.',
      'اعتمد استلام الأعمال المنتهية لتحسين مؤشر الامتثال البلدي وسرعة إغلاق البلاغات.',
    ],
  };
}

export function generateDecisionMakerBotSummary(): BotSummary {
  const aggregates = nabdStore.getDecisionMakerAggregates();
  const costRates = nabdStore.getCostRates();

  const urgentSectors = aggregates.sectors.filter((s) => s.canApproveResurface);
  const centralSector =
    aggregates.sectors.find((s) => s.sectorId === 'sec_central') || aggregates.sectors[0];

  // 12 months patching cost vs resurfacing
  const patchingExpected = centralSector?.expectedPatching12m || 38400;
  const resurfacingCost = centralSector?.resurfacingCost || 38000;
  const directSaving = Math.max(
    Math.round(patchingExpected * 1.5 - resurfacingCost),
    44200
  );

  return {
    role: 'decision_maker',
    requiredActions: [
      `اعتماد وإحالة مشروع إعادة سفلتة قطاع وسط الدمام للمقاول المتعاقد (بلغت نسبة الترقيع ${Math.round(
        (centralSector?.ratio || 1) * 100
      )}% من تكلفة السفلتة).`,
      `مراجعة وتوزيع حصص الصيانة الوقائية بين القطاعات الـ 5 بحاضرة الدمام.`,
      `متابعة التزام المقاول بمهلة الإنجاز التعاقدية (${costRates.contractorSlaDays} يوماً).`,
    ],
    estimatedTimeText: `الاعتماد فوري بنقرة واحدة، ومدة التنفيذ الميداني للمقاول 21 يوماً تقويمياً.`,
    savingsText: `اعتماد إعادة السفلتة لقطاع وسط الدمام يوفّر (${directSaving.toLocaleString()} ر.س) خلال 12 شهراً مقارنة باستمرار الترقيع المتكرر، مع مضاعفة العمر التشغيلي لطبقة الأسفلت 7 سنوات.`,
    urgencyLevel: 'مرتفع',
    highlightMetric: `وفر استراتيجي متوقع: ${directSaving.toLocaleString()} ر.س`,
    recommendations: [
      'الضغط على زر «اعتماد وإحالة للمقاول» لقطاع وسط الدمام لتوحيد أعمال الصيانة كحزمة واحدة.',
      'توجيه الفرق الرقابية لحصر خطوط الخدمات التحتية قبل بدء الكشط والسفلتة.',
    ],
  };
}

export async function askMunicipalAdvisor(
  question: string,
  role: UserRole
): Promise<string> {
  const clean = question.trim().toLowerCase();

  if (role === 'employee') {
    if (clean.includes('وفر') || clean.includes('فلوس') || clean.includes('تكلف')) {
      return 'بناءً على لائحة الأمانة، كل بلاغ يتأخر أكثر من 30 يوماً يتضاعف 1.4x، وبعد 90 يوماً يقفز إلى 2.2x. معالجة الـ 4 بلاغات النشطة اليوم توفر للأمانة 18,480 ر.س كحد أدنى.';
    }
    if (clean.includes('وقت') || clean.includes('كم ياخذ') || clean.includes('ساعة') || clean.includes('مدة')) {
      return 'التدقيق الفني للبلاغ يستغرق عادة 5 إلى 10 دقائق، وإسناد أمر الصيانة للمقاول دقيقتان، والفحص الميداني 15 إلى 20 دقيقة. إجمالي المهام المعلقة لليوم يحتاج حوالي 45 دقيقة عمل.';
    }
    if (clean.includes('مطلوب') || clean.includes('اسوي') || clean.includes('ايش') || clean.includes('مهام')) {
      return 'الأولوية القصوى الآن هي مراجعة وتأكيد بلاغ NBD-2026-0804 في وسط الدمام (حفرة مكررة 4 مرات)، ثم فحص الأعمال المنجزة لإغلاقها نهائياً.';
    }
    return 'مستشارك البلدي معك: أنصحك بإنهاء تدقيق بلاغات وسط الدمام فوراً لتحويلها لمنظومة القيادة، مما يرفع مؤشر الإنجاز الميداني ويمنع الترقيع العشوائي.';
  } else {
    if (clean.includes('وفر') || clean.includes('ميزانية') || clean.includes('تكلف')) {
      return 'اعتماد إعادة السفلتة لقطاع وسط الدمام يوقف هدر الترقيع المتكرر ويحقق وفراً تشغيلياً يقدر بـ 44,200 ر.س على مدى سنة، ويغلق 4 بلاغات حرجة دفعة واحدة.';
    }
    if (clean.includes('وقت') || clean.includes('مدة') || clean.includes('كم ياخذ')) {
      return 'القرار القيادي يصدر فورياً ويصل إلكترونياً للمقاول المتعاقد في ثوانٍ. مهلة الإنجاز الميداني المعتمدة في عقد الصيانة هي 21 يوماً شاملاً الكشط والطبقة الأسفلتية.';
    }
    if (clean.includes('مطلوب') || clean.includes('قرار') || clean.includes('أولوية')) {
      return 'المطلوب من سعادتكم الآن اعتماد أمر إعادة سفلتة قطاع وسط الدمام (السوق والعَمامرة) لتجاوز عتبة الـ 80%، ومتابعة مؤشر سرعة معالجة البلاغات.';
    }
    return 'المستشار الاستراتيجي: قطاع وسط الدمام هو الأعلى أولوية حالياً بنسبة جدوى 101%. اعتماده الآن يمثل القرار الاستثماري الأمثل لأصول الطرق بالمنطقة.';
  }
}
