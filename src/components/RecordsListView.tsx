import React, { useState, useMemo } from 'react';
import {
  VisitRecord,
  FilterOptions,
  UserProfile,
  CLUSTER_OPTIONS,
  CLUSTER_MANDAL_MAP,
  ClusterName,
  MANDAL_OPTIONS,
  REVENUE_DIVISION_OPTIONS,
} from '../types';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  Building2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  ExternalLink,
  ChevronDown,
  X,
  Users,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { computeHTBLFlag, getHTBLYesCount } from '../services/storage';

interface RecordsListViewProps {
  records: VisitRecord[];
  onViewRecord: (record: VisitRecord) => void;
  onEditRecord: (record: VisitRecord) => void;
  onDeleteRecord: (id: string) => void;
  onExportExcel: (subset?: VisitRecord[]) => void;
  onNewVisit: () => void;
  currentUser?: UserProfile | null;
  onResetAllData?: () => Promise<void> | void;
}

export const RecordsListView: React.FC<RecordsListViewProps> = ({
  records,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onExportExcel,
  onNewVisit,
  currentUser,
  onResetAllData,
}) => {
  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedRevenueDivision, setSelectedRevenueDivision] = useState('');
  const [selectedIndustryType, setSelectedIndustryType] = useState('');
  const [selectedHtblStatus, setSelectedHtblStatus] = useState<
    'all' | 'htbl_pipeline' | 'htbl_potential' | 'htbl_identification' | 'no_elements'
  >('all');
  const [selectedCaseStatus, setSelectedCaseStatus] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Selected row IDs for batch actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirm delete dialog
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Distinct values for filter dropdowns
  const clusters = useMemo(() => {
    const set = new Set<string>(CLUSTER_OPTIONS);
    records.forEach((r) => r.clusterName && set.add(r.clusterName.trim()));
    return Array.from(set).sort();
  }, [records]);

  const mandals = useMemo(() => {
    const set = new Set<string>();
    if (selectedCluster && selectedCluster in CLUSTER_MANDAL_MAP) {
      CLUSTER_MANDAL_MAP[selectedCluster as ClusterName].forEach((m) => set.add(m));
    } else {
      MANDAL_OPTIONS.forEach((m) => set.add(m));
    }
    records.forEach((r) => {
      if (!selectedCluster || r.clusterName === selectedCluster) {
        if (r.mandal) set.add(r.mandal.trim());
      }
    });
    return Array.from(set).sort();
  }, [records, selectedCluster]);

  const revenueDivisions = useMemo(() => {
    const set = new Set<string>(REVENUE_DIVISION_OPTIONS);
    records.forEach((r) => r.revenueDivision && set.add(r.revenueDivision.trim()));
    return Array.from(set).sort();
  }, [records]);

  const industryTypes = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.industryType && set.add(r.industryType.trim()));
    return Array.from(set).sort();
  }, [records]);

  const caseStatuses = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.caseStatus && set.add(r.caseStatus.trim()));
    return Array.from(set).sort();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Free text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const haystack = [
          r.id,
          r.reportingPerson,
          r.industryName,
          r.clusterName,
          r.areaVillageWard,
          r.mandal,
          r.revenueDivision,
          r.ownerName,
          r.contactPersonName,
          r.otherStateLabour,
          r.intraStateLabour,
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      // Date range
      if (startDate && r.dateOfVisit < startDate) return false;
      if (endDate && r.dateOfVisit > endDate) return false;

      // Cluster
      if (selectedCluster && r.clusterName !== selectedCluster) return false;

      // Mandal
      if (selectedMandal && r.mandal !== selectedMandal) return false;

      // Revenue Division
      if (selectedRevenueDivision && r.revenueDivision !== selectedRevenueDivision) return false;

      // Industry type
      if (selectedIndustryType && r.industryType !== selectedIndustryType) return false;

      // HT&BL status
      const flag = r.htblFlag || computeHTBLFlag(r.htblElements);
      if (selectedHtblStatus === 'htbl_potential' && flag !== 'Potential') return false;
      if (selectedHtblStatus === 'htbl_identification' && flag !== 'Identification') return false;
      if (selectedHtblStatus === 'htbl_pipeline' && flag !== 'Pipeline') return false;
      if (selectedHtblStatus === 'no_elements' && flag !== 'None') return false;

      // Case status
      if (selectedCaseStatus && r.caseStatus !== selectedCaseStatus) return false;

      return true;
    });
  }, [
    records,
    searchQuery,
    startDate,
    endDate,
    selectedCluster,
    selectedMandal,
    selectedRevenueDivision,
    selectedIndustryType,
    selectedHtblStatus,
    selectedCaseStatus,
  ]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const resetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSelectedCluster('');
    setSelectedMandal('');
    setSelectedRevenueDivision('');
    setSelectedIndustryType('');
    setSelectedHtblStatus('all');
    setSelectedCaseStatus('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(selectedCluster) ||
    Boolean(selectedMandal) ||
    Boolean(selectedRevenueDivision) ||
    Boolean(selectedIndustryType) ||
    selectedHtblStatus !== 'all' ||
    Boolean(selectedCaseStatus);

  // Toggle selection
  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  // Export selected or filtered
  const handleExportClick = () => {
    if (selectedIds.size > 0) {
      const selectedSubset = records.filter((r) => selectedIds.has(r.id));
      onExportExcel(selectedSubset);
    } else {
      onExportExcel(filteredRecords);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Field Registry ({records.length} Total Records)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Worksite Visit Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, search, edit, and export documented worksite inspection reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {records.length > 0 && onResetAllData && (
            <button
              id="records-reset-all-btn"
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-2xs transition-colors"
              title="Reset all test records and typed data"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Reset Test Data</span>
            </button>
          )}

          <button
            id="records-export-btn"
            onClick={handleExportClick}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors"
            title="Export currently filtered rows to 1.xlsx format"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {selectedIds.size > 0
              ? `Export Selected (${selectedIds.size})`
              : `Export Filtered (${filteredRecords.length})`}
          </button>

          <button
            id="records-add-new-btn"
            onClick={onNewVisit}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            + Add Visit
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reset All Test Data?</h3>
                <p className="text-xs text-slate-500">Permanently clear all test entries and names</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
              <p className="font-semibold">The following will be completely cleared:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>All <strong>{records.length} visit records</strong> in Cloud Firestore</li>
                <li>All test worksite names, contact persons, and entered details</li>
                <li>Sequence number will reset to fresh starting sequence (<strong>FV-2315</strong>)</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={async () => {
                  setIsResetting(true);
                  try {
                    if (onResetAllData) {
                      await onResetAllData();
                    }
                    setShowResetConfirm(false);
                  } catch (e) {
                    console.error('Reset error:', e);
                  } finally {
                    setIsResetting(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isResetting ? 'Clearing Records...' : 'Yes, Clear All Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        
        {/* Main Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="records-search-input"
              type="text"
              placeholder="Search by worksite name, village, mandal, cluster, staff or origin state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 min-h-[44px] py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="records-filter-toggle-btn"
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="min-h-[44px] text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-2 flex items-center"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            
            {/* Date Range Start */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">From Date</label>
              <input
                id="filter-date-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">To Date</label>
              <input
                id="filter-date-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Cluster */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cluster</label>
              <select
                id="filter-cluster-select"
                value={selectedCluster}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCluster(val);
                  if (val && val in CLUSTER_MANDAL_MAP) {
                    const mandalList = CLUSTER_MANDAL_MAP[val as ClusterName];
                    if (selectedMandal && !mandalList.includes(selectedMandal)) {
                      setSelectedMandal('');
                    }
                  }
                }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Clusters</option>
                {clusters.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Mandal */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Mandal</label>
              <select
                id="filter-mandal-select"
                value={selectedMandal}
                onChange={(e) => setSelectedMandal(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Mandals</option>
                {mandals.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Revenue Division */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Revenue Division</label>
              <select
                id="filter-revenue-division-select"
                value={selectedRevenueDivision}
                onChange={(e) => setSelectedRevenueDivision(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Revenue Divisions</option>
                {revenueDivisions.map((rd) => (
                  <option key={rd} value={rd}>
                    {rd}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Industry Type</label>
              <select
                id="filter-industry-select"
                value={selectedIndustryType}
                onChange={(e) => setSelectedIndustryType(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Industries</option>
                {industryTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* HT&BL Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">HT&BL Status</label>
              <select
                id="filter-htbl-status-select"
                value={selectedHtblStatus}
                onChange={(e) => setSelectedHtblStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="htbl_pipeline">Pipeline Cases (4+ Yes)</option>
                <option value="htbl_potential">Potential Cases (Victim Support Yes / Potential)</option>
                <option value="htbl_identification">Identification (3 Yes)</option>
                <option value="no_elements">Clean / No Elements (0 Yes)</option>
              </select>
            </div>

            {/* Case Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Case Status</label>
              <select
                id="filter-case-status-select"
                value={selectedCaseStatus}
                onChange={(e) => setSelectedCaseStatus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Case Statuses</option>
                {caseStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> of{' '}
            <strong>{records.length}</strong> records
          </span>
          {selectedIds.size > 0 && (
            <span className="font-semibold text-emerald-700">
              {selectedIds.size} row(s) selected
            </span>
          )}
        </div>
      </div>

      {/* Records Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-bold text-slate-800">No matching visit records found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria or clear the filters to view all entries.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-500 hover:text-slate-800"
                        title="Select All"
                      >
                        {selectedIds.size === filteredRecords.length && filteredRecords.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">Record ID</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Reporting Person</th>
                    <th className="py-3 px-3">Cluster</th>
                    <th className="py-3 px-3">Industry / Worksite</th>
                    <th className="py-3 px-3">Village</th>
                    <th className="py-3 px-3">Mandal</th>
                    <th className="py-3 px-3">Workers</th>
                    <th className="py-3 px-3">HT&BL Status</th>
                    <th className="py-3 px-3">Case Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRecords.map((record) => {
                    const isSelected = selectedIds.has(record.id);
                    return (
                      <tr
                        key={record.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        {/* Select checkbox */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => toggleSelectRow(record.id)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Record ID */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {record.id}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                          {record.dateOfVisit}
                        </td>

                        {/* Reporting Person */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-800">
                          {record.reportingPerson || '-'}
                        </td>

                        {/* Cluster */}
                        <td className="py-3 px-3 text-slate-600 max-w-[140px] truncate">
                          {record.clusterName || '-'}
                        </td>

                        {/* Industry / Worksite */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 max-w-[180px] truncate">
                            {record.industryName}
                          </div>
                          <div className="text-[11px] text-slate-500">{record.industryType}</div>
                        </td>

                        {/* Village */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                          {record.areaVillageWard || '-'}
                        </td>

                        {/* Mandal */}
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                          {record.mandal}
                        </td>

                        {/* Workers */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{record.approxWorkersCount}</span>
                          <span className="text-[10px] text-slate-500 ml-1">
                            (M:{record.maleWorkersCount} F:{record.femaleWorkersCount})
                          </span>
                        </td>

                        {/* HT&BL Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {(() => {
                            const flag = record.htblFlag || computeHTBLFlag(record.htblElements);
                            const count = record.htblYesCount !== undefined ? record.htblYesCount : getHTBLYesCount(record.htblElements);
                            if (flag === 'Pipeline') {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  Pipeline ({count} Yes)
                                </span>
                              );
                            }
                            if (flag === 'Potential') {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  Potential ({count} Yes)
                                </span>
                              );
                            }
                            if (flag === 'Identification') {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  <ShieldAlert className="w-3 h-3 text-blue-600" />
                                  Identification ({count} Yes)
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Clean (0 Yes)
                              </span>
                            );
                          })()}
                        </td>

                        {/* Case Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-[11px] font-medium text-slate-700 px-2 py-0.5 bg-slate-100 rounded-md">
                            {record.caseStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`view-record-${record.id}`}
                              onClick={() => onViewRecord(record)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-emerald-700 transition-colors"
                              title="View Full Record"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              id={`edit-record-${record.id}`}
                              onClick={() => onEditRecord(record)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition-colors"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              id={`delete-record-${record.id}`}
                              onClick={() => setDeleteTargetId(record.id)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Avoid horizontal scroll overflow on phones) */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedRecords.map((record) => (
                <div key={record.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {record.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{record.industryName}</h3>
                      <p className="text-xs text-slate-500">{record.industryType} • {record.dateOfVisit}</p>
                    </div>

                    {(() => {
                      const flag = record.htblFlag || computeHTBLFlag(record.htblElements);
                      const count = record.htblYesCount !== undefined ? record.htblYesCount : getHTBLYesCount(record.htblElements);
                      if (flag === 'Pipeline') {
                        return (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 shrink-0 flex items-center gap-1 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Pipeline ({count} Yes)
                          </span>
                        );
                      }
                      if (flag === 'Potential') {
                        return (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 shrink-0 flex items-center gap-1 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Potential ({count} Yes)
                          </span>
                        );
                      }
                      if (flag === 'Identification') {
                        return (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 shrink-0 flex items-center gap-1 border border-blue-200">
                            <ShieldAlert className="w-3 h-3 text-blue-600" />
                            Identification ({count} Yes)
                          </span>
                        );
                      }
                      return (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200">
                          Clean (0 Yes)
                        </span>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Location</span>
                      <span className="font-semibold text-slate-800">{record.mandal}</span> ({record.areaVillageWard || 'Village'})
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Workers</span>
                      <span className="font-semibold text-slate-800">{record.approxWorkersCount}</span> (M:{record.maleWorkersCount} F:{record.femaleWorkersCount})
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Reporter</span>
                      <span className="truncate block">{record.reportingPerson}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Case Status</span>
                      <span className="font-medium text-slate-700">{record.caseStatus}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {record.locationLink ? (
                      <a
                        href={record.locationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 font-semibold flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Map
                      </a>
                    ) : <span></span>}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onViewRecord(record)}
                        className="min-h-[36px] px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEditRecord(record)}
                        className="min-h-[36px] px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(record.id)}
                        className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Bar */}
            {filteredRecords.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/50 rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    id="pagination-page-size-select"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-slate-400">|</span>
                  <span>
                    Showing {Math.min((currentPage - 1) * pageSize + 1, filteredRecords.length)} - {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id="pagination-prev-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-medium transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <span className="px-2 font-semibold text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    id="pagination-next-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-medium transition-colors"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Delete Visit Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete record <strong className="font-mono text-slate-700">{deleteTargetId}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-btn"
                onClick={() => {
                  onDeleteRecord(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
