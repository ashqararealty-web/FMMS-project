import React, { useState, useRef } from 'react';
import { VisitRecord, UserProfile } from '../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  FileCheck,
  FileText,
  Save,
  HelpCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Cloud,
} from 'lucide-react';
import {
  exportToExcel,
  importFromExcel,
  downloadTemplate,
  EXCEL_COLUMNS,
} from '../services/excelService';
import { StorageService } from '../services/storage';

interface ImportExportViewProps {
  records: VisitRecord[];
  onImportComplete: (newRecords: VisitRecord[]) => void;
  onImportToFirestore?: (records: VisitRecord[]) => Promise<{ added: number; updated: number }>;
  currentUser?: UserProfile | null;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  records,
  onImportComplete,
  onImportToFirestore,
  currentUser,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Import workflow state
  const [isProcessing, setIsProcessing] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    file: File;
    count: number;
    headers: string[];
    records: VisitRecord[];
    matchedCount: number;
  } | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Handle Excel file drop or selection
  const handleFileSelected = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setFeedback({
        type: 'error',
        message: 'Please upload an Excel file (.xlsx or .xls).',
      });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      const result = await importFromExcel(file);

      if (!result.success) {
        setFeedback({
          type: 'error',
          message: result.errors?.[0] || 'Could not parse Excel file.',
        });
        setIsProcessing(false);
        return;
      }

      if (result.count === 0) {
        setFeedback({
          type: 'error',
          message: 'No data rows found in the uploaded Excel file or Daily Visits&Mapping sheet.',
        });
        setIsProcessing(false);
        return;
      }

      setImportPreview({
        file,
        count: result.count,
        headers: result.headers,
        records: result.records,
        matchedCount: result.matchedColumnsCount,
      });
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: e.message || 'Error reading file',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm import into Firestore and local cache
  const handleConfirmImport = async () => {
    if (!importPreview) return;

    setIsProcessing(true);
    try {
      let added = 0;
      let updated = 0;

      if (onImportToFirestore) {
        const res = await onImportToFirestore(importPreview.records);
        added = res.added;
        updated = res.updated;
      } else {
        const res = StorageService.bulkImport(importPreview.records);
        added = res.added;
        updated = res.updated;
        onImportComplete(StorageService.getRecords());
      }

      setFeedback({
        type: 'success',
        message: `Successfully imported ${added} new records and updated ${updated} existing records into Cloud Firestore!`,
      });
      setImportPreview(null);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error importing records to Firestore.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Backup JSON export
  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify(records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Field_Visits_Cloud_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Master Excel (.xlsx) Hub
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Excel Export, Import &amp; Master Workbook
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Strictly preserves <span className="font-mono font-bold text-slate-700">1.xlsx</span> schema structure, multi-sheet hierarchy, and all statutory columns.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="export-master-excel-header-btn"
            onClick={() => exportToExcel(records, `Field_Visits_Master_Export_${new Date().toISOString().split('T')[0]}.xlsx`)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Master Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Two Column Grid: Export vs Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* EXPORT SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Export Master Excel (One Workbook)</h2>
                <p className="text-xs text-slate-500">Includes all {records.length} records in 1.xlsx format</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Downloads a master Microsoft Excel workbook containing all field visit records from Firestore. All template worksheets are preserved:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Primary Sheet:</span>
                <span className="font-mono font-bold text-emerald-800">Daily Visits&Mapping</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Master Sheets:</span>
                <span className="font-mono text-slate-700 text-[11px]">Identification, Potential Cases, PIPELINE Cases, Rescue, Govt Relation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Columns:</span>
                <span className="font-bold text-slate-800">{EXCEL_COLUMNS.length} Columns</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Live Firestore Records:</span>
                <span className="font-bold text-emerald-700">{records.length} Worksite Visits</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-900">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Automatic Live Sync:</strong> When you click <em>Save Visit</em>, your Master Excel is updated automatically in real-time. Exporting is never required to keep your master data synchronized.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              id="export-master-excel-main-btn"
              onClick={() => exportToExcel(records, `Field_Visits_Master_Export_${new Date().toISOString().split('T')[0]}.xlsx`)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Master Excel ({records.length} Records)
            </button>

            <button
              onClick={() => downloadTemplate()}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Download Blank Template (1.xlsx)
            </button>
          </div>
        </div>

        {/* IMPORT SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Import Excel to Cloud Firestore</h2>
                <p className="text-xs text-slate-500">Upload existing .xlsx spreadsheet to database</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Upload existing fieldwork spreadsheets. The system reads the <span className="font-mono font-bold text-slate-700">Daily Visits&Mapping</span> worksheet, maps all 43 statutory columns, and imports records into Firestore.
            </p>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileSelected(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl p-6 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drag & drop .xlsx file
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Reads master worksheet "Daily Visits&Mapping"
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Supported: .xlsx, .xls</span>
            <button
              onClick={handleDownloadBackup}
              className="text-slate-600 hover:text-slate-900 font-semibold underline"
            >
              Download JSON Backup
            </button>
          </div>
        </div>

      </div>

      {/* IMPORT PREVIEW MODAL */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Confirm Import to Firestore</h3>
                <p className="text-xs text-slate-500">{importPreview.file.name}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Records to Import:</span>
                <span className="font-bold text-emerald-800 text-sm">{importPreview.count} visits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Firestore Collection:</span>
                <span className="font-mono font-bold text-slate-800">visits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Column Match:</span>
                <span className="font-bold text-slate-700">
                  {importPreview.matchedCount} of {EXCEL_COLUMNS.length} recognized
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              The records will be uploaded directly to Cloud Firestore and synchronized across all field devices. Existing records with matching IDs will be updated.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-import-firestore-btn"
                onClick={handleConfirmImport}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                {isProcessing ? 'Importing to Firestore...' : `Import ${importPreview.count} Records`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
