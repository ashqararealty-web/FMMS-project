/**
 * Excel Service for Field Visit & Worksite Mapping System
 * Handles export to .xlsx and import from .xlsx preserving the exact column schema.
 */

import * as XLSX from 'xlsx';
import { VisitRecord, HTBLElements } from '../types';
import { initialHTBLElements } from './storage';

// Master standard Excel columns in exact sequence
export const EXCEL_COLUMNS = [
  'Record ID',
  'Reporting Person',
  'Date of Visit',
  'No. of Visit',
  'Month',
  'Name of Cluster',
  'Type of Industry/Worksite',
  'Name of the Industry/Worksite',
  'Location Link',
  'Area/Village/Ward',
  'Mandal',
  'Revenue Division',
  'Police Station',
  'Worksite/Industry Season',
  'No. of Interacted Persons',
  'Approx. No. of Workers',
  'Male Workers',
  'Female Workers',
  'Approx. No. of Families Living in Worksite',
  'Other State Labour – State Names Only',
  'Intra State Labour – District Names Only',
  'Name of Contact Person',
  'Contact Person Phone Number',
  'Name of Owner',
  'Owner Contact Number',
  'Debt/Obligation',
  'Advance (Amount & Details)',
  'Custom/Social Obligation',
  'Succession',
  'Economic Consideration',
  'Caste or Community',
  'Surety/Contract',
  'Inter-State',
  'Right to Minimum Wage',
  'Freedom of Employment',
  'Right to Move Freely',
  'Right to Appropriate/Sell at Market',
  'No Elements',
  'HT&BL Status',
  'Highlights of the Conversations',
  'Observation',
  'Challenges Faced',
  'Case Status',
  'Additional Remarks',
] as const;

function formatElement(elem: { present: boolean; details?: string; amount?: string | number }): string {
  if (!elem || !elem.present) return 'No';
  const parts: string[] = ['Yes'];
  if (elem.amount !== undefined && elem.amount !== '') {
    parts.push(`(Amount: Rs. ${elem.amount})`);
  }
  if (elem.details && elem.details.trim()) {
    parts.push(`- ${elem.details.trim()}`);
  }
  return parts.join(' ');
}

/**
 * Converts a VisitRecord into an Excel row object matching EXCEL_COLUMNS
 */
export function recordToExcelRow(record: VisitRecord): Record<string, any> {
  const h = record.htblElements || initialHTBLElements;

  return {
    'Record ID': record.id,
    'Reporting Person': record.reportingPerson || '',
    'Date of Visit': record.dateOfVisit || '',
    'No. of Visit': record.noOfVisit || '',
    'Month': record.month || '',
    'Name of Cluster': record.clusterName || '',
    'Type of Industry/Worksite': record.industryType || '',
    'Name of the Industry/Worksite': record.industryName || '',
    'Location Link': record.locationLink || '',
    'Area/Village/Ward': record.areaVillageWard || '',
    'Mandal': record.mandal || '',
    'Revenue Division': record.revenueDivision || '',
    'Police Station': record.policeStation || '',
    'Worksite/Industry Season': record.seasonality || '',
    'No. of Interacted Persons': Number(record.interactedPersonsCount) || 0,
    'Approx. No. of Workers': Number(record.approxWorkersCount) || 0,
    'Male Workers': Number(record.maleWorkersCount) || 0,
    'Female Workers': Number(record.femaleWorkersCount) || 0,
    'Approx. No. of Families Living in Worksite': Number(record.familiesCount) || 0,
    'Other State Labour – State Names Only': record.otherStateLabour || '',
    'Intra State Labour – District Names Only': record.intraStateLabour || '',
    'Name of Contact Person': record.contactPersonName || '',
    'Contact Person Phone Number': record.contactPersonPhone || '',
    'Name of Owner': record.ownerName || '',
    'Owner Contact Number': record.ownerPhone || '',
    'Debt/Obligation': formatElement(h.debtObligation),
    'Advance (Amount & Details)': formatElement(h.advance),
    'Custom/Social Obligation': formatElement(h.customSocialObligation),
    'Succession': formatElement(h.succession),
    'Economic Consideration': formatElement(h.economicConsideration),
    'Caste or Community': formatElement(h.casteOrCommunity),
    'Surety/Contract': formatElement(h.suretyOrContract),
    'Inter-State': formatElement(h.interState),
    'Right to Minimum Wage': formatElement(h.rightToMinimumWage),
    'Freedom of Employment': formatElement(h.freedomOfEmployment),
    'Right to Move Freely': formatElement(h.rightToMoveFreely),
    'Right to Appropriate/Sell at Market': formatElement(h.rightToAppropriateSellAtMarket),
    'No Elements': h.noElements ? 'Yes' : 'No',
    'HT&BL Status': record.isHtblPotential ? 'Potential HT&BL Case' : 'No Elements Identified',
    'Highlights of the Conversations': record.conversationHighlights || '',
    'Observation': record.observations || '',
    'Challenges Faced': record.challengesFaced || '',
    'Case Status': record.caseStatus || '',
    'Additional Remarks': record.additionalRemarks || '',
  };
}

