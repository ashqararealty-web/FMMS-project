import React from 'react';
import { VisitRecord, DashboardStats, ActiveTab } from '../types';
import { FmmLogo } from './FmmLogo';
import {
  ClipboardList,
  Building2,
  Users,
  UserCheck,
  UserX,
  Globe2,
  MapPin,
  AlertTriangle,
  Calendar,
  PlusCircle,
  Download,
  Upload,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Table,
} from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats;
  records: VisitRecord[];
  onNewVisit: () => void;
  onExportExcel: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onViewRecord: (record: VisitRecord) => void;
  onEditRecord: (record: VisitRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  records,
  onNewVisit,
  onExportExcel,
  setActiveTab,
  onViewRecord,
  onEditRecord,
}) => {
  // 9 Required Metric Cards
  const metricCards = [
    {
      id: 'stat-total-visits',
      label: 'Total Visits',
      value: stats.totalVisits,
      icon: ClipboardList,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      description: 'Logged worksite inspections',
    },
    {
      id: 'stat-total-worksites',
      label: 'Total Worksites',
      value: stats.totalWorksites,
      icon: Building2,
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-700',
      borderColor: 'border-sky-200',
      description: 'Unique industries mapped',
    },
    {
      id: 'stat-total-workers',
      label: 'Total Workers',
      value: stats.totalWorkers.toLocaleString(),
      icon: Users,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-700',
      borderColor: 'border-indigo-200',
      description: 'Estimated workforce covered',
    },
    {
      id: 'stat-male-workers',
      label: 'Male Workers',
      value: stats.maleWorkers.toLocaleString(),
      icon: UserCheck,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      description: `${stats.totalWorkers > 0 ? Math.round((stats.maleWorkers / stats.totalWorkers) * 100) : 0}% of documented workforce`,
    },
    {
      id: 'stat-female-workers',
      label: 'Female Workers',
      value: stats.femaleWorkers.toLocaleString(),
      icon: UserCheck,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      description: `${stats.totalWorkers > 0 ? Math.round((stats.femaleWorkers / stats.totalWorkers) * 100) : 0}% of documented workforce`,
    },
    {
      id: 'stat-inter-state',
      label: 'Inter-State Labour',
      value: stats.interStateLabourCases,
      icon: Globe2,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      description: 'Visits with other state workers',
    },
    {
      id: 'stat-intra-state',
      label: 'Intra-State Labour',
      value: stats.intraStateLabourCases,
      icon: MapPin,
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-700',
      borderColor: 'border-teal-200',
      description: 'Visits with other district workers',
    },
    {
      id: 'stat-htbl-potential',
      label: 'HT&BL Potential Cases',
      value: stats.htblPotentialCases,
      icon: AlertTriangle,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      badge: stats.htblPotentialCases > 0 ? 'Requires Follow-up' : undefined,
      description: 'Bonded labour / trafficking elements flagged',
    },
    {
      id: 'stat-current-month',
      label: 'Current Month Visits',
      value: stats.currentMonthVisits,
      icon: Calendar,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      description: 'Visits conducted this month',
    },
  ];

  // Industry breakdown
  const industryCounts: Record<string, number> = {};
  records.forEach((r) => {
    const type = r.industryType || 'Other';
    industryCounts[type] = (industryCounts[type] || 0) + 1;
  });

  const sortedIndustries = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Recent visits (top 5)
  const recentVisits = [...records]
    .sort((a, b) => new Date(b.dateOfVisit).getTime() - new Date(a.dateOfVisit).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-4 sm:p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 bg-white/95 rounded-2xl shadow-xs shrink-0 hidden sm:flex items-center justify-center">
              <FmmLogo size="lg" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-[11px] sm:text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="truncate">Towards wholeness • Field Operations & Excel Mapping</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                FMM BLSA Project
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Field Visit & Worksite Mapping System to log industry inspections, monitor worker demographics and Human Trafficking & Bonded Labour (HT&BL) statutory elements, automatically updating the master workbook matching template <code className="bg-emerald-950/60 px-1.5 py-0.5 rounded text-white font-mono text-xs">1.xlsx</code>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 pt-1 lg:pt-0">
            <button
              id="dash-new-visit-btn"
              onClick={onNewVisit}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>+ New Visit</span>
            </button>
            <button
              id="dash-master-excel-btn"
              onClick={() => setActiveTab('master_excel')}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm rounded-xl border border-emerald-500/50 transition-colors shadow-xs"
            >
              <Table className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Master Excel</span>
            </button>
            <button
              id="dash-export-excel-btn"
              onClick={onExportExcel}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors backdrop-blur-xs"
            >
              <Download className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Export .xlsx</span>
            </button>
          </div>
        </div>
      </div>

      {/* 9 Standard Metric Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
            System Key Performance Indicators
          </h2>
          <span className="text-[11px] sm:text-xs text-slate-500 shrink-0">Live count auto-synced</span>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                id={card.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500 truncate">{card.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight truncate">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-2.5 rounded-xl ${card.bgColor} ${card.iconColor} shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="truncate text-[11px] sm:text-xs">{card.description}</span>
                  {card.badge && (
                    <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full text-[10px] shrink-0">
                      {card.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Section: HT&BL Alert Box + Industry Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HT&BL Summary Status */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">HT&BL Protection Status</h3>
              </div>
              <button
                onClick={() => setActiveTab('htbl_analysis')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Deep Analysis <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">Flagged Potential Worksites:</span>
                <span className="text-base font-extrabold text-rose-700">
                  {stats.htblPotentialCases} / {stats.totalVisits}
                </span>
              </div>
              <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                Workplaces exhibiting statutory signs of bonded labour (advances, restrictions on movement, withheld wages, or debt bondage).
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Inter-State Labour Groups:</span>
                <span className="font-semibold text-slate-900">{stats.interStateLabourCases}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Intra-State Migrant Groups:</span>
                <span className="font-semibold text-slate-900">{stats.intraStateLabourCases}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Clean / Routine Inspection:</span>
                <span className="font-semibold text-emerald-700">
                  {Math.max(0, stats.totalVisits - stats.htblPotentialCases)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('htbl_analysis')}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
          >
            View 12 Statutory Indicators Breakdown
          </button>
        </div>

        {/* Industry Types Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Industry & Worksite Distribution</h3>
              </div>
              <span className="text-xs text-slate-500">Breakdown by sector</span>
            </div>

            {sortedIndustries.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No worksite records logged yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedIndustries.map(([industry, count]) => {
                  const percentage = stats.totalVisits > 0 ? Math.round((count / stats.totalVisits) * 100) : 0;
                  return (
                    <div key={industry} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700 font-semibold">{industry}</span>
                        <span className="text-slate-500">{count} visits ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary sector focus: Brick Kiln, Stone Quarry, Construction</span>
            <button
              onClick={() => setActiveTab('records')}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              Browse all records <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Visits Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Field Visits</h3>
            <p className="text-xs text-slate-500">Latest worksites inspected by team</p>
          </div>
          <button
            onClick={() => setActiveTab('records')}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            View All ({records.length}) Records <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentVisits.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No visits logged yet</p>
            <p className="text-xs text-slate-500 mt-1">Start by recording your first worksite inspection.</p>
            <button
              onClick={onNewVisit}
              className="mt-3 inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add First Visit
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Visible on < 640px) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {recentVisits.map((record) => (
                <div key={record.id} className="py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                          {record.id}
                        </span>
                        <span className="text-[11px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">{record.dateOfVisit}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {record.industryName}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {record.industryType} • {record.mandal || 'N/A'}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      {record.isHtblPotential ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Potential
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Clean
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                    <div>
                      <span className="text-slate-400 text-[11px]">Workers: </span>
                      <strong className="text-slate-800">{record.approxWorkersCount}</strong>
                      <span className="text-[10px] text-slate-400 ml-1">
                        (M:{record.maleWorkersCount} F:{record.femaleWorkersCount})
                      </span>
                    </div>

                    <button
                      onClick={() => onViewRecord(record)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg min-h-[36px] flex items-center transition-colors"
                    >
                      View Record
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Table View (Visible on >= 640px) */}
            <div className="hidden sm:block overflow-x-auto table-responsive custom-scrollbar">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Record ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Industry / Worksite</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Workers</th>
                    <th className="py-2.5 px-3">HT&BL Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentVisits.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {record.id}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700">
                        {record.dateOfVisit}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                          {record.industryName}
                        </div>
                        <div className="text-[11px] text-slate-500">{record.industryType}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div>{record.mandal || '-'}</div>
                        <div className="text-[11px] text-slate-400">{record.areaVillageWard || ''}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{record.approxWorkersCount}</span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          (M: {record.maleWorkersCount}, F: {record.femaleWorkersCount})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {record.isHtblPotential ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Potential Case
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            No Elements
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onViewRecord(record)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors min-h-[32px]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
