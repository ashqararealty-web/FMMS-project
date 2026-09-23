import React, { useState, useMemo } from 'react';
import { VisitRecord } from '../types';
import { FmmLogo } from './FmmLogo';
import {
  EXCEL_COLUMNS,
  getMasterExcelWorkbookData,
  exportToExcel,
} from '../services/excelService';
import {
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle,
  Eye,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface MasterExcelViewProps {
  records: VisitRecord[];
  onViewRecord: (record: VisitRecord) => void;
  onNewVisit?: () => void;
}

export const MasterExcelView: React.FC<MasterExcelViewProps> = ({
  records,
  onViewRecord,
  onNewVisit,
}) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Compute live sheets data from current records
  const sheets = useMemo(() => {
    return getMasterExcelWorkbookData(records);
  }, [records]);

  const activeSheet = sheets[activeSheetIndex] || sheets[0];

  // Filter rows by search query
  const filteredRowsWithRecord = useMemo(() => {
    if (!activeSheet || !activeSheet.rows) return [];

    const q = searchQuery.toLowerCase().trim();
    const rows = activeSheet.rows;
    const sheetRecords = activeSheet.records;

    const paired = rows.map((row, idx) => ({
      row,
      record: sheetRecords[idx] || null,
      rowNumber: idx + 1,
    }));

    if (!q) return paired;

    return paired.filter((item) => {
      return Object.values(item.row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [activeSheet, searchQuery]);

  // Pagination
  const totalRows = filteredRowsWithRecord.length;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRowsWithRecord.slice(start, start + pageSize);
  }, [filteredRowsWithRecord, currentPage, pageSize]);

  const handleSheetChange = (index: number) => {
    setActiveSheetIndex(index);
    setCurrentPage(1);
  };

  const handleExportDownload = () => {
    exportToExcel(records);
  };

  // Helper to convert index to Excel column letter (0 -> A, 1 -> B, ..., 26 -> AA)
  const getColLetter = (idx: number): string => {
    let letter = '';
    while (idx >= 0) {
      letter = String.fromCharCode((idx % 26) + 65) + letter;
      idx = Math.floor(idx / 26) - 1;
    }
    return letter;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Auto-Update Confirmation */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-1 bg-white border border-emerald-200 rounded-lg shadow-2xs shrink-0">
            <FmmLogo size="sm" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-emerald-950">
                FMM BLSA Project • Master Excel Workbook (1.xlsx Standard)
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Auto-Updated on Save
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Every time you click <strong>Save Visit</strong>, all 7 worksheets in this Master Excel are automatically updated in real time. 
              <strong> You do not need to export to keep your master data up-to-date.</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto">
          {onNewVisit && (
            <button
              onClick={onNewVisit}
              className="min-h-[44px] px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              + Log Visit
            </button>
          )}
          <button
            onClick={handleExportDownload}
            title="Download an offline .xlsx snapshot anytime"
            className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .xlsx Copy</span>
          </button>
        </div>
      </div>

      {/* Main Excel Container with Spreadsheet Frame */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden flex flex-col">
        {/* Excel Ribbon / Controls Bar */}
        <div className="bg-slate-100/90 border-b border-slate-300 p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Active Sheet Info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Sheet: <span className="text-emerald-700">{activeSheet.sheetName}</span>
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              {activeSheet.description}
            </span>
          </div>

          {/* Search & Density */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search in ${activeSheet.sheetName}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-60 min-h-[38px] pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-md text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="min-h-[38px] py-1 px-2 bg-white border border-slate-300 rounded-md text-xs text-slate-600 focus:outline-hidden"
            >
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
              <option value={500}>All rows</option>
            </select>
          </div>
        </div>

        {/* Live Excel Sheet Tabs (Green Excel style with horizontal touch momentum scrolling) */}
        <div className="bg-slate-200 border-b border-slate-300 px-2 pt-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {sheets.map((sheet, idx) => {
            const isActive = idx === activeSheetIndex;
            const count = sheet.rows.length;
            return (
              <button
                key={sheet.sheetName}
                onClick={() => handleSheetChange(idx)}
                className={`flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap border-t border-x ${
                  isActive
                    ? 'bg-white text-emerald-900 border-slate-300 border-b-white -mb-px font-semibold shadow-xs'
                    : 'bg-slate-200 hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                <span>{sheet.sheetName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile horizontal scroll hint */}
        <div className="sm:hidden px-3 py-1.5 bg-emerald-50 border-b border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
          <span>↔ Swipe table horizontally for all columns</span>
          <span className="font-semibold text-emerald-900">{totalRows} rows</span>
        </div>

        {/* Spreadsheet Data Grid */}
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto divide-y divide-slate-200 table-responsive custom-scrollbar">
          {totalRows === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No rows in {activeSheet.sheetName}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {activeSheet.sheetName === 'Daily Visits&Mapping'
                  ? 'No worksite visits logged yet. Use "+ Log Visit" to add visits, which will automatically appear here.'
                  : `Records categorized as "${activeSheet.sheetName}" will be automatically populated here as visits are saved.`}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              {/* Header row 1: Column letters A, B, C... */}
              <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs border-b border-slate-300">
                <tr className="bg-slate-100 text-[10px] text-slate-400 font-mono select-none">
                  <th className="w-10 min-w-10 px-2 py-1 text-center bg-slate-200 border-r border-slate-300">
                    #
                  </th>
                  <th className="w-14 min-w-14 px-2 py-1 text-center bg-slate-200 border-r border-slate-300">
                    Action
                  </th>
                  {EXCEL_COLUMNS.map((col, idx) => (
                    <th
                      key={`col-letter-${idx}`}
                      className="px-3 py-0.5 text-center font-normal border-r border-slate-200 uppercase"
                    >
                      {getColLetter(idx)}
                    </th>
                  ))}
                </tr>

                {/* Header row 2: Excel Column Names */}
                <tr className="bg-emerald-800 text-white font-semibold text-xs divide-x divide-emerald-700">
                  <th className="w-10 min-w-10 px-2 py-2 text-center bg-emerald-900 text-emerald-200">
                    Row
                  </th>
                  <th className="w-14 min-w-14 px-2 py-2 text-center bg-emerald-900 text-emerald-200">
                    View
                  </th>
                  {EXCEL_COLUMNS.map((colName) => (
                    <th
                      key={colName}
                      className="px-3 py-2 whitespace-nowrap min-w-[140px] text-emerald-50 tracking-wide text-xs"
                    >
                      {colName}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
                {paginatedItems.map((item, rowIdx) => {
                  const isEven = rowIdx % 2 === 0;
                  const row = item.row;
                  const record = item.record;

                  return (
                    <tr
                      key={`row-${item.rowNumber}`}
                      className={`hover:bg-amber-50/70 transition-colors ${
                        isEven ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      {/* Row index indicator */}
                      <td className="w-10 min-w-10 px-2 py-1.5 text-center font-mono text-[10px] text-slate-400 bg-slate-100 border-r border-slate-200 select-none">
                        {item.rowNumber}
                      </td>

                      {/* View Action */}
                      <td className="w-14 min-w-14 px-2 py-1.5 text-center border-r border-slate-200">
                        {record && (
                          <button
                            onClick={() => onViewRecord(record)}
                            title="View full record card"
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>

                      {/* Data Columns matching EXCEL_COLUMNS */}
                      {EXCEL_COLUMNS.map((col) => {
                        const cellVal = row[col];
                        const isId = col === 'Record ID';
                        const isPotential = col === 'HT&BL Status' && cellVal?.includes('Potential');
                        const isDate = col === 'Date of Visit';
                        const isName = col === 'Name of the Industry/Worksite';

                        return (
                          <td
                            key={col}
                            className={`px-3 py-1.5 border-r border-slate-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px] ${
                              isId ? 'font-bold text-emerald-800' : 'text-slate-700'
                            }`}
                          >
                            {isPotential ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                                {cellVal}
                              </span>
                            ) : isId ? (
                              <button
                                onClick={() => record && onViewRecord(record)}
                                className="text-emerald-700 hover:underline font-semibold"
                              >
                                {cellVal || '—'}
                              </button>
                            ) : (
                              String(cellVal !== undefined && cellVal !== null ? cellVal : '')
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer: Pagination & Summary */}
        <div className="bg-slate-50 border-t border-slate-300 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong>{totalRows > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, totalRows)}</strong> of <strong>{totalRows}</strong> rows
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Sheet {activeSheetIndex + 1} of {sheets.length} ({activeSheet.sheetName})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
