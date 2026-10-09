/**
 * Types & Domain Interfaces for Nabd («نبض» لمرافق الأمانة)
 */

export type UserRole = 'citizen' | 'employee' | 'decision_maker';

export interface User {
  id: string;
  nationalIdHash: string;
  maskedId: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  district?: string;
  username?: string;
  registeredAt?: string;
}

export type ReportType = 'pothole' | 'depression' | 'lighting' | 'leak' | 'sidewalk' | 'other';

export type ReportStatus = 'new' | 'confirmed' | 'rejected' | 'assigned' | 'done' | 'closed';

export interface DistrictSector {
  id: string;
  name: string;
  code: string;
  center: [number, number];
  bounds: [number, number][];
  resurfacingBaseCost: number;
}

export interface Report {
  id: string;
  caseNo: string;
  type: ReportType;
  customTypeName?: string; // For "أخرى"
  lat: number;
  lng: number;
  sectorId: string;
  sectorName: string;
  description: string;
  photoUrl?: string;
  requiresFieldVisit?: boolean; // When user cannot upload photo due to file size/driving/etc.
  fieldVisitReason?: string;
  status: ReportStatus;
  createdBy: string;
  createdMaskedId: string;
  createdAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  workOrderId?: string;
  workOrderKind?: 'patch' | 'resurface' | 'emergency';
  donePhotoUrl?: string;
  actualCost?: number;
  closedAt?: string;
  contractorName?: string;
  recurrenceCount?: number;
}

export interface PublicReportPin {
  id: string;
  caseNo: string;
  type: ReportType;
  customTypeName?: string;
  lat: number;
  lng: number;
  status: ReportStatus;
  sectorName: string;
  recurrenceCount: number;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  workOrderNo: string;
  reportIds: string[];
  contractorId: string;
  contractorName: string;
  sectorId: string;
  kind: 'patch' | 'resurface' | 'emergency';
  approvedBy: string;
  dueDays: number;
  createdAt: string;
  completedAt?: string;
  acceptedBy?: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'active' | 'completed' | 'accepted';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  reportId?: string;
  caseNo?: string;
  actorRole: UserRole;
  actorMaskedId: string;
  action: string;
  fromStatus?: ReportStatus;
  toStatus?: ReportStatus;
  note: string;
}

export interface CostRatesConfig {
  potholePatch: number; // 2,400 SAR
  lighting: number; // 900 SAR
  leak: number; // 6,500 SAR
  resurfacePerSector: number; // 38,000 SAR
  contractorSlaDays: number; // 21 days
  delay30Multiplier: number; // 1.4x
  delay90Multiplier: number; // 2.2x
  recurrenceDistanceMeters: number; // 70m
  recurrenceDaysWindow: number; // 90 days
  potholeEscalationThreshold: number; // 3 occurrences
  resurfaceDecisionThresholdRatio: number; // 0.8 (80%)
}

export interface SectorAggregate {
  sectorId: string;
  sectorName: string;
  sectorCode: string;
  totalConfirmedReports: number;
  confirmedPotholesCount: number;
  confirmedLightingCount: number;
  confirmedLeakCount: number;
  expectedPatching12m: number;
  resurfacingCost: number;
  ratio: number;
  recommendation: 'resurface' | 'routine';
  canApproveResurface: boolean;
  assignedWorkOrdersCount: number;
  potholesReportIds: string[];
  priorityLevel: 'عالية جداً' | 'عالية' | 'متوسطة' | 'مجدولة';
}

export interface LiveActivityEvent {
  id: string;
  caseNo: string;
  title: string;
  sectorName: string;
  timeAgo: string;
  type: 'new_report' | 'confirmed' | 'assigned' | 'completed' | 'closed';
}
