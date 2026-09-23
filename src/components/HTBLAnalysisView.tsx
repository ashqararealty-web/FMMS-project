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
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Users,
  Download,
  Filter,
  BarChart2,
  FileCheck,
  PieChart,
} from 'lucide-react';
import { exportToExcel } from '../services/excelService';

interface HTBLAnalysisViewProps {
  records: VisitRecord[];
  onViewRecord: (record: VisitRecord) => void;
}

export const HTBLAnalysisView: React.FC<HTBLAnalysisViewProps> = ({
  records,
  onViewRecord,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedMandal, setSelectedMandal] = useState<string>('all');
  const [selectedRevenueDivision, setSelectedRevenueDivision] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedCluster !== 'all' && r.clusterName !== selectedCluster) return false;
      if (selectedMandal !== 'all' && r.mandal !== selectedMandal) return false;
      if (selectedRevenueDivision !== 'all' && r.revenueDivision !== selectedRevenueDivision) return false;
      if (selectedIndustry !== 'all' && r.industryType !== selectedIndustry) return false;
      return true;
    });
  }, [records, selectedCluster, selectedMandal, selectedRevenueDivision, selectedIndustry]);

  const clusters = useMemo(() => {
    const set = new Set<string>(CLUSTER_OPTIONS);
    records.forEach((r) => r.clusterName && set.add(r.clusterName.trim()));
    return Array.from(set).sort();
  }, [records]);

  const mandals = useMemo(() => {
    const set = new Set<string>();
    if (selectedCluster !== 'all' && selectedCluster in CLUSTER_MANDAL_MAP) {
      CLUSTER_MANDAL_MAP[selectedCluster as ClusterName].forEach((m) => set.add(m));
    } else {
      MANDAL_OPTIONS.forEach((m) => set.add(m));
    }
    records.forEach((r) => {
      if (selectedCluster === 'all' || r.clusterName === selectedCluster) {
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

  const industries = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.industryType && set.add(r.industryType.trim()));
    return Array.from(set).sort();
  }, [records]);

  // Aggregate indicators
  const totalVisited = filteredRecords.length;
  let totalWithHtbl = 0;
  let noElementsCount = 0;

  const indicatorCounts = {
    advance: 0,
    debtObligation: 0,
    customSocialObligation: 0,
    succession: 0,
    economicConsideration: 0,
    casteOrCommunity: 0,
    suretyOrContract: 0,
    interState: 0,
    rightToMinimumWage: 0,
    freedomOfEmployment: 0,
    rightToMoveFreely: 0,
    rightToAppropriateSellAtMarket: 0,
  };

  filteredRecords.forEach((r) => {
    if (r.isHtblPotential) totalWithHtbl++;
    if (r.htblElements?.noElements) noElementsCount++;

    const h = r.htblElements;
    if (h?.advance?.present) indicatorCounts.advance++;
    if (h?.debtObligation?.present) indicatorCounts.debtObligation++;
    if (h?.customSocialObligation?.present) indicatorCounts.customSocialObligation++;
    if (h?.succession?.present) indicatorCounts.succession++;
    if (h?.economicConsideration?.present) indicatorCounts.economicConsideration++;
    if (h?.casteOrCommunity?.present) indicatorCounts.casteOrCommunity++;
    if (h?.suretyOrContract?.present) indicatorCounts.suretyOrContract++;
    if (h?.interState?.present) indicatorCounts.interState++;
    if (h?.rightToMinimumWage?.present) indicatorCounts.rightToMinimumWage++;
    if (h?.freedomOfEmployment?.present) indicatorCounts.freedomOfEmployment++;
    if (h?.rightToMoveFreely?.present) indicatorCounts.rightToMoveFreely++;
    if (h?.rightToAppropriateSellAtMarket?.present) indicatorCounts.rightToAppropriateSellAtMarket++;
  });

  const indicatorsList = [
    {
      id: 'advance',
      title: 'Advance Cases',
      statutoryRef: 'Section 2(g)(i) Bonded Labour Abolition Act',
      count: indicatorCounts.advance,
      color: 'bg-rose-500',
      description: 'Pre-recruitment or mid-season loans paid to workers or brokers in advance.',
    },
    {
      id: 'debtObligation',
      title: 'Debt / Obligation Cases',
      statutoryRef: 'Section 2(g) BLSA 1976',
      count: indicatorCounts.debtObligation,
      color: 'bg-rose-600',
      description: 'Workers rendering labour in consideration of an advance/debt obtained.',
    },
    {
      id: 'economicConsideration',
      title: 'Economic Consideration Cases',
      statutoryRef: 'Poverty, distress migration',
      count: indicatorCounts.economicConsideration,
      color: 'bg-amber-500',
      description: 'Acute financial vulnerability compelling workers into exploitative contracts.',
    },
    {
      id: 'casteOrCommunity',
      title: 'Caste or Community Cases',
      statutoryRef: 'Social vulnerability profiling',
      count: indicatorCounts.casteOrCommunity,
      color: 'bg-indigo-500',
      description: 'Targeted exploitation of Scheduled Caste, Scheduled Tribe, or marginalized groups.',
    },
    {
      id: 'suretyOrContract',
      title: 'Surety / Contract Cases',
      statutoryRef: 'Third-party middleman & Aadhaar retention',
      count: indicatorCounts.suretyOrContract,
      color: 'bg-orange-500',
      description: 'Sub-contracting arrangements, held ID cards, or personal surety guarantors.',
    },
    {
      id: 'interState',
      title: 'Inter-State Cases',
      statutoryRef: 'ISMW Act 1979 violations',
      count: indicatorCounts.interState,
      color: 'bg-purple-500',
      description: 'Workers transported across state borders without mandated licensing.',
    },
    {
      id: 'rightToMinimumWage',
      title: 'Right to Minimum Wage Cases',
      statutoryRef: 'Minimum Wages Act 1948',
      count: indicatorCounts.rightToMinimumWage,
      color: 'bg-red-500',
      description: 'Deprivation of statutory minimum rates or unlawful deductions.',
    },
    {
      id: 'freedomOfEmployment',
      title: 'Freedom of Employment Cases',
      statutoryRef: 'Denial of alternative employment',
      count: indicatorCounts.freedomOfEmployment,
      color: 'bg-pink-600',
      description: 'Restricted from seeking other employment or choosing their employer.',
    },
    {
      id: 'rightToMoveFreely',
      title: 'Right to Move Freely Cases',
      statutoryRef: 'Article 19(1)(d) & BLSA Section 2(g)',
      count: indicatorCounts.rightToMoveFreely,
      color: 'bg-red-700',
      description: 'Physical confinement, gatekeeper surveillance, or restricted mobility.',
    },
    {
      id: 'customSocialObligation',
      title: 'Custom / Social Obligation Cases',
      statutoryRef: 'Customary/feudal service obligations',
      count: indicatorCounts.customSocialObligation,
      color: 'bg-teal-600',
      description: 'Labour rendered on account of custom or hereditary community expectations.',
    },
    {
      id: 'succession',
      title: 'Succession Cases',
      statutoryRef: 'Hereditary debt obligation',
      count: indicatorCounts.succession,
      color: 'bg-emerald-600',
      description: 'Debt passed down from parents or ancestral relatives.',
    },
    {
      id: 'rightToAppropriateSellAtMarket',
      title: 'Right to Appropriate/Sell at Market Cases',
      statutoryRef: 'Market freedom restriction',
      count: indicatorCounts.rightToAppropriateSellAtMarket,
      color: 'bg-blue-600',
      description: 'Prohibited from selling labour products or skills at normal market rates.',
    },
  ];

  const potentialCasesList = filteredRecords.filter((r) => r.isHtblPotential);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            Statutory Legal Analysis &amp; Indicators
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Human Trafficking &amp; Bonded Labour (HT&amp;BL) Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Statistical monitoring of 12 statutory indicators under the Bonded Labour System (Abolition) Act 1976.
          </p>
        </div>

        <button
          onClick={() => exportToExcel(potentialCasesList, `HTBL_Potential_Cases_${new Date().toISOString().split('T')[0]}.xlsx`)}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Flagged Cases (.xlsx)</span>
        </button>
      </div>

      {/* Cluster & Industry Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-600" />
          Filter Analysis:
        </div>

        <div className="flex-1 sm:flex-initial">
          <select
            id="analysis-cluster-filter"
            value={selectedCluster}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCluster(val);
              if (val !== 'all' && val in CLUSTER_MANDAL_MAP) {
                const allowed = CLUSTER_MANDAL_MAP[val as ClusterName];
                if (selectedMandal !== 'all' && !allowed.includes(selectedMandal)) {
                  setSelectedMandal('all');
                }
              }
            }}
            className="w-full sm:w-auto min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Clusters ({records.length})</option>
            {clusters.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 sm:flex-initial">
          <select
            id="analysis-mandal-filter"
            value={selectedMandal}
            onChange={(e) => setSelectedMandal(e.target.value)}
            className="w-full sm:w-auto min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Mandals</option>
            {mandals.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 sm:flex-initial">
          <select
            id="analysis-revenue-division-filter"
            value={selectedRevenueDivision}
            onChange={(e) => setSelectedRevenueDivision(e.target.value)}
            className="w-full sm:w-auto min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Revenue Divisions</option>
            {revenueDivisions.map((rd) => (
              <option key={rd} value={rd}>
                {rd}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 sm:flex-initial">
          <select
            id="analysis-industry-filter"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full sm:w-auto min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 text-xs sm:ml-auto pt-1 sm:pt-0">
          Showing data for <strong>{totalVisited}</strong> visits
        </span>
      </div>

      {/* Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Visited */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Worksites Visited</span>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalVisited}</p>
          <p className="text-xs text-slate-400 mt-1">Across filtered clusters & mandals</p>
        </div>

        {/* Flagged Cases */}
        <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-2xs bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Worksites with HT&BL Elements</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2">{totalWithHtbl}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-rose-600">
            <span>Prevalence Rate:</span>
            <strong className="font-bold">
              {totalVisited > 0 ? Math.round((totalWithHtbl / totalVisited) * 100) : 0}%
            </strong>
          </div>
        </div>

        {/* Clean / No Elements */}
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">No Elements Identified</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {Math.max(0, totalVisited - totalWithHtbl)}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-emerald-600">
            <span>Clean inspections:</span>
            <strong className="font-bold">
              {totalVisited > 0 ? Math.round(((totalVisited - totalWithHtbl) / totalVisited) * 100) : 0}%
            </strong>
          </div>
        </div>

      </div>

      {/* 12 Statutory Indicators Breakdown Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Statutory HT&BL Indicators Frequency Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Distribution of individual indicators observed during visits
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
            12 Specific Parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {indicatorsList.map((item) => {
            const percentage = totalVisited > 0 ? Math.round((item.count / totalVisited) * 100) : 0;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h3>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.statutoryRef}</span>
                    </div>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      {item.count}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Incidence:</span>
                    <span>{percentage}% ({item.count}/{totalVisited})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagged Worksites Table */}
      {potentialCasesList.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Flagged Potential Worksites Requiring Legal / Administrative Action
              </h3>
              <p className="text-xs text-slate-500">
                Detailed list of visits with active bonded labour or trafficking indicators
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              {potentialCasesList.length} Worksites
            </span>
          </div>

          {/* Mobile Card List for < sm screens */}
          <div className="sm:hidden divide-y divide-slate-100">
            {potentialCasesList.map((rec) => (
              <div key={rec.id} className="py-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                      {rec.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                      {rec.industryName}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {rec.industryType} • {rec.mandal}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                    {rec.caseStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Workers</span>
                    <span className="font-bold text-slate-800">{rec.approxWorkersCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Inter-State</span>
                    <span className="text-slate-700 truncate max-w-[120px] block">{rec.otherStateLabour || 'None'}</span>
                  </div>
                  <button
                    onClick={() => onViewRecord(rec)}
                    className="min-h-[34px] px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Table */}
          <div className="hidden sm:block overflow-x-auto table-responsive custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">Worksite</th>
                  <th className="py-2.5 px-3">Mandal / Village</th>
                  <th className="py-2.5 px-3">Workers</th>
                  <th className="py-2.5 px-3">Inter-State Origin</th>
                  <th className="py-2.5 px-3">Case Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {potentialCasesList.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{rec.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{rec.industryName}</div>
                      <div className="text-[11px] text-slate-400">{rec.industryType}</div>
                    </td>
                    <td className="py-2.5 px-3">{rec.mandal}, {rec.areaVillageWard || ''}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{rec.approxWorkersCount}</td>
                    <td className="py-2.5 px-3 text-slate-700">{rec.otherStateLabour || 'None'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {rec.caseStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onViewRecord(rec)}
                        className="min-h-[32px] px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