export interface MasterExcelSheetData {
  sheetName: string;
  description: string;
  rows: Record<string, any>[];
  records: VisitRecord[];
}

/**
 * Returns structured Master Excel workbook data across all 7 sheets.
 * Automatically synchronizes with records whenever a visit is saved, edited, or deleted.
 */
export function getMasterExcelWorkbookData(records: VisitRecord[]): MasterExcelSheetData[] {
  const allRows = records.map(recordToExcelRow);
  const potentialRecords = records.filter((r) => r.isHtblPotential);
  const identificationRecords = records.filter(
    (r) => r.caseStatus === 'Initial Screening' || !r.caseStatus
  );
  const pipelineRecords = records.filter((r) => r.caseStatus === 'Under Verification');
  const rescueRecords = records.filter(
    (r) =>
      r.caseStatus === 'High Risk / Immediate Follow-up' ||
      r.caseStatus === 'Legal Action Initiated'
  );
  const govtRecords = records.filter(
    (r) => r.caseStatus === 'Referred to District Administration'
  );

  return [
    {
      sheetName: 'Daily Visits&Mapping',
      description: 'Primary Master Sheet containing all logged worksite visits',
      rows: allRows,
      records: records,
    },
    {
      sheetName: 'Potential Cases',
      description: 'Worksite visits with at least one HT&BL indicator identified',
      rows: potentialRecords.map(recordToExcelRow),
      records: potentialRecords,
    },
    {
      sheetName: 'Identification',
      description: 'Cases in initial screening stage awaiting verification',
      rows: identificationRecords.map(recordToExcelRow),
      records: identificationRecords,
    },
    {
      sheetName: 'PIPELINE Cases',
      description: 'Cases actively undergoing on-site verification and evidence gathering',
      rows: pipelineRecords.map(recordToExcelRow),
      records: pipelineRecords,
    },
    {
      sheetName: 'Rescue',
      description: 'High risk cases requiring immediate intervention or legal action',
      rows: rescueRecords.map(recordToExcelRow),
      records: rescueRecords,
    },
    {
      sheetName: 'Govt Relation',
      description: 'Cases officially submitted to District Administration or Labour Dept',
      rows: govtRecords.map(recordToExcelRow),
      records: govtRecords,
    },
    {
      sheetName: 'Sheet2',
      description: 'System template reference and metadata notes',
      rows: [],
      records: [],
    },
  ];
}

/**
 * Exports records to an Excel .xlsx file with Daily Visits&Mapping and thematic sheets
 */
