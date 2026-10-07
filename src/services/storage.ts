/**
 * Storage and Computation utilities for Field Visit & Worksite Mapping System
 * All statistics and counts are computed dynamically from Firestore records.
 */

import { VisitRecord, HTBLElements, DashboardStats, HTBLFlag } from '../types';

export const initialHTBLElements: HTBLElements = {
  debtObligation: { present: false, details: '' },
  advance: { present: false, amount: '', details: '' },
  customSocialObligation: { present: false, details: '' },
  succession: { present: false, details: '' },
  economicConsideration: { present: false, details: '' },
  casteOrCommunity: { present: false, details: '' },
  suretyOrContract: { present: false, details: '' },
  interState: { present: false, details: '' },
  rightToMinimumWage: { present: false, details: '' },
  freedomOfEmployment: { present: false, details: '' },
  rightToMoveFreely: { present: false, details: '' },
  rightToAppropriateSellAtMarket: { present: false, details: '' },
  victimSupport: { present: false, details: '' },
  readyToRescue: { present: false, details: '' },
  noElements: true,
};

/**
 * Counts active statutory Yes/No indicators in debt obligation / bonded labour elements.
 */
export function getHTBLYesCount(elements?: HTBLElements | null): number {
  if (!elements || elements.noElements) return 0;
  let count = 0;
  if (elements.debtObligation?.present) count++;
  if (elements.advance?.present) count++;
  if (elements.customSocialObligation?.present) count++;
  if (elements.succession?.present) count++;
  if (elements.economicConsideration?.present) count++;
  if (elements.casteOrCommunity?.present) count++;
  if (elements.suretyOrContract?.present) count++;
  if (elements.interState?.present) count++;
  if (elements.rightToMinimumWage?.present) count++;
  if (elements.freedomOfEmployment?.present) count++;
  if (elements.rightToMoveFreely?.present) count++;
  if (elements.rightToAppropriateSellAtMarket?.present) count++;
  return count;
}

/**
 * Computes statutory HT&BL classification flag:
 * - Pipeline: ready to rescue 1
 * - Potential Case: at least 3 yes victim support (if there are more than 3 yes with victim support than also consider it as potential case)
 * - Identification: 3 yes in debt obligation
 */
export function computeHTBLFlag(elements?: HTBLElements | null): HTBLFlag {
  if (!elements || elements.noElements) return 'None';

  // Pipeline : ready to rescue 1
  if (Boolean(elements.readyToRescue?.present)) {
    return 'Pipeline';
  }

  const count = getHTBLYesCount(elements);
  const isVictimSupport = Boolean(elements.victimSupport?.present);

  // Potential case : at least 3 yes victim support (if there are more than 3 yes with victim support than also consider it as potential case)
  if (isVictimSupport && count >= 3) {
    return 'Potential';
  }

  // Identification : 3 yes in debt obligation
  if (count >= 3) {
    return 'Identification';
  }

  return 'None';
}

// Compute whether the record is flagged as a Potential Case (at least 3 Yes + Victim Support)
export function computeIsHtblPotential(elements?: HTBLElements | null): boolean {
  return computeHTBLFlag(elements) === 'Potential';
}

// Compute whether the record is flagged as an Identification Case (3 Yes in debt obligation)
export function computeIsHtblIdentification(elements?: HTBLElements | null): boolean {
  return computeHTBLFlag(elements) === 'Identification';
}

// Compute whether the record is flagged as a PIPELINE Case (ready to rescue 1)
export function computeIsHtblPipeline(elements?: HTBLElements | null): boolean {
  return computeHTBLFlag(elements) === 'Pipeline';
}

// Dynamically compute dashboard statistics from actual Firestore records
export function calculateDashboardStats(records: VisitRecord[]): DashboardStats {
  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYear = now.getFullYear();

  const uniqueWorksites = new Set(
    records.map((r) => `${(r.industryName || '').trim().toLowerCase()}_${(r.mandal || '').trim().toLowerCase()}`)
  );

  let totalWorkers = 0;
  let maleWorkers = 0;
  let femaleWorkers = 0;
  let interStateLabourCases = 0;
  let intraStateLabourCases = 0;
  let htblPotentialCases = 0;
  let htblIdentificationCases = 0;
  let htblPipelineCases = 0;
  let currentMonthVisits = 0;

  records.forEach((r) => {
    totalWorkers += Number(r.approxWorkersCount) || 0;
    maleWorkers += Number(r.maleWorkersCount) || 0;
    femaleWorkers += Number(r.femaleWorkersCount) || 0;

    if (r.otherStateLabour && r.otherStateLabour.trim() && r.otherStateLabour.toLowerCase() !== 'none') {
      interStateLabourCases++;
    }
    if (r.intraStateLabour && r.intraStateLabour.trim() && r.intraStateLabour.toLowerCase() !== 'none') {
      intraStateLabourCases++;
    }

    const flag = r.htblFlag || computeHTBLFlag(r.htblElements);
    if (flag === 'Potential' || r.isHtblPotential) {
      htblPotentialCases++;
    }
    if (flag === 'Identification') {
      htblIdentificationCases++;
    }
    if (flag === 'Pipeline') {
      htblPipelineCases++;
    }

    if (r.dateOfVisit) {
      const visitDate = new Date(r.dateOfVisit);
      if (visitDate.getMonth() === currentMonthNum && visitDate.getFullYear() === currentYear) {
        currentMonthVisits++;
      }
    }
  });

  return {
    totalVisits: records.length,
    totalWorksites: uniqueWorksites.size,
    totalWorkers,
    maleWorkers,
    femaleWorkers,
    interStateLabourCases,
    intraStateLabourCases,
    htblPotentialCases,
    htblIdentificationCases,
    htblPipelineCases,
    currentMonthVisits,
  };
}

