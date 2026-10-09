import {
  AuditLogEntry,
  CostRatesConfig,
  DistrictSector,
  PublicReportPin,
  Report,
  ReportStatus,
  ReportType,
  SectorAggregate,
  User,
  UserRole,
  WorkOrder,
} from '../types/nabd';

export const DEFAULT_COST_RATES: CostRatesConfig = {
  potholePatch: 2400,
  lighting: 900,
  leak: 6500,
  resurfacePerSector: 38000,
  contractorSlaDays: 21,
  delay30Multiplier: 1.4,
  delay90Multiplier: 2.2,
  recurrenceDistanceMeters: 70,
  recurrenceDaysWindow: 90,
  potholeEscalationThreshold: 3,
  resurfaceDecisionThresholdRatio: 0.8,
};

export const DAMMAM_SECTORS: DistrictSector[] = [
  {
    id: 'sec_central',
    name: 'قطاع وسط الدمام (السوق والعَمامرة)',
    code: 'SEC-DMM-01',
    center: [26.4340, 50.1030],
    resurfacingBaseCost: 38000,
    bounds: [
      [26.442, 50.092],
      [26.445, 50.115],
      [26.425, 50.116],
      [26.423, 50.093],
    ],
  },
  {
    id: 'sec_faisaliyah',
    name: 'قطاع الفيصلية',
    code: 'SEC-DMM-02',
    center: [26.4020, 50.0550],
    resurfacingBaseCost: 38000,
    bounds: [
      [26.415, 50.040],
      [26.418, 50.070],
      [26.390, 50.068],
      [26.388, 50.042],
    ],
  },
  {
    id: 'sec_shati',
    name: 'قطاع الشاطئ (الكورنيش)',
    code: 'SEC-DMM-03',
    center: [26.4580, 50.1180],
    resurfacingBaseCost: 42000,
    bounds: [
      [26.470, 50.105],
      [26.472, 50.135],
      [26.445, 50.132],
      [26.443, 50.106],
    ],
  },
  {
    id: 'sec_ohod',
    name: 'قطاع أُحُد و 71',
    code: 'SEC-DMM-04',
    center: [26.3950, 50.0820],
    resurfacingBaseCost: 36000,
    bounds: [
      [26.410, 50.072],
      [26.412, 50.098],
      [26.380, 50.095],
      [26.378, 50.071],
    ],
  },
  {
    id: 'sec_dhabab',
    name: 'قطاع الضباب والصناعية',
    code: 'SEC-DMM-05',
    center: [26.4150, 50.0200],
    resurfacingBaseCost: 40000,
    bounds: [
      [26.430, 50.005],
      [26.432, 50.035],
      [26.400, 50.032],
      [26.398, 50.006],
    ],
  },
];

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep_001',
    caseNo: 'NBD-2026-0801',
    type: 'pothole',
    lat: 26.4342,
    lng: 50.1028,
    sectorId: 'sec_central',
    sectorName: 'قطاع وسط الدمام (السوق والعَمامرة)',
    description: 'حفرة عميقة في المسار الأوسط تسبب ارتباكاً مرورياً وتضر بالمركبات.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    status: 'confirmed',
    createdBy: 'usr_cit_1',
    createdMaskedId: '1043••••12',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    verifiedBy: 'م. ريان القحطاني',
    verifiedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rep_002',
    caseNo: 'NBD-2026-0802',
    type: 'pothole',
    lat: 26.4345,
    lng: 50.1031,
    sectorId: 'sec_central',
    sectorName: 'قطاع وسط الدمام (السوق والعَمامرة)',
    description: 'تآكل في الطبقة الأسفلتية وهبوط حاد أمام مدرسة الأندلس.',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    status: 'confirmed',
    createdBy: 'usr_cit_2',
    createdMaskedId: '1099••••45',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    verifiedBy: 'م. ريان القحطاني',
    verifiedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rep_003',
    caseNo: 'NBD-2026-0803',
    type: 'pothole',
    lat: 26.4341,
    lng: 50.1033,
    sectorId: 'sec_central',
    sectorName: 'قطاع وسط الدمام (السوق والعَمامرة)',
    description: 'حفرة متكررة تم ترقيعها سابقاً وتفتت الأسفلت مجدداً قرب البريد.',
    photoUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=80',
    status: 'confirmed',
    createdBy: 'usr_cit_3',
    createdMaskedId: '1012••••90',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    verifiedBy: 'م. ريان القحطاني',
    verifiedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'rep_004',
    caseNo: 'NBD-2026-0804',
    type: 'pothole',
    lat: 26.4343,
    lng: 50.1029,
    sectorId: 'sec_central',
    sectorName: 'قطاع وسط الدمام (السوق والعَمامرة)',
    description: 'هبوط أسفلتي وتصدع متسع أمام مركز التموين على بعد 25 متراً من الحفرة الأولى.',
    photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
    status: 'new',
    createdBy: 'usr_cit_default',
    createdMaskedId: '1084••••33',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'rep_005',
    caseNo: 'NBD-2026-0805',
    type: 'lighting',
    lat: 26.4025,
    lng: 50.0560,
    sectorId: 'sec_faisaliyah',
    sectorName: 'قطاع الفيصلية',
    description: 'عمود إنارة مطفأ بالكامل في شارع الإمام علي يسبب عتمة خطرة ليلاً.',
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    status: 'confirmed',
    createdBy: 'usr_cit_4',
    createdMaskedId: '1067••••21',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    verifiedBy: 'م. ريان القحطاني',
    verifiedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'rep_006',
    caseNo: 'NBD-2026-0806',
    type: 'leak',
    lat: 26.4590,
    lng: 50.1190,
    sectorId: 'sec_shati',
    sectorName: 'قطاع الشاطئ (الكورنيش)',
    description: 'تسريب مياه سطحي متدفق على رصيف طريق الملك عبد الله.',
    photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    status: 'confirmed',
    createdBy: 'usr_cit_5',
    createdMaskedId: '1033••••78',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    verifiedBy: 'م. ريان القحطاني',
    verifiedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'rep_007',
    caseNo: 'NBD-2026-0807',
    type: 'pothole',
    lat: 26.4160,
    lng: 50.0210,
    sectorId: 'sec_dhabab',
    sectorName: 'قطاع الضباب والصناعية',
    description: 'حفرة سطحية مفردة في شارع أبو بكر الصديق ناتجة عن أعمال ردم قديمة.',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    status: 'confirmed',
    createdBy: 'usr_cit_6',
    createdMaskedId: '1055••••99',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    verifiedBy: 'م. ريان القحطاني',
    verifiedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'aud_001',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    caseNo: 'NBD-2026-0801',
    reportId: 'rep_001',
    actorRole: 'employee',
    actorMaskedId: '1022••••55',
    action: 'تأكيد البلاغ',
    fromStatus: 'new',
    toStatus: 'confirmed',
    note: 'تم فحص الموقع ومطابقة نوع الضرر (حفرة عميقة) واعتماده في قطاع وسط الدمام.',
  },
  {
    id: 'aud_002',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    caseNo: 'NBD-2026-0802',
    reportId: 'rep_002',
    actorRole: 'employee',
    actorMaskedId: '1022••••55',
    action: 'تأكيد البلاغ وتثبيت التكرار',
    fromStatus: 'new',
    toStatus: 'confirmed',
    note: 'رصد تكرار الحفرة ضمن نطاق 35م من بلاغ NBD-2026-0801.',
  },
  {
    id: 'aud_003',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    caseNo: 'NBD-2026-0803',
    reportId: 'rep_003',
    actorRole: 'employee',
    actorMaskedId: '1022••••55',
    action: 'تأكيد البلاغ الثالث',
    fromStatus: 'new',
    toStatus: 'confirmed',
    note: 'وصول مؤشر التكرار إلى 3 حفر - بدء تنبيه نظام حوكمة الترقيع التلقائي.',
  },
  {
    id: 'aud_004',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    caseNo: 'NBD-2026-0804',
    reportId: 'rep_004',
    actorRole: 'citizen',
    actorMaskedId: '1084••••33',
    action: 'إنشاء بلاغ جديد',
    fromStatus: undefined,
    toStatus: 'new',
    note: 'تم إرسال البلاغ عبر منصة نبض (موقع محدد عبر الخريطة مع إرفاق صورة حقيقية).',
  },
];