export function exportToExcel(records: VisitRecord[], customFilename?: string): void {
  const rows = records.map(recordToExcelRow);

  // Helper to create styled worksheet
  const createSheet = (dataRows: Record<string, any>[]) => {
    const worksheet = XLSX.utils.json_to_sheet(dataRows, {
      header: [...EXCEL_COLUMNS],
    });

    const colWidths = EXCEL_COLUMNS.map((colName) => {
      let maxLen = colName.length;
      dataRows.forEach((row) => {
        const val = row[colName];
        if (val !== undefined && val !== null) {
          const strVal = String(val);
          if (strVal.length > maxLen) {
            maxLen = Math.min(strVal.length, 45);
          }
        }
      });
      return { wch: Math.max(maxLen + 3, 14) };
    });

    worksheet['!cols'] = colWidths;
    return worksheet;
  };

  const workbook = XLSX.utils.book_new();

  // 1. Primary Sheet: Daily Visits&Mapping
  const primarySheet = createSheet(rows);
  XLSX.utils.book_append_sheet(workbook, primarySheet, 'Daily Visits&Mapping');

  // 2. Potential Cases Sheet
  const potentialRows = records.filter((r) => r.isHtblPotential).map(recordToExcelRow);
  const potentialSheet = createSheet(potentialRows);
  XLSX.utils.book_append_sheet(workbook, potentialSheet, 'Potential Cases');

  // 3. Identification Sheet
  const idRows = records
    .filter((r) => r.caseStatus === 'Initial Screening' || !r.caseStatus)
    .map(recordToExcelRow);
  const idSheet = createSheet(idRows);
  XLSX.utils.book_append_sheet(workbook, idSheet, 'Identification');

  // 4. PIPELINE Cases Sheet
  const pipelineRows = records
    .filter((r) => r.caseStatus === 'Under Verification')
    .map(recordToExcelRow);
  const pipelineSheet = createSheet(pipelineRows);
  XLSX.utils.book_append_sheet(workbook, pipelineSheet, 'PIPELINE Cases');

  // 5. Rescue Sheet
  const rescueRows = records
    .filter((r) => r.caseStatus === 'High Risk / Immediate Follow-up' || r.caseStatus === 'Legal Action Initiated')
    .map(recordToExcelRow);
  const rescueSheet = createSheet(rescueRows);
  XLSX.utils.book_append_sheet(workbook, rescueSheet, 'Rescue');

  // 6. Govt Relation Sheet
  const govtRows = records
    .filter((r) => r.caseStatus === 'Referred to District Administration')
    .map(recordToExcelRow);
  const govtSheet = createSheet(govtRows);
  XLSX.utils.book_append_sheet(workbook, govtSheet, 'Govt Relation');

  // 7. Sheet2
  const sheet2 = createSheet([]);
  XLSX.utils.book_append_sheet(workbook, sheet2, 'Sheet2');

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `Field_Visits_Master_${todayStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

/**
 * Downloads a clean blank Excel template with headers pre-filled
 */
export function downloadTemplate(): void {
  const emptyRow: Record<string, any> = {};
  EXCEL_COLUMNS.forEach((col) => {
    emptyRow[col] = '';
  });

  const sampleRow: Record<string, any> = {
    'Record ID': 'FV-2026-001',
    'Reporting Person': 'Sample Staff Name',
    'Date of Visit': '2026-09-22',
    'No. of Visit': '1st Visit',
    'Month': 'September',
    'Name of Cluster': 'Industrial Cluster A',
    'Type of Industry/Worksite': 'Brick Kiln',
    'Name of the Industry/Worksite': 'Star Brick Works',
    'Location Link': 'https://maps.google.com/?q=17.3850,78.4867',
    'Area/Village/Ward': 'Village Rampur',
    'Mandal': 'Mandal Name',
    'Revenue Division': 'Division Name',
    'Police Station': 'Town PS',
    'Worksite/Industry Season': 'Seasonal',
    'No. of Interacted Persons': 10,
    'Approx. No. of Workers': 40,
    'Male Workers': 25,
    'Female Workers': 15,
    'Approx. No. of Families Living in Worksite': 12,
    'Other State Labour – State Names Only': 'Odisha, Bihar',
    'Intra State Labour – District Names Only': 'District X',
    'Name of Contact Person': 'Mukadam Name',
    'Contact Person Phone Number': '9876543210',
    'Name of Owner': 'Owner Name',
    'Owner Contact Number': '9123456780',
    'Debt/Obligation': 'Yes - advance taken from middleman',
    'Advance (Amount & Details)': 'Yes (Amount: Rs. 35000) - Paid in home village',
    'Custom/Social Obligation': 'No',
    'Succession': 'No',
    'Economic Consideration': 'Yes - Drought in source village',
    'Caste or Community': 'Yes - Marginalized community',
    'Surety/Contract': 'Yes - Identity documents held',
    'Inter-State': 'Yes - Inter-state migrant group',
    'Right to Minimum Wage': 'Yes - Paid below statutory wage',
    'Freedom of Employment': 'Yes - Cannot work elsewhere',
    'Right to Move Freely': 'Yes - Movement monitored',
    'Right to Appropriate/Sell at Market': 'No',
    'No Elements': 'No',
    'HT&BL Status': 'Potential HT&BL Case',
    'Highlights of the Conversations': 'Interacted with 4 families in shelter sheds.',
    'Observation': 'Lack of safe water and sanitation facilities.',
    'Challenges Faced': 'Manager was reluctant initially.',
    'Case Status': 'High Risk / Immediate Follow-up',
    'Additional Remarks': 'Joint inspection scheduled with Labour Department.',
  };

  const worksheet = XLSX.utils.json_to_sheet([sampleRow], {
    header: [...EXCEL_COLUMNS],
  });

  worksheet['!cols'] = EXCEL_COLUMNS.map((col) => ({ wch: Math.max(col.length + 4, 15) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Field Visits Template');
  XLSX.writeFile(workbook, '1.xlsx');
}

/**
 * Normalizes header string for fuzzy matching
 */
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Helper to parse boolean/string values for HT&BL items from Excel cell
 */
function parseHTBLCell(val: any): { present: boolean; details: string; amount?: string | number } {
  if (val === undefined || val === null) return { present: false, details: '' };
  const str = String(val).trim();
  if (!str) return { present: false, details: '' };

  const lower = str.toLowerCase();
  if (lower === 'no' || lower === 'false' || lower === '0' || lower === 'nil' || lower === 'none') {
    return { present: false, details: '' };
  }

  // Check if it has an amount e.g. "Yes (Amount: Rs. 35000) - Details"
  let amount: string | undefined = undefined;
  const amountMatch = str.match(/amount[:\s]+(?:rs\.?|inr)?\s*([0-9,]+)/i);
  if (amountMatch) {
    amount = amountMatch[1].replace(/,/g, '');
  }

  // Check if it starts with Yes
  const isPresent = lower.startsWith('yes') || lower.startsWith('y') || lower.startsWith('true') || lower.startsWith('1') || str.length > 0;
  return {
    present: isPresent,
    details: str.replace(/^yes\s*[-:,]?\s*/i, '').trim(),
    amount,
  };
}

/**
 * Imports records from an uploaded Excel file
 */
export async function importFromExcel(file: File): Promise<{
  success: boolean;
  records: VisitRecord[];
  count: number;
  headers: string[];
  matchedColumnsCount: number;
  errors: string[];
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          return resolve({
            success: false,
            records: [],
            count: 0,
            headers: [],
            matchedColumnsCount: 0,
            errors: ['Workbook does not contain any sheets'],
          });
        }

        // Find sheet named 'Daily Visits&Mapping' (or similar), or fallback to first sheet
        let targetSheetName = workbook.SheetNames[0];
        const dailyVisitsSheet = workbook.SheetNames.find(
          (s) => s.toLowerCase().includes('daily') && s.toLowerCase().includes('visit')
        ) || workbook.SheetNames.find(
          (s) => s.toLowerCase().includes('visit') || s.toLowerCase().includes('mapping')
        );

        if (dailyVisitsSheet) {
          targetSheetName = dailyVisitsSheet;
        }

        const worksheet = workbook.Sheets[targetSheetName];

        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonRows || jsonRows.length < 2) {
          return resolve({
            success: false,
            records: [],
            count: 0,
            headers: [],
            matchedColumnsCount: 0,
            errors: ['The Excel sheet contains no data rows or headers.'],
          });
        }

        // Header row
        const headerRow: string[] = (jsonRows[0] || []).map((h: any) => String(h || '').trim());

        // Build header index map using normalized names
        const headerMap = new Map<string, number>();
        headerRow.forEach((h, index) => {
          if (h) {
            headerMap.set(normalizeHeader(h), index);
          }
        });

        const findVal = (row: any[], possibleNames: string[]): any => {
          for (const name of possibleNames) {
            const idx = headerMap.get(normalizeHeader(name));
            if (idx !== undefined && row[idx] !== undefined && row[idx] !== null) {
              return row[idx];
            }
          }
          return undefined;
        };

        const records: VisitRecord[] = [];
        const errors: string[] = [];
        const now = new Date().toISOString();

        for (let i = 1; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0 || row.every((c: any) => c === undefined || c === null || String(c).trim() === '')) {
            continue; // Skip empty rows
          }

          const rawId = findVal(row, ['Record ID', 'ID', 'S.No', 'SNo', 'Sl No']);
          const id = rawId ? String(rawId).trim() : `FV-IMP-${Date.now().toString().slice(-4)}-${i}`;

          const reportingPerson = String(findVal(row, ['Reporting Person', 'Staff Name', 'Officer Name', 'Reporter']) || '').trim();
          
          let dateOfVisit = String(findVal(row, ['Date of Visit', 'Date', 'Visit Date']) || '').trim();
          // Handle numeric Excel date if needed
          if (typeof findVal(row, ['Date of Visit', 'Date']) === 'number') {
            const excelDate = findVal(row, ['Date of Visit', 'Date']);
            const parsed = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
            if (!isNaN(parsed.getTime())) {
              dateOfVisit = parsed.toISOString().split('T')[0];
            }
          }

          const noOfVisit = String(findVal(row, ['No. of Visit', 'No of Visit', 'Visit Count']) || '1st Visit').trim();
          const month = String(findVal(row, ['Month']) || '').trim();
          const clusterName = String(findVal(row, ['Name of Cluster', 'Cluster', 'Cluster Name']) || '').trim();
          const industryType = String(findVal(row, ['Type of Industry/Worksite', 'Industry Type', 'Worksite Type']) || 'Other').trim();
          const industryName = String(findVal(row, ['Name of the Industry/Worksite', 'Industry Name', 'Worksite Name', 'Industry']) || '').trim();
          const locationLink = String(findVal(row, ['Location Link', 'Map Link', 'Location', 'GPS Link']) || '').trim();
          const areaVillageWard = String(findVal(row, ['Area/Village/Ward', 'Village', 'Area', 'Ward']) || '').trim();
          const mandal = String(findVal(row, ['Mandal', 'Block']) || '').trim();
          const revenueDivision = String(findVal(row, ['Revenue Division', 'Sub Division', 'Division']) || '').trim();
          const policeStation = String(findVal(row, ['Police Station', 'PS']) || '').trim();
          const seasonality = String(findVal(row, ['Worksite/Industry Season', 'Season', 'Seasonality']) || 'Seasonal').trim();

          const interactedPersonsCount = Number(findVal(row, ['No. of Interacted Persons', 'Interacted Persons'])) || 0;
          const approxWorkersCount = Number(findVal(row, ['Approx. No. of Workers', 'Approx Workers', 'Total Workers'])) || 0;
          const maleWorkersCount = Number(findVal(row, ['Male Workers', 'Male'])) || 0;
          const femaleWorkersCount = Number(findVal(row, ['Female Workers', 'Female'])) || 0;
          const familiesCount = Number(findVal(row, ['Approx. No. of Families Living in Worksite', 'Families Living in Worksite', 'Families'])) || 0;

          const otherStateLabour = String(findVal(row, ['Other State Labour – State Names Only', 'Other State Labour', 'Interstate Labour']) || '').trim();
          const intraStateLabour = String(findVal(row, ['Intra State Labour – District Names Only', 'Intra State Labour']) || '').trim();

          const contactPersonName = String(findVal(row, ['Name of Contact Person', 'Contact Person']) || '').trim();
          const contactPersonPhone = String(findVal(row, ['Contact Person Phone Number', 'Phone Number', 'Contact Phone']) || '').trim();
          const ownerName = String(findVal(row, ['Name of Owner', 'Owner Name', 'Owner']) || '').trim();
          const ownerPhone = String(findVal(row, ['Owner Contact Number', 'Contact Number', 'Owner Phone']) || '').trim();

          // HT&BL elements
          const debtObligation = parseHTBLCell(findVal(row, ['Debt/Obligation', 'Debt Obligation', 'Debt']));
          const advance = parseHTBLCell(findVal(row, ['Advance (Amount & Details)', 'Advance', 'Wage Advance']));
          const customSocialObligation = parseHTBLCell(findVal(row, ['Custom/Social Obligation', 'Custom Obligation']));
          const succession = parseHTBLCell(findVal(row, ['Succession', 'Hereditary']));
          const economicConsideration = parseHTBLCell(findVal(row, ['Economic Consideration']));
          const casteOrCommunity = parseHTBLCell(findVal(row, ['Caste or Community', 'Caste/Community']));
          const suretyOrContract = parseHTBLCell(findVal(row, ['Surety/Contract', 'Surety Contract', 'Contract']));
          const interState = parseHTBLCell(findVal(row, ['Inter-State', 'Interstate', 'Migrant']));
          const rightToMinimumWage = parseHTBLCell(findVal(row, ['Right to Minimum Wage', 'Minimum Wage']));
          const freedomOfEmployment = parseHTBLCell(findVal(row, ['Freedom of Employment', 'Freedom Employment']));
          const rightToMoveFreely = parseHTBLCell(findVal(row, ['Right to Move Freely', 'Move Freely', 'Freedom of Movement']));
          const rightToAppropriateSellAtMarket = parseHTBLCell(findVal(row, ['Right to Appropriate/Sell at Market', 'Appropriate Sell at Market', 'Market Freedom']));
          
          const rawNoElements = findVal(row, ['No Elements', 'No Elements Identified']);
          const noElements = rawNoElements ? String(rawNoElements).toLowerCase().startsWith('y') : false;

          const htblElements: HTBLElements = {
            debtObligation,
            advance,
            customSocialObligation,
            succession,
            economicConsideration,
            casteOrCommunity,
            suretyOrContract,
            interState,
            rightToMinimumWage,
            freedomOfEmployment,
            rightToMoveFreely,
            rightToAppropriateSellAtMarket,
            noElements,
          };

          const isHtblPotential = !noElements && Boolean(
            debtObligation.present ||
            advance.present ||
            customSocialObligation.present ||
            succession.present ||
            economicConsideration.present ||
            casteOrCommunity.present ||
            suretyOrContract.present ||
            interState.present ||
            rightToMinimumWage.present ||
            freedomOfEmployment.present ||
            rightToMoveFreely.present ||
            rightToAppropriateSellAtMarket.present
          );

          const conversationHighlights = String(findVal(row, ['Highlights of the Conversations', 'Conversation Highlights', 'Conversations']) || '').trim();
          const observations = String(findVal(row, ['Observation', 'Observations']) || '').trim();
          const challengesFaced = String(findVal(row, ['Challenges Faced', 'Challenges']) || '').trim();
          const rawCaseStatus = String(findVal(row, ['Case Status', 'Status']) || 'Initial Screening').trim();
          const additionalRemarks = String(findVal(row, ['Additional Remarks', 'Remarks']) || '').trim();

          records.push({
            id,
            createdAt: now,
            updatedAt: now,
            reportingPerson,
            dateOfVisit,
            noOfVisit,
            month,
            clusterName,
            industryType,
            industryName: industryName || `Imported Worksite ${i}`,
            locationLink,
            areaVillageWard,
            mandal,
            revenueDivision,
            policeStation,
            seasonality,
            interactedPersonsCount,
            approxWorkersCount,
            maleWorkersCount,
            femaleWorkersCount,
            familiesCount,
            otherStateLabour,
            intraStateLabour,
            contactPersonName,
            contactPersonPhone,
            ownerName,
            ownerPhone,
            htblElements,
            isHtblPotential,
            conversationHighlights,
            observations,
            challengesFaced,
            caseStatus: (rawCaseStatus as any) || 'Initial Screening',
            additionalRemarks,
          });
        }

        resolve({
          success: true,
          records,
          count: records.length,
          headers: headerRow,
          matchedColumnsCount: headerMap.size,
          errors,
        });
      } catch (err: any) {
        console.error('Failed to parse excel:', err);
        resolve({
          success: false,
          records: [],
          count: 0,
          headers: [],
          matchedColumnsCount: 0,
          errors: [err.message || 'Failed to process Excel file'],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        records: [],
        count: 0,
        headers: [],
        matchedColumnsCount: 0,
        errors: ['File reading error'],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}