const STORAGE_KEY = 'field_visit_records_v3';

export const StorageService = {
  getRecords(): VisitRecord[] {
    try {
      // Purge old legacy test storage keys if still present
      if (localStorage.getItem('field_visit_records_v1')) {
        localStorage.removeItem('field_visit_records_v1');
      }
      if (localStorage.getItem('field_visit_records_v2')) {
        localStorage.removeItem('field_visit_records_v2');
      }
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading localStorage records:', e);
    }
    return [];
  },

  saveRecord(
    recordData: Omit<VisitRecord, 'id' | 'createdAt' | 'updatedAt' | 'isHtblPotential'> & { id?: string }
  ): VisitRecord {
    const records = this.getRecords();
    const now = new Date().toISOString();
    const isHtbl = computeIsHtblPotential(recordData.htblElements);

    let id = recordData.id;
    if (!id) {
      let maxNum = 2314;
      records.forEach((r) => {
        const m = (r.id || '').match(/(\d+)/);
        if (m) {
          const val = parseInt(m[1], 10);
          if (val > maxNum) maxNum = val;
        }
      });
      id = `FV-${maxNum + 1}`;
    }

    const existingIndex = records.findIndex((r) => r.id === id);
    let savedRecord: VisitRecord;
    const flag = computeHTBLFlag(recordData.htblElements);
    const yesCount = getHTBLYesCount(recordData.htblElements);

    if (existingIndex >= 0) {
      savedRecord = {
        ...records[existingIndex],
        ...recordData,
        id,
        isHtblPotential: isHtbl,
        htblFlag: flag,
        htblYesCount: yesCount,
        updatedAt: now,
      };
      records[existingIndex] = savedRecord;
    } else {
      savedRecord = {
        ...recordData,
        id,
        isHtblPotential: isHtbl,
        htblFlag: flag,
        htblYesCount: yesCount,
        createdAt: now,
        updatedAt: now,
      };
      records.unshift(savedRecord);
    }

    this.saveAllRecords(records);
    return savedRecord;
  },

  saveAllRecords(records: VisitRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving records to localStorage:', e);
    }
  },

  deleteRecord(id: string): void {
    const records = this.getRecords().filter((r) => r.id !== id);
    this.saveAllRecords(records);
  },

  clearAllRecords(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('field_visit_records_v2');
      localStorage.removeItem('field_visit_records_v1');
      localStorage.removeItem('fv_default_officer');
      localStorage.removeItem('fv_default_cluster');
      localStorage.removeItem('fv_organization');
    } catch (e) {
      console.error('Error clearing localStorage records:', e);
    }
  },

  bulkImport(newRecords: VisitRecord[]): { added: number; updated: number } {
    const existing = this.getRecords();
    const map = new Map<string, VisitRecord>();
    existing.forEach((r) => map.set(r.id, r));

    let added = 0;
    let updated = 0;

    newRecords.forEach((record) => {
      if (map.has(record.id)) {
        updated++;
        map.set(record.id, { ...map.get(record.id)!, ...record });
      } else {
        added++;
        map.set(record.id, record);
      }
    });

    const combined = Array.from(map.values());
    this.saveAllRecords(combined);
    return { added, updated };
  },

  calculateStats(records?: VisitRecord[]): DashboardStats {
    const target = records || this.getRecords();
    return calculateDashboardStats(target);
  },

  // Pure local utility for JSON backups
  exportBackupJson(records?: VisitRecord[]): string {
    const target = records || this.getRecords();
    const payload = {
      app: 'FMM BLSA Project',
      version: '2.0.0-firebase',
      exportedAt: new Date().toISOString(),
      recordCount: target.length,
      records: target,
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackupJson(jsonString: string): { success: boolean; records: VisitRecord[]; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      let recordsToImport: VisitRecord[] = [];
      if (Array.isArray(parsed)) {
        recordsToImport = parsed;
      } else if (parsed && Array.isArray(parsed.records)) {
        recordsToImport = parsed.records;
      } else {
        return { success: false, records: [], error: 'Invalid JSON backup format' };
      }

      const validRecords = recordsToImport.filter((r) => r && r.id && r.industryName);
      if (validRecords.length === 0) {
        return { success: false, records: [], error: 'No valid visit records found in file' };
      }

      return { success: true, records: validRecords };
    } catch (e: any) {
      return { success: false, records: [], error: e.message || 'Failed to parse JSON' };
    }
  },
};
