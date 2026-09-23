import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { FmmLogo } from './FmmLogo';
import { 
  ClipboardList, 
  PlusCircle, 
  Menu, 
  X, 
  FileSpreadsheet, 
  ShieldAlert, 
  BarChart3, 
  Download, 
  Settings, 
  MapPin, 
  Home,
  CheckCircle2,
  WifiOff,
  User,
  LogOut,
  LogIn,
  Shield,
  Table,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  recordsCount: number;
  onNewVisit: () => void;
  onExportExcel: () => void;
  currentUser: UserProfile | null;
  isOnline: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  recordsCount,
  onNewVisit,
  onExportExcel,
  currentUser,
  isOnline,
  onOpenAuth,
  onSignOut,
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Home },
    { id: 'new_visit' as ActiveTab, label: 'New Visit', icon: PlusCircle, isPrimary: true },
    { id: 'records' as ActiveTab, label: 'All Visits', icon: ClipboardList, badge: recordsCount },
    { id: 'master_excel' as ActiveTab, label: 'Master Excel', icon: Table, badge: recordsCount },
    { id: 'htbl_analysis' as ActiveTab, label: 'HT&BL Analysis', icon: ShieldAlert },
    { id: 'reports' as ActiveTab, label: 'Reports', icon: BarChart3 },
    { id: 'import_export' as ActiveTab, label: 'Excel Import/Export', icon: FileSpreadsheet },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & System Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 text-left focus:outline-hidden group min-w-0"
            >
              <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-2xs group-hover:border-emerald-300 transition-colors shrink-0">
                <FmmLogo size="sm" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 text-sm xs:text-base sm:text-lg leading-tight block tracking-tight truncate">
                  FMM BLSA Project
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 tracking-wide block truncate max-w-[190px] xs:max-w-[280px] sm:max-w-none">
                  Towards wholeness • Labour Monitoring
                </span>
              </div>
            </button>
          </div>

          {/* Center: Sync Status Indicator */}
          <div className="hidden xl:flex items-center">
            {isOnline ? (
              <div
                id="sync-status-online"
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold"
                title="Connected to Firebase Cloud Firestore. All changes sync in real time."
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>✓ Synced (Cloud Firestore)</span>
              </div>
            ) : (
              <div
                id="sync-status-offline"
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-semibold animate-pulse"
                title="Offline – Changes will sync when connection returns"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline – Changes will sync when connection returns</span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons on Desktop / Tablet */}
          <div className="hidden md:flex items-center gap-2">
            <button
              id="header-export-excel-btn"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 min-h-[40px]"
              title="Download Master Excel (.xlsx) containing all Firestore records"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Export Master Excel</span>
              <span className="lg:hidden">Export</span>
            </button>

            <button
              id="header-new-visit-btn"
              onClick={onNewVisit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors min-h-[40px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Visit</span>
            </button>

            {/* User Profile / Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'Admin' : 'Field Staff'}
                    </span>
                  </div>
                </div>

                <button
                  id="header-signout-btn"
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="header-signin-btn"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 min-h-[40px]"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu & Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-2xs z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-40 lg:hidden border-t border-slate-200 bg-white shadow-xl px-4 pt-3 pb-6 space-y-3 max-h-[calc(100dvh-4rem)] overflow-y-auto custom-scrollbar">
            {/* Mobile Sync Indicator */}
            <div className="pb-2.5 border-b border-slate-100">
              {isOnline ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>✓ Synced (Cloud Firestore Active)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Offline – Changes will sync when online</span>
                </div>
              )}
            </div>

            {/* User Info on Mobile */}
            {currentUser ? (
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-900 block truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{currentUser.email} • {currentUser.role}</span>
                </div>
                <button
                  onClick={() => {
                    onSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-bold px-3 py-1.5 bg-white hover:bg-rose-50 rounded-lg border border-slate-200 shrink-0 min-h-[38px] flex items-center"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full min-h-[44px] py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Field System
              </button>
            )}

            {/* Mobile Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onNewVisit();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                + New Visit Form
              </button>
              <button
                onClick={() => {
                  onExportExcel();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Export Master Excel (.xlsx)
              </button>
            </div>

            {/* Nav Links */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Navigation
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
