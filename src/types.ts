/**
 * Types and interfaces for the Field Visit & Worksite Mapping System
 */

export interface HTBLElementDetail {
  present: boolean;
  details?: string;
  amount?: number | string; // specifically for advance
}

export interface HTBLElements {
  debtObligation: HTBLElementDetail;
  advance: HTBLElementDetail;
  customSocialObligation: HTBLElementDetail;
  succession: HTBLElementDetail;
  economicConsideration: HTBLElementDetail;
  casteOrCommunity: HTBLElementDetail;
  suretyOrContract: HTBLElementDetail;
  interState: HTBLElementDetail;
  rightToMinimumWage: HTBLElementDetail;
  freedomOfEmployment: HTBLElementDetail;
  rightToMoveFreely: HTBLElementDetail;
  rightToAppropriateSellAtMarket: HTBLElementDetail;
  noElements: boolean;
}

export type CaseStatus =
  | 'Initial Screening'
  | 'Under Verification'
  | 'High Risk / Immediate Follow-up'
  | 'Referred to District Administration'
  | 'Legal Action Initiated'
  | 'Routine Monitoring / Closed';

export type IndustryType =
  | 'Brick Kiln'
  | 'Construction'
  | 'Garments / Textile'
  | 'Rice Mill'
  | 'Stone Quarry / Crusher'
  | 'Agriculture / Farm'
  | 'Hotel / Dhaba'
  | 'Poultry / Dairy'
  | 'Manufacturing / Factory'
  | 'Wood & Timber'
  | 'Fish / Prawn Processing'
  | 'Other';

export type SeasonType =
  | 'Seasonal'
  | 'Perennial / Year-Round'
  | 'Peak Season'
  | 'Off Season'
  | 'Unspecified';

export const REPORTING_PERSON_OPTIONS = [
  'K.Pradeep',
  'M.Rakesh',
  'K.Prasad',
  'P.Narasimha',
] as const;

export type ReportingPerson = typeof REPORTING_PERSON_OPTIONS[number];

export const CLUSTER_OPTIONS = [
  'Warangal',
  'Hanumakonda',
  'Bhupalpally',
] as const;

export type ClusterName = typeof CLUSTER_OPTIONS[number];

/**
 * Cluster → Mandal hierarchical mapping.
 * Extensible data structure for dependent/cascading dropdowns.
 */
export const CLUSTER_MANDAL_MAP: Record<ClusterName, readonly string[]> = {
  Warangal: [
    'Chennaraopet',
    'Duggondi',
    'Geesugonda',
    'Khanapur',
    'Khila Warangal',
    'Nallabelly',
    'Narsampet',
    'Nekkonda',
    'Parvathagiri',
    'Raiparthy',
    'Sangem',
    'Warangal',
    'Wardhannapet',
  ],
  Hanumakonda: [
    'Hanumakonda',
    'Kazipet',
    'Inavole',
    'Hasanparthy',
    'Velair',
    'Dharmasagar',
    'Elkathurthi',
    'Bheemadevarapalli',
    'Kamalapur',
    'Parkal',
    'Nadikuda',
    'Damera',
    'Athmakur',
    'Shayampet',
  ],
  Bhupalpally: [
    'Bhupalpally',
    'Chityal',
    'Ghanpur (Mulug)',
    'Kataram',
    'Mahadevpur',
    'Malharrao',
    'Mogullapally',
    'Mutharam Mahadevpur',
    'Palimela',
    'Regonda',
    'Tekumatla',
    'Kothapallygori',
  ],
} as const;

export const ALL_MANDALS: readonly string[] = [
  ...CLUSTER_MANDAL_MAP.Warangal,
  ...CLUSTER_MANDAL_MAP.Hanumakonda,
  ...CLUSTER_MANDAL_MAP.Bhupalpally,
];

export const MANDAL_OPTIONS = ALL_MANDALS;

export type MandalName = string;

export const REVENUE_DIVISION_OPTIONS = [
  'Warangal',
  'Narsampeta',
  'Hanumakonda',
  'Parkal',
  'Bhupalpally',
  'Parkal Bhupalpally',
] as const;

export type RevenueDivisionName = typeof REVENUE_DIVISION_OPTIONS[number];

export const POLICE_STATION_OPTIONS = [
  'Warangal Rural PS',
  'Narsampet PS',
  'Geesugonda PS',
  'Chennaraopet PS',
  'Duggondi PS',
  'Khanapur PS',
  'Khila Warangal PS',
  'Nallabelly PS',
  'Nekkonda PS',
  'Parvathagiri PS',
  'Raiparthy PS',
  'Sangem PS',
  'Wardhannapet PS',
  'Hanumakonda PS',
  'Kazipet PS',
  'Inavole PS',
  'Hasanparthy PS',
  'Parkal PS',
  'Bhupalpally PS',
  'Kataram PS',
  'Mahadevpur PS',
  'Chityal PS',
  'Regonda PS',
] as const;

export type PoliceStationName = typeof POLICE_STATION_OPTIONS[number];

export interface VisitRecord {
  id: string; // Unique record ID (e.g., FV-2315 or numeric)
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  createdBy?: string; // UID of creator
  createdByEmail?: string; // Email of creator

  // SECTION A – VISIT DETAILS
  reportingPerson: string;
  dateOfVisit: string; // YYYY-MM-DD
  noOfVisit: string; // e.g. "1st Visit", "2nd Visit" or "1"
  month: string; // e.g. "January", "February"
  clusterName: string;
  industryType: IndustryType | string;
  industryName: string;
  locationLink: string; // Google Maps URL or Coordinates
  areaVillageWard: string;
  mandal: string;
  revenueDivision: string;
  policeStation: string;
  seasonality: SeasonType | string;

  // SECTION B – WORKER DETAILS
  interactedPersonsCount: number;
  approxWorkersCount: number;
  maleWorkersCount: number;
  femaleWorkersCount: number;
  familiesCount: number;
  otherStateLabour: string; // State names only (comma-separated or text)
  intraStateLabour: string; // District names only (comma-separated or text)

  // SECTION C – CONTACT DETAILS
  contactPersonName: string;
  contactPersonPhone: string;
  ownerName: string;
  ownerPhone: string;

  // SECTION D – HT&BL ELEMENTS
  htblElements: HTBLElements;
  isHtblPotential: boolean; // Computed / summary flag

  // SECTION E – FIELD VISIT INFORMATION
  conversationHighlights: string;
  observations: string;
  challengesFaced: string;
  caseStatus: CaseStatus;
  additionalRemarks: string;
}

export type UserRole = 'admin' | 'field_staff' | 'staff';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  lastLogin?: string;
}

export interface DashboardStats {
  totalVisits: number;
  totalWorksites: number;
  totalWorkers: number;
  maleWorkers: number;
  femaleWorkers: number;
  interStateLabourCases: number;
  intraStateLabourCases: number;
  htblPotentialCases: number;
  currentMonthVisits: number;
}

export interface FilterOptions {
  searchQuery: string;
  startDate: string;
  endDate: string;
  cluster: string;
  mandal: string;
  revenueDivision: string;
  industryType: string;
  htblStatus: 'all' | 'htbl_potential' | 'no_elements';
  caseStatus: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'new_visit'
  | 'records'
  | 'master_excel'
  | 'htbl_analysis'
  | 'reports'
  | 'import_export'
  | 'settings';
