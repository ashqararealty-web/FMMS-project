/**
 * Field Visit & Worksite Mapping System
 * Master Application Entry Point with Cloud Firestore & Firebase Auth
 */

import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ActiveTab, VisitRecord, UserProfile } from './types';
import { StorageService } from './services/storage';
import { exportToExcel, downloadTemplate } from './services/excelService';
import {
  auth,
  subscribeToVisits,
  saveVisitToFirestore,
  deleteVisitFromFirestore,
  bulkImportToFirestore,
  syncUserProfile,
  getUserProfile,
} from './services/firebase';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { VisitFormView } from './components/VisitFormView';
import { RecordsListView } from './components/RecordsListView';
import { RecordDetailModal } from './components/RecordDetailModal';
import { HTBLAnalysisView } from './components/HTBLAnalysisView';
import { ReportsView } from './components/ReportsView';
import { ImportExportView } from './components/ImportExportView';
import { SettingsView } from './components/SettingsView';
import { MasterExcelView } from './components/MasterExcelView';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication & Online State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Records state
  const [records, setRecords] = useState<VisitRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<VisitRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<VisitRecord | null>(null);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profile);
          } else {
            const synced = await syncUserProfile(firebaseUser);
            setCurrentUser(synced);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // Fallback to basic auth object
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Staff Member',
            role: firebaseUser.email === 'ashqararealty@gmail.com' ? 'admin' : 'staff',
            lastLogin: new Date().toISOString(),
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Cloud Firestore visits
  useEffect(() => {
    // Seed initial cache from local storage if any
    const localRecords = StorageService.getRecords();
    if (localRecords.length > 0) {
      setRecords(localRecords);
    }

    const unsubscribe = subscribeToVisits(
      (firestoreRecords) => {
        if (firestoreRecords && firestoreRecords.length > 0) {
          setRecords(firestoreRecords);
          StorageService.saveAllRecords(firestoreRecords);
        } else if (localRecords.length > 0) {
          // If Firestore is brand new and empty, seed it with sample demo visits
          bulkImportToFirestore(localRecords, currentUser).catch((err) => {
            console.warn('Initial cloud seed notice:', err);
          });
        }
      },
      (error) => {
        console.warn('Cloud Firestore listener notice (using cached data):', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Dynamic Dashboard Stats calculated from live records
  const stats = useMemo(() => {
    return StorageService.calculateStats(records);
  }, [records]);

  // Calculate Next Visit Serial Number
  const nextVisitNumber = useMemo(() => {
    let maxNum = 2314; // Master template base sequence
    records.forEach((r) => {
      const match = (r.id || '').match(/(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n > maxNum) {
          maxNum = n;
        }
      }
    });
    return maxNum + 1;
  }, [records]);

  // Handlers
  const handleNewVisit = () => {
    setEditingRecord(null);
    setActiveTab('new_visit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditRecord = (record: VisitRecord) => {
    setEditingRecord(record);
    setActiveTab('new_visit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRecord = async (
    recordData: Omit<VisitRecord, 'id' | 'createdAt' | 'updatedAt' | 'isHtblPotential'> & { id?: string }
  ) => {
    try {
      // Save directly to Cloud Firestore
      const saved = await saveVisitToFirestore(recordData, currentUser);
      
      // Update local storage backup
      StorageService.saveRecord(saved);
      
      // Update in-memory state
      setRecords((prev) => {
        const index = prev.findIndex((r) => r.id === saved.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = saved;
          return next;
        }
        return [saved, ...prev];
      });

      setEditingRecord(null);
      return saved;
    } catch (err: any) {
      console.error('Error saving record to Firestore, saving to local fallback:', err);
      const fallbackSaved = StorageService.saveRecord(recordData);
      setRecords(StorageService.getRecords());
      setEditingRecord(null);
      return fallbackSaved;
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteVisitFromFirestore(id);
    } catch (err) {
      console.warn('Firestore deletion fallback:', err);
    }
    StorageService.deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (viewingRecord?.id === id) {
      setViewingRecord(null);
    }
  };

  const handleBulkImportToFirestore = async (importedRecords: VisitRecord[]) => {
    const result = await bulkImportToFirestore(importedRecords, currentUser);
    // Refresh local cache
    StorageService.saveAllRecords(records);
    return result;
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleExportAllExcel = (customRecords?: VisitRecord[]) => {
    const dataToExport = customRecords && customRecords.length > 0 ? customRecords : records;
    const dateStr = new Date().toISOString().split('T')[0];
    exportToExcel(dataToExport, `Field_Visits_Master_Export_${dateStr}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        recordsCount={records.length}
        currentUser={currentUser}
        isOnline={isOnline}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onNewVisit={handleNewVisit}
        onExportExcel={() => handleExportAllExcel()}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          recordsCount={records.length}
          htblCount={stats.htblPotentialCases}
          currentUser={currentUser}
          isOnline={isOnline}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
          onNewVisit={handleNewVisit}
          onExportExcel={() => handleExportAllExcel()}
          onDownloadTemplate={() => downloadTemplate()}
        />

        {/* Main Content Area with fluid responsive container padding */}
        <main className="flex-1 p-3 xs:p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              records={records}
              onNewVisit={handleNewVisit}
              onExportExcel={() => handleExportAllExcel()}
              setActiveTab={setActiveTab}
              onViewRecord={(r) => setViewingRecord(r)}
              onEditRecord={handleEditRecord}
            />
          )}

          {activeTab === 'new_visit' && (
            <VisitFormView
              initialRecord={editingRecord}
              nextVisitNumber={nextVisitNumber}
              onSave={handleSaveRecord}
              onViewMasterExcel={() => setActiveTab('master_excel')}
              onCancel={() => {
                setEditingRecord(null);
                setActiveTab('records');
              }}
            />
          )}

          {activeTab === 'records' && (
            <RecordsListView
              records={records}
              currentUser={currentUser}
              onViewRecord={(r) => setViewingRecord(r)}
              onEditRecord={handleEditRecord}
              onDeleteRecord={handleDeleteRecord}
              onExportExcel={handleExportAllExcel}
              onNewVisit={handleNewVisit}
            />
          )}

          {activeTab === 'master_excel' && (
            <MasterExcelView
              records={records}
              onViewRecord={(r) => setViewingRecord(r)}
              onNewVisit={handleNewVisit}
            />
          )}

          {activeTab === 'htbl_analysis' && (
            <HTBLAnalysisView
              records={records}
              onViewRecord={(r) => setViewingRecord(r)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              records={records}
              onViewRecord={(r) => setViewingRecord(r)}
            />
          )}

          {activeTab === 'import_export' && (
            <ImportExportView
              records={records}
              currentUser={currentUser}
              onImportComplete={(updated) => setRecords(updated)}
              onImportToFirestore={handleBulkImportToFirestore}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              recordsCount={records.length}
              currentUser={currentUser}
              isOnline={isOnline}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onSignOut={handleSignOut}
            />
          )}
        </main>
      </div>

      {/* Record View Modal */}
      {viewingRecord && (
        <RecordDetailModal
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
          onEdit={(r) => {
            setViewingRecord(null);
            handleEditRecord(r);
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user: UserProfile) => setCurrentUser(user)}
      />

      {/* Footer with Mobile Safe Area Support */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 text-center text-xs text-slate-500 pb-safe">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="leading-relaxed">FMM BLSA Project • Towards wholeness • Master Excel Standard</span>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
            <span>Cloud Firestore Sync Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
