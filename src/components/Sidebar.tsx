import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { FmmLogo } from './FmmLogo';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ShieldAlert,
  BarChart3,
  FileSpreadsheet,
  Download,
  Settings,
  CheckCircle2,
  WifiOff,
  Cloud,
  Table,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  recordsCount: number;
  htblCount: number;
  onNewVisit: () => void;
  onExportExcel: () => void;
  onDownloadTemplate: () => void;
  currentUser?: UserProfile | null;
  isOnline?: boolean;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  recordsCount,
  htblCount,
  onNewVisit,
  onExportExcel,
  onDownloadTemplate,
  currentUser,
  isOnline = true,
  onOpenAuth,
  onSignOut,
}) => {
  const primaryNavItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Key Metrics',
    },
    {
      id: 'new_visit' as ActiveTab,
      label: 'New Visit Form',
      icon: PlusCircle,
      description: 'Log Worksite Inspection',
      isPrimaryAction: true,
    },
    {
      id: 'records' as ActiveTab,
      label: 'All Visits',
      icon: FileText,
      badge: recordsCount,
      badgeColor: 'bg-slate-200 text-slate-700',
      description: 'Search & Edit Records',
    },
    {
      id: 'master_excel' as ActiveTab,
      label: 'Master Excel',
      icon: Table,
      badge: recordsCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-semibold',
      description: 'Auto-Updated Live 1.xlsx',
    },
    {
      id: 'htbl_analysis' as ActiveTab,
      label: 'HT&BL Analysis',
      icon: ShieldAlert,
      badge: htblCount > 0 ? htblCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
      description: '12 Statutory Indicators',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports & Filter',
      icon: BarChart3,
      description: 'Cluster & Village Reports',
    },
    {
      id: 'import_export' as ActiveTab,
      label: 'Excel Hub & Backup',
      icon: FileSpreadsheet,
      description: 'Import / Export .xlsx',
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings & Cloud',
      icon: Settings,
      description: 'Firebase & Staff Profile',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden lg:flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-5">
        
        {/* Project Branding */}
        <div className="p-3 bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 rounded-xl flex items-center gap-3">
          <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <FmmLogo size="sm" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-900 truncate">FMM BLSA Project</h2>
            <p className="text-[10px] text-emerald-800 font-medium italic truncate">Towards wholeness</p>
          </div>
        </div>

        {/* Quick Log Action */}
        <div className="px-1">
          <button
            id="sidebar-create-visit-btn"
            onClick={onNewVisit}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            + Record New Visit
          </button>
        </div>

        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Navigation Menu
          </p>
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    if (item.id === 'new_visit') {
                      onNewVisit();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left group ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Direct Excel Tools Section */}
        <div className="pt-2 border-t border-slate-100">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Excel Actions
          </p>
          <div className="space-y-1">
            <button
              id="sidebar-export-excel-action"
              onClick={onExportExcel}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Master Excel (.xlsx)</span>
            </button>
            <button
              id="sidebar-download-template-action"
              onClick={onDownloadTemplate}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>Download Master Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Status Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center justify-between font-semibold text-slate-800">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cloud Firestore</span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          {recordsCount} records stored in collection <span className="font-mono text-slate-700 font-semibold">visits</span>.
        </p>
        {currentUser && (
          <div className="pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 truncate">
            User: <span className="font-bold text-slate-700">{currentUser.name}</span> ({currentUser.role})
          </div>
        )}
      </div>
    </aside>
  );
};