class NabdStore {
  private reports: Report[] = [];
  private auditLog: AuditLogEntry[] = [];
  private costRates: CostRatesConfig = DEFAULT_COST_RATES;
  private workOrders: WorkOrder[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const savedReports = localStorage.getItem('nabd_reports_v2');
      const savedAudit = localStorage.getItem('nabd_audit_v2');
      const savedRates = localStorage.getItem('nabd_rates_v2');
      const savedOrders = localStorage.getItem('nabd_orders_v2');

      if (savedReports) {
        this.reports = JSON.parse(savedReports);
      } else {
        this.reports = [...INITIAL_REPORTS];
        this.saveReports();
      }

      if (savedAudit) {
        this.auditLog = JSON.parse(savedAudit);
      } else {
        this.auditLog = [...INITIAL_AUDIT_LOG];
        this.saveAudit();
      }

      if (savedRates) {
        this.costRates = JSON.parse(savedRates);
      }

      if (savedOrders) {
        this.workOrders = JSON.parse(savedOrders);
      }
    } catch {
      this.reports = [...INITIAL_REPORTS];
      this.auditLog = [...INITIAL_AUDIT_LOG];
    }
  }

  private saveReports() {
    localStorage.setItem('nabd_reports_v2', JSON.stringify(this.reports));
    this.notify();
  }

  private saveAudit() {
    localStorage.setItem('nabd_audit_v2', JSON.stringify(this.auditLog));
    this.notify();
  }

  private saveOrders() {
    localStorage.setItem('nabd_orders_v2', JSON.stringify(this.workOrders));
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public resetToDefaultDemo() {
    this.reports = JSON.parse(JSON.stringify(INITIAL_REPORTS));
    this.auditLog = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOG));
    this.costRates = { ...DEFAULT_COST_RATES };
    this.workOrders = [];
    this.saveReports();
    this.saveAudit();
    this.saveOrders();
    this.notify();
  }

  public getCostRates(): CostRatesConfig {
    return { ...this.costRates };
  }

  public updateCostRates(rates: Partial<CostRatesConfig>) {
    this.costRates = { ...this.costRates, ...rates };
    localStorage.setItem('nabd_rates_v2', JSON.stringify(this.costRates));
    this.notify();
  }

  public getRecurrenceCount(lat: number, lng: number, type: ReportType, excludeId?: string): number {
    const windowMs = this.costRates.recurrenceDaysWindow * 86400000;
    const now = Date.now();

    const matches = this.reports.filter((r) => {
      if (r.type !== type && (r.type !== 'pothole' || type !== 'depression')) return false;
      if (r.status === 'rejected') return false;
      if (excludeId && r.id === excludeId) return false;

      const reportAge = now - new Date(r.createdAt).getTime();
      if (reportAge > windowMs) return false;

      const dist = calculateDistanceMeters(lat, lng, r.lat, r.lng);
      return dist <= this.costRates.recurrenceDistanceMeters;
    });

    return matches.length + (excludeId ? 1 : 0);
  }

  public findNearbySimilar(
    lat: number,
    lng: number,
    type: ReportType
  ): { found: boolean; distance: number; existingCaseNo?: string } {
    let closestDist = Infinity;
    let closestCase = '';

    for (const r of this.reports) {
      if ((r.type === type || (r.type === 'pothole' && type === 'depression')) && r.status !== 'rejected') {
        const dist = calculateDistanceMeters(lat, lng, r.lat, r.lng);
        if (dist <= this.costRates.recurrenceDistanceMeters && dist < closestDist) {
          closestDist = dist;
          closestCase = r.caseNo;
        }
      }
    }

    if (closestDist <= this.costRates.recurrenceDistanceMeters) {
      return { found: true, distance: closestDist, existingCaseNo: closestCase };
    }
    return { found: false, distance: Infinity };
  }

  public findSectorByCoords(lat: number, lng: number): DistrictSector {
    let bestSector = DAMMAM_SECTORS[0];
    let minDist = Infinity;
    for (const sec of DAMMAM_SECTORS) {
      const dist = calculateDistanceMeters(lat, lng, sec.center[0], sec.center[1]);
      if (dist < minDist) {
        minDist = dist;
        bestSector = sec;
      }
    }
    return bestSector;
  }

  public getReportsForCitizen(user: User): {
    myReports: Report[];
    publicPins: PublicReportPin[];
  } {
    const myReports = this.reports
      .filter((r) => r.createdBy === user.id || r.createdMaskedId === user.maskedId)
      .map((r) => ({
        ...r,
        recurrenceCount: this.getRecurrenceCount(r.lat, r.lng, r.type),
      }));

    const publicPins: PublicReportPin[] = this.reports
      .filter((r) => r.createdBy !== user.id && r.createdMaskedId !== user.maskedId)
      .map((r) => ({
        id: r.id,
        caseNo: r.caseNo,
        type: r.type,
        customTypeName: r.customTypeName,
        lat: r.lat,
        lng: r.lng,
        status: r.status,
        sectorName: r.sectorName,
        recurrenceCount: this.getRecurrenceCount(r.lat, r.lng, r.type),
        createdAt: r.createdAt,
      }));

    return { myReports, publicPins };
  }

  public getReportsForEmployee(): Report[] {
    return this.reports.map((r) => ({
      ...r,
      recurrenceCount: this.getRecurrenceCount(r.lat, r.lng, r.type),
    }));
  }

  public getDecisionMakerAggregates(): {
    topMetrics: {
      totalConfirmed: number;
      pendingDecisions: number;
      referredToContractor: number;
    };
    sectors: SectorAggregate[];
    heatmapPoints: [number, number, number][];
  } {
    const confirmedReports = this.reports.filter((r) => r.status === 'confirmed');
    const assignedReports = this.reports.filter((r) => r.status === 'assigned' || r.status === 'done');

    const sectorsAgg: SectorAggregate[] = DAMMAM_SECTORS.map((sector) => {
      const sectorConfirmed = confirmedReports.filter((r) => r.sectorId === sector.id);
      const potholes = sectorConfirmed.filter((r) => r.type === 'pothole' || r.type === 'depression');
      const lightings = sectorConfirmed.filter((r) => r.type === 'lighting');
      const leaks = sectorConfirmed.filter((r) => r.type === 'leak');

      const expectedPatching12m =
        potholes.length * this.costRates.potholePatch * 4;
      const resurfacingCost = sector.resurfacingBaseCost;
      const ratio = expectedPatching12m / (resurfacingCost || 1);

      const isResurface = ratio >= this.costRates.resurfaceDecisionThresholdRatio;
      const assignedCount = assignedReports.filter((r) => r.sectorId === sector.id).length;

      let priorityLevel: SectorAggregate['priorityLevel'] = 'مجدولة';
      if (ratio >= 0.8) priorityLevel = 'عالية جداً';
      else if (ratio >= 0.5) priorityLevel = 'عالية';
      else if (ratio >= 0.2) priorityLevel = 'متوسطة';

      return {
        sectorId: sector.id,
        sectorName: sector.name,
        sectorCode: sector.code,
        totalConfirmedReports: sectorConfirmed.length,
        confirmedPotholesCount: potholes.length,
        confirmedLightingCount: lightings.length,
        confirmedLeakCount: leaks.length,
        expectedPatching12m,
        resurfacingCost,
        ratio,
        recommendation: isResurface ? 'resurface' : 'routine',
        // In the live active mode: All sectors can be approved/acted upon!
        canApproveResurface: true,
        assignedWorkOrdersCount: assignedCount,
        potholesReportIds: potholes.map((p) => p.id),
        priorityLevel,
      };
    });

    const pendingDecisions = sectorsAgg.filter((s) => s.ratio >= 0.8).length || 1;

    const heatmapPoints: [number, number, number][] = this.reports
      .filter((r) => r.status !== 'rejected')
      .map((r) => {
        const weight = (r.type === 'pothole' || r.type === 'depression') ? 1.0 : r.type === 'leak' ? 0.8 : 0.6;
        return [r.lat, r.lng, weight];
      });

    return {
      topMetrics: {
        totalConfirmed: confirmedReports.length,
        pendingDecisions,
        referredToContractor: assignedReports.length,
      },
      sectors: sectorsAgg,
      heatmapPoints,
    };
  }

  public getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // ================= STATE MACHINE & TRANSITIONS =================

  public createReport(data: {
    type: ReportType;
    customTypeName?: string;
    lat: number;
    lng: number;
    description: string;
    photoUrl?: string;
    requiresFieldVisit?: boolean;
    fieldVisitReason?: string;
    currentUser: User;
  }): Report {
    const sector = this.findSectorByCoords(data.lat, data.lng);
    const caseNumberSuffix = Math.floor(1000 + Math.random() * 9000);
    const caseNo = `NBD-2026-${caseNumberSuffix}`;

    const newReport: Report = {
      id: 'rep_' + Date.now(),
      caseNo,
      type: data.type,
      customTypeName: data.customTypeName,
      lat: data.lat,
      lng: data.lng,
      sectorId: sector.id,
      sectorName: sector.name,
      description: data.description,
      photoUrl: data.photoUrl,
      requiresFieldVisit: data.requiresFieldVisit,
      fieldVisitReason: data.fieldVisitReason,
      status: 'new',
      createdBy: data.currentUser.id,
      createdMaskedId: data.currentUser.maskedId,
      createdAt: new Date().toISOString(),
    };

    this.reports.unshift(newReport);
    this.saveReports();

    let note = `تم تسجيل البلاغ في ${sector.name}.`;
    if (data.requiresFieldVisit) {
      note += ' (مطلوب زيارة ومعاينة ميدانية من مساح الأمانة لتعذر إرفاق صورة من المستفيد).';
    }

    this.appendAuditLog({
      reportId: newReport.id,
      caseNo: newReport.caseNo,
      actorRole: data.currentUser.role,
      actorMaskedId: data.currentUser.maskedId,
      action: 'إنشاء بلاغ جديد',
      fromStatus: undefined,
      toStatus: 'new',
      note,
    });

    return newReport;
  }

  public confirmReport(reportId: string, currentUser: User): Report {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) throw new Error('البلاغ غير موجود');

    report.status = 'confirmed';
    report.verifiedBy = currentUser.name;
    report.verifiedAt = new Date().toISOString();

    const recurrence = this.getRecurrenceCount(report.lat, report.lng, report.type);

    this.saveReports();

    let note = `تم التحقق الميداني والاعتماد الفني للبلاغ.`;
    if ((report.type === 'pothole' || report.type === 'depression') && recurrence >= this.costRates.potholeEscalationThreshold) {
      note += ` تكرار الضرر بلغ (${recurrence}) حفر: موصى بإعادة السفلتة فوراً لمنع الهدر.`;
    }

    this.appendAuditLog({
      reportId: report.id,
      caseNo: report.caseNo,
      actorRole: currentUser.role,
      actorMaskedId: currentUser.maskedId,
      action: 'تأكيد البلاغ',
      fromStatus: 'new',
      toStatus: 'confirmed',
      note,
    });

    return report;
  }

  public rejectReport(reportId: string, reason: string, currentUser: User): Report {
    if (!reason || reason.trim().length < 5) {
      throw new Error('يجب تحديد سبب موضوعي للرفض (5 أحرف على الأقل)');
    }

    const report = this.reports.find((r) => r.id === reportId);
    if (!report) throw new Error('البلاغ غير موجود');

    report.status = 'rejected';
    report.rejectionReason = reason.trim();
    report.verifiedBy = currentUser.name;
    report.verifiedAt = new Date().toISOString();

    this.saveReports();

    this.appendAuditLog({
      reportId: report.id,
      caseNo: report.caseNo,
      actorRole: currentUser.role,
      actorMaskedId: currentUser.maskedId,
      action: 'رفض البلاغ',
      fromStatus: 'new',
      toStatus: 'rejected',
      note: `سبب الرفض: ${reason.trim()}`,
    });

    return report;
  }

  /**
   * Action 4: Employee assigns routine maintenance or emergency repair to contractor
   * In the active live day mode: accessible and active!
   */
  public assignRoutineMaintenance(
    reportId: string,
    contractorName: string,
    currentUser: User,
    isEmergencyOverride: boolean = false
  ): WorkOrder {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) throw new Error('البلاغ غير موجود');

    const cost =
      report.type === 'lighting'
        ? this.costRates.lighting
        : report.type === 'leak'
        ? this.costRates.leak
        : this.costRates.potholePatch;

    const workOrder: WorkOrder = {
      id: 'wo_' + Date.now(),
      workOrderNo: (isEmergencyOverride ? 'WO-EMERGENCY-' : 'WO-ROUTINE-') + Math.floor(1000 + Math.random() * 9000),
      reportIds: [report.id],
      contractorId: 'cont_01',
      contractorName: contractorName || 'شركة اليمامة للمقاولات العامة',
      sectorId: report.sectorId,
      kind: isEmergencyOverride ? 'emergency' : 'patch',
      approvedBy: currentUser.name,
      dueDays: isEmergencyOverride ? 3 : this.costRates.contractorSlaDays,
      createdAt: new Date().toISOString(),
      estimatedCost: cost,
      status: 'active',
    };

    report.status = 'assigned';
    report.workOrderId = workOrder.id;
    report.workOrderKind = isEmergencyOverride ? 'emergency' : 'patch';
    report.contractorName = workOrder.contractorName;

    this.workOrders.push(workOrder);
    this.saveOrders();
    this.saveReports();

    this.appendAuditLog({
      reportId: report.id,
      caseNo: report.caseNo,
      actorRole: currentUser.role,
      actorMaskedId: currentUser.maskedId,
      action: isEmergencyOverride ? 'إسناد صيانة عاجلة (تدخل فوري)' : 'إسناد صيانة روتينية للمقاول',
      fromStatus: 'confirmed',
      toStatus: 'assigned',
      note: `أمر عمل ${workOrder.workOrderNo} لـ ${workOrder.contractorName} بتكلفة تقديرية ${cost} ر.س ومهلة ${workOrder.dueDays} يومًا.`,
    });

    return workOrder;
  }

  public approveSectorResurfacing(sectorId: string, currentUser: User): WorkOrder {
    const sector = DAMMAM_SECTORS.find((s) => s.id === sectorId);
    if (!sector) throw new Error('القطاع غير موجود');

    const targetReports = this.reports.filter(
      (r) => r.sectorId === sectorId && r.status !== 'closed' && r.status !== 'rejected'
    );

    const workOrder: WorkOrder = {
      id: 'wo_resurface_' + Date.now(),
      workOrderNo: 'WO-RESURFACE-' + Math.floor(1000 + Math.random() * 9000),
      reportIds: targetReports.map((r) => r.id),
      contractorId: 'cont_prime_01',
      contractorName: 'شركة شبه الجزيرة للمقاولات (عقد صيانة الشوارع الرئيسية)',
      sectorId: sector.id,
      kind: 'resurface',
      approvedBy: currentUser.name,
      dueDays: this.costRates.contractorSlaDays,
      createdAt: new Date().toISOString(),
      estimatedCost: sector.resurfacingBaseCost,
      status: 'active',
    };

    targetReports.forEach((r) => {
      r.status = 'assigned';
      r.workOrderId = workOrder.id;
      r.workOrderKind = 'resurface';
      r.contractorName = workOrder.contractorName;
    });

    this.workOrders.push(workOrder);
    this.saveOrders();
    this.saveReports();

    this.appendAuditLog({
      actorRole: currentUser.role,
      actorMaskedId: currentUser.maskedId,
      action: 'اعتماد وإحالة إعادة سفلتة القطاع',
      fromStatus: 'confirmed',
      toStatus: 'assigned',
      note: `قرار قيادي معتمد لإعادة سفلتة ${sector.name} برقم ${workOrder.workOrderNo} يشمل ${targetReports.length} بلاغات نشطة بوفر مالي متوقع.`,
    });

    return workOrder;
  }

  public recordWorkDone(data: {
    reportId: string;
    donePhotoUrl: string;
    actualCost: number;
    currentUser: User;
  }): Report {
    const report = this.reports.find((r) => r.id === data.reportId);
    if (!report) throw new Error('البلاغ غير موجود');

    report.status = 'done';
    report.donePhotoUrl = data.donePhotoUrl;
    report.actualCost = data.actualCost;

    this.saveReports();

    this.appendAuditLog({
      reportId: report.id,
      caseNo: report.caseNo,
      actorRole: data.currentUser.role,
      actorMaskedId: data.currentUser.maskedId,
      action: 'إنجاز أعمال المقاول',
      fromStatus: 'assigned',
      toStatus: 'done',
      note: `تم رفع صورة ما بعد الإصلاح وتسجيل التكلفة الفعلية (${data.actualCost.toLocaleString()} ر.س). بانتظار الفحص الميداني من الموظف.`,
    });

    return report;
  }

  public closeReportWithInspection(reportId: string, currentUser: User): Report {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) throw new Error('البلاغ غير موجود');

    report.status = 'closed';
    report.closedAt = new Date().toISOString();

    this.saveReports();

    this.appendAuditLog({
      reportId: report.id,
      caseNo: report.caseNo,
      actorRole: currentUser.role,
      actorMaskedId: currentUser.maskedId,
      action: 'استلام الأعمال والفحص الميداني (إغلاق)',
      fromStatus: 'done',
      toStatus: 'closed',
      note: `تم الفحص الميداني بنجاح بواسطة ${currentUser.name} وإغلاق البلاغ نهائيًا.`,
    });

    return report;
  }

  private appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const newEntry: AuditLogEntry = {
      id: 'aud_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.auditLog.unshift(newEntry);
    this.saveAudit();
  }
}

export const nabdStore = new NabdStore();
