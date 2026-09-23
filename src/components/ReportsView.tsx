import React, { useState, useMemo } from 'react';
import {
  VisitRecord,
  CLUSTER_OPTIONS,
  CLUSTER_MANDAL_MAP,
  ClusterName,
  MANDAL_OPTIONS,
  REVENUE_DIVISION_OPTIONS,
} from '../types';
import {
  BarChart3,
  Download,
  Filter,
  Building2,
  Calendar,
  Users,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { exportToExcel } from '../services/excelService';

interface ReportsViewProps {
  records: VisitRecord[];
  onViewRecord: (record: VisitRecord) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  records,
  onViewRecord,
}) => {
  // Filter parameters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedHtblStatus, setSelectedHtblStatus] = useState<string>('all');
  const [selectedCaseStatus, setSelectedCaseStatus] = useState('');

  // Dropdown options
  const divisions = useMemo(() => {
    const s = new Set<string>(REVENUE_DIVISION_OPTIONS);
    records.forEach((r) => r.revenueDivision && s.add(r.revenueDivision.trim()));
    return Array.from(s).sort();
  }, [records]);

  const mandals = useMemo(() => {
    const s = new Set<string>();
    if (selectedCluster && selectedCluster in CLUSTER_MANDAL_MAP) {
      CLUSTER_MANDAL_MAP[selectedCluster as ClusterName].forEach((m) => s.add(m));
    } else {
      MANDAL_OPTIONS.forEach((m) => s.add(m));
    }
    records.forEach((r) => {
      if (!selectedCluster || r.clusterName === selectedCluster) {
        if (r.mandal) s.add(r.mandal.trim());
      }
    });
    return Array.from(s).sort();
  }, [records, selectedCluster]);

  const clusters = useMemo(() => {
    const s = new Set<string>(CLUSTER_OPTIONS);
    records.forEach((r) => r.clusterName && s.add(r.clusterName.trim()));
    return Array.from(s).sort();
  }, [records]);

  const villages = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.areaVillageWard && s.add(r.areaVillageWard.trim()));
    return Array.from(s).sort();
  }, [records]);

  const industries = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.industryType && s.add(r.industryType.trim()));
    return Array.from(s).sort();
  }, [records]);

  const caseStatuses = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.caseStatus && s.add(r.caseStatus.trim()));
    return Array.from(s).sort();
  }, [records]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (startDate && r.dateOfVisit < startDate) return false;
      if (endDate && r.dateOfVisit > endDate) return false;
      if (selectedDivision && r.revenueDivision !== selectedDivision) return false;
      if (selectedMandal && r.mandal !== selectedMandal) return false;
      if (selectedCluster && r.clusterName !== selectedCluster) return false;
      if (selectedVillage && r.areaVillageWard !== selectedVillage) return false;
      if (selectedIndustry && r.industryType !== selectedIndustry) return false;
      if (selectedHtblStatus === 'potential' && !r.isHtblPotential) return false;
      if (selectedHtblStatus === 'clean' && r.isHtblPotential) return false;
      if (selectedCaseStatus && r.caseStatus !== selectedCaseStatus) return false;
      return true;
    });
  }, [
    records,
    startDate,
    endDate,
    selectedDivision,
    selectedMandal,
    selectedCluster,
    selectedVillage,
    selectedIndustry,
    selectedHtblStatus,
    selectedCaseStatus,
  ]);

  // Aggregated summary stats for report
  const reportStats = useMemo(() => {
    let totalWorkers = 0;
    let maleWorkers = 0;
    let femaleWorkers = 0;
    let totalFamilies = 0;
    let htblCount = 0;
    let interStateCount = 0;

    filteredRecords.forEach((r) => {
      totalWorkers += Number(r.approxWorkersCount) || 0;
      maleWorkers += Number(r.maleWorkersCount) || 0;
      femaleWorkers += Number(r.femaleWorkersCount) || 0;
      totalFamilies += Number(r.familiesCount) || 0;
      if (r.isHtblPotential) htblCount++;
      if (r.otherStateLabour && r.otherStateLabour.toLowerCase() !== 'none') interStateCount++;
    });

    return {
      totalVisits: filteredRecords.length,
      totalWorkers,
      maleWorkers,
      femaleWorkers,
      totalFamilies,
      htblCount,
      interStateCount,
    };
  }, [filteredRecords]);

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDivision('');
    setSelectedMandal('');
    setSelectedCluster('');
    setSelectedVillage('');
    setSelectedIndustry('');
    setSelectedHtblStatus('all');
    setSelectedCaseStatus('');
  };

  const handleExportFiltered = () => {
    const filename = `Field_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel(filteredRecords, filename);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            Custom Field Reports & Analytics
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Worksite Visit Reports Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Filter by geographic jurisdiction, worksite sector, date interval, and export directly to Excel.
          </p>
        </div>

        <button
          onClick={handleExportFiltered}
          disabled={filteredRecords.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Export Filtered to Excel (.xlsx)
        </button>
      </div>

      {/* Multi-parameter Filter Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            Report Parameters
          </h2>
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Parameters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Date Range Start */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">From Date</label>
            <input
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
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Revenue Division */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Revenue Division</label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Revenue Divisions</option>
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Mandal */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Mandal</label>
            <select
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

          {/* Cluster */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cluster</label>
            <select
              value={selectedCluster}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCluster(val);
                if (val && val in CLUSTER_MANDAL_MAP) {
                  const allowed = CLUSTER_MANDAL_MAP[val as ClusterName];
                  if (selectedMandal && !allowed.includes(selectedMandal)) {
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

          {/* Village */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Village / Ward</label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Villages</option>
              {villages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Industry Type</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* HT&BL Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">HT&BL Status</label>
            <select
              value={selectedHtblStatus}
              onChange={(e) => setSelectedHtblStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Records</option>
              <option value="potential">Potential HT&BL Cases Only</option>
              <option value="clean">No Elements Identified Only</option>
            </select>
          </div>

          {/* Case Status */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Case Status</label>
            <select
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
      </div>

      {/* Aggregate Report Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 block font-semibold">Matched Visits</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{reportStats.totalVisits}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 block font-semibold">Total Workers</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{reportStats.totalWorkers}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 block font-semibold">Male Workers</span>
          <span className="text-xl font-bold text-blue-700 mt-1 block">{reportStats.maleWorkers}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 block font-semibold">Female Workers</span>
          <span className="text-xl font-bold text-purple-700 mt-1 block">{reportStats.femaleWorkers}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 block font-semibold">Resident Families</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{reportStats.totalFamilies}</span>
        </div>
        <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200">
          <span className="text-[11px] text-rose-700 block font-bold">HT&BL Flagged</span>
          <span className="text-xl font-bold text-rose-800 mt-1 block">{reportStats.htblCount}</span>
        </div>
      </div>

      {/* Filtered Report Table Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Report Records Preview ({filteredRecords.length})
          </h3>
          <span className="text-xs text-slate-500">Matches 1.xlsx exported columns</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            No records match the selected report parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Cluster</th>
                  <th className="py-2.5 px-3">Worksite</th>
                  <th className="py-2.5 px-3">Mandal / Village</th>
                  <th className="py-2.5 px-3">Workers</th>
                  <th className="py-2.5 px-3">HT&BL Status</th>
                  <th className="py-2.5 px-3">Case Status</th>
                  <th className="py-2.5 px-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{r.id}</td>
                    <td className="py-2.5 px-3">{r.dateOfVisit}</td>
                    <td className="py-2.5 px-3">{r.clusterName || '-'}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{r.industryName}</td>
                    <td className="py-2.5 px-3">{r.mandal} ({r.areaVillageWard || '-'})</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.approxWorkersCount}</td>
                    <td className="py-2.5 px-3">
                      {r.isHtblPotential ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Potential
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Clean
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">{r.caseStatus}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onViewRecord(r)}
                        className="px-2 py-1 text-emerald-700 hover:bg-emerald-50 rounded font-semibold"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
