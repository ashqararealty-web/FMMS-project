import React, { useState } from 'react';
import {
  Settings,
  User,
  CheckCircle,
  Database,
  Cloud,
  Shield,
  ShieldCheck,
  LogIn,
  LogOut,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  recordsCount: number;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  isOnline: boolean;
  onResetAllData?: () => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  recordsCount,
  currentUser,
  onOpenAuth,
  onSignOut,
  isOnline,
  onResetAllData,
}) => {
  const [defaultOfficer, setDefaultOfficer] = useState(
    localStorage.getItem('fv_default_officer') || (currentUser?.name || '')
  );
  const [defaultCluster, setDefaultCluster] = useState(
    localStorage.getItem('fv_default_cluster') || ''
  );
  const [organization, setOrganization] = useState(
    localStorage.getItem('fv_organization') || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('fv_default_officer', defaultOfficer);
    localStorage.setItem('fv_default_cluster', defaultCluster);
    localStorage.setItem('fv_organization', organization);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    try {
      if (onResetAllData) {
        await onResetAllData();
      }
      setDefaultOfficer('');
      setDefaultCluster('');
      setOrganization('');
      setShowResetConfirm(false);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-1">
          <Settings className="w-3.5 h-3.5 text-emerald-600" />
          System Configuration &amp; Cloud Services
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Field System Settings &amp; Firebase Cloud
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure default staff information, auto-fill preferences, and view Cloud Firestore integration.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Staff default preferences saved successfully!</span>
        </div>
      )}

      {/* Firebase Cloud Firestore Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Firebase Cloud Firestore</h2>
              <p className="text-xs text-slate-500">Live multi-device database synchronization</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isOnline ? 'Connected (Live)' : 'Offline Cache Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Collection</span>
            <span className="font-mono font-bold text-slate-800">visits</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">{recordsCount} records stored</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Firebase Project</span>
            <span className="font-mono font-bold text-slate-800 truncate block">cryptic-spirit-t53bd</span>
            <span className="text-[11px] text-emerald-700 block mt-0.5">Firestore Active</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Security Rules</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Master Gate RBAC
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Admin & Field Staff roles</span>
          </div>
        </div>
      </div>

      {/* Staff Account & Role */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">User Authentication & Role</h2>
              <p className="text-xs text-slate-500">Firebase Authentication account credentials</p>
            </div>
          </div>

          {currentUser ? (
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In / Register
            </button>
          )}
        </div>

        {currentUser ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 text-sm">{currentUser.name}</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                {currentUser.role === 'admin' ? 'Project Administrator (Full Access)' : 'Field Officer (Data Collection)'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Email Address</span>
                <span className="font-mono text-slate-700">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Account UID</span>
                <span className="font-mono text-slate-500 text-[11px] truncate block">{currentUser.uid}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-2">
            <p className="font-medium">
              You are currently viewing in guest mode. Sign in to record visits under your authenticated staff account or access administrator controls.
            </p>
          </div>
        )}
      </div>

      {/* Staff Defaults Form */}
      <form onSubmit={handleSaveDefaults} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Default Field Staff & Organization Details
        </h2>
        <p className="text-xs text-slate-500">
          These values pre-fill new visit entries to speed up fieldwork data collection.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Default Reporting Person Name
            </label>
            <input
              type="text"
              value={defaultOfficer}
              onChange={(e) => setDefaultOfficer(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Organization / NGO Project Name
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Default Working Cluster
            </label>
            <input
              type="text"
              value={defaultCluster}
              onChange={(e) => setDefaultCluster(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center"
          >
            Save Default Information
          </button>
        </div>
      </form>

      {resetSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs text-emerald-900 flex items-center gap-2.5 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">All test records &amp; typed entries have been reset successfully!</p>
            <p className="text-slate-600 mt-0.5">Cloud Firestore and local caches have been cleared to a clean initial state.</p>
          </div>
        </div>
      )}

      {/* Database Management & Reset Test Data Section */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Reset System &amp; Clear Test Data</h2>
              <p className="text-xs text-slate-500">Remove temporary test visits, test names, and reset database</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset All Test Data
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Use this action to clean all testing records, demo worksite entries, and previously typed names from both Cloud Firestore and local storage. This leaves the system completely clean and ready for official fieldwork visits.
        </p>

        <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between">
          <span className="text-slate-600">Current visits stored in database:</span>
          <span className="font-bold text-slate-900">{recordsCount} records</span>
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
                <p className="text-xs text-slate-500">This action will clear all records and test data</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
              <p className="font-semibold">The following will be deleted / reset:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>All <strong>{recordsCount} visit records</strong> in Cloud Firestore &amp; local storage</li>
                <li>All typed worksite names, contact details, and test remarks</li>
                <li>Saved staff defaults and auto-fill preferences</li>
                <li>Next Visit ID counter will reset to start fresh at <strong>FV-2315</strong></li>
              </ul>
            </div>

            <p className="text-xs text-slate-500">
              Are you sure you want to proceed with clearing all data?
            </p>

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
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Reset All Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
