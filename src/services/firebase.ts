import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { VisitRecord, UserProfile, UserRole } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore using the configured database ID per skill guidelines
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check per skill instruction
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently operating in offline mode.');
    }
  }
}

// Initial connection test
testConnection();

// Compute Next Serial Number (e.g. Next Visit No: 2315)
export function computeNextVisitNumber(records: VisitRecord[]): number {
  let highest = 2314; // Default starting sequence per requirements
  records.forEach((r) => {
    // Check if ID matches numbers or FV-XXXX
    const numMatch = r.id.match(/\d+/g);
    if (numMatch) {
      numMatch.forEach((n) => {
        const val = parseInt(n, 10);
        if (val > highest && val < 1000000) {
          highest = val;
        }
      });
    }
  });
  return highest + 1;
}

// Format Visit ID e.g. "FV-2315"
export function formatVisitId(nextNo: number): string {
  return `FV-${nextNo}`;
}

// Check if HT&BL is potential
export function computeIsHtblPotential(htbl: any): boolean {
  if (!htbl) return false;
  if (htbl.noElements) return false;
  return Boolean(
    htbl.debtObligation?.present ||
    htbl.advance?.present ||
    htbl.customSocialObligation?.present ||
    htbl.succession?.present ||
    htbl.economicConsideration?.present ||
    htbl.casteOrCommunity?.present ||
    htbl.suretyOrContract?.present ||
    htbl.interState?.present ||
    htbl.rightToMinimumWage?.present ||
    htbl.freedomOfEmployment?.present ||
    htbl.rightToMoveFreely?.present ||
    htbl.rightToAppropriateSellAtMarket?.present
  );
}

// Real-time listener for visits collection
export function subscribeToVisits(
  onData: (visits: VisitRecord[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'visits';
  const visitsQuery = query(collection(db, path));

  return onSnapshot(
    visitsQuery,
    (snapshot) => {
      const records: VisitRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          ...(data as any),
          id: data.id || docSnap.id,
          isHtblPotential: computeIsHtblPotential(data.htblElements),
        });
      });

      // Sort descending by dateOfVisit and id
      records.sort((a, b) => {
        if (b.dateOfVisit === a.dateOfVisit) {
          return b.id.localeCompare(a.id);
        }
        return b.dateOfVisit.localeCompare(a.dateOfVisit);
      });

      onData(records);
    },
    (error) => {
      console.error('Error in subscribeToVisits snapshot listener:', error);
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Save or Update Visit Record in Firestore
export async function saveVisitToFirestore(
  recordData: Partial<VisitRecord> & { id?: string },
  currentUser: UserProfile | null
): Promise<VisitRecord> {
  const path = 'visits';
  const now = new Date().toISOString();
  const id = recordData.id || `FV-${Date.now().toString().slice(-4)}`;

  const isHtbl = computeIsHtblPotential(recordData.htblElements);

  const completeRecord: VisitRecord = {
    id,
    createdAt: recordData.createdAt || now,
    updatedAt: now,
    createdBy: recordData.createdBy || currentUser?.uid || auth.currentUser?.uid || 'anonymous',
    createdByEmail: recordData.createdByEmail || currentUser?.email || auth.currentUser?.email || '',

    reportingPerson: recordData.reportingPerson || '',
    dateOfVisit: recordData.dateOfVisit || now.split('T')[0],
    noOfVisit: recordData.noOfVisit || '1st Visit',
    month: recordData.month || '',
    clusterName: recordData.clusterName || '',
    industryType: recordData.industryType || 'Brick Kiln',
    industryName: recordData.industryName || 'Unnamed Worksite',
    locationLink: recordData.locationLink || '',
    areaVillageWard: recordData.areaVillageWard || '',
    mandal: recordData.mandal || '',
    revenueDivision: recordData.revenueDivision || '',
    policeStation: recordData.policeStation || '',
    seasonality: recordData.seasonality || 'Seasonal',

    interactedPersonsCount: Number(recordData.interactedPersonsCount) || 0,
    approxWorkersCount: Number(recordData.approxWorkersCount) || 0,
    maleWorkersCount: Number(recordData.maleWorkersCount) || 0,
    femaleWorkersCount: Number(recordData.femaleWorkersCount) || 0,
    familiesCount: Number(recordData.familiesCount) || 0,
    otherStateLabour: recordData.otherStateLabour || '',
    intraStateLabour: recordData.intraStateLabour || '',

    contactPersonName: recordData.contactPersonName || '',
    contactPersonPhone: recordData.contactPersonPhone || '',
    ownerName: recordData.ownerName || '',
    ownerPhone: recordData.ownerPhone || '',

    htblElements: recordData.htblElements || {
      debtObligation: { present: false },
      advance: { present: false },
      customSocialObligation: { present: false },
      succession: { present: false },
      economicConsideration: { present: false },
      casteOrCommunity: { present: false },
      suretyOrContract: { present: false },
      interState: { present: false },
      rightToMinimumWage: { present: false },
      freedomOfEmployment: { present: false },
      rightToMoveFreely: { present: false },
      rightToAppropriateSellAtMarket: { present: false },
      noElements: true,
    },
    isHtblPotential: isHtbl,

    conversationHighlights: recordData.conversationHighlights || '',
    observations: recordData.observations || '',
    challengesFaced: recordData.challengesFaced || '',
    caseStatus: recordData.caseStatus || 'Initial Screening',
    additionalRemarks: recordData.additionalRemarks || '',
  };

  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, completeRecord, { merge: true });
    return completeRecord;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${id}`);
  }
}

// Delete Visit Record from Firestore
export async function deleteVisitFromFirestore(id: string): Promise<void> {
  const path = `visits/${id}`;
  try {
    const docRef = doc(db, 'visits', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Bulk Import into Firestore
export async function bulkImportToFirestore(
  newRecords: VisitRecord[],
  currentUser: UserProfile | null
): Promise<{ added: number; updated: number }> {
  let added = 0;
  let updated = 0;

  for (const record of newRecords) {
    try {
      const docRef = doc(db, 'visits', record.id);
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        updated++;
      } else {
        added++;
      }
      await setDoc(docRef, {
        ...record,
        updatedAt: new Date().toISOString(),
        createdBy: record.createdBy || currentUser?.uid || 'imported',
        createdByEmail: record.createdByEmail || currentUser?.email || 'imported',
      }, { merge: true });
    } catch (e) {
      console.error(`Failed to import record ${record.id}:`, e);
    }
  }

  return { added, updated };
}

// User Profile Management
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  try {
    const docRef = doc(db, 'users', user.uid);
    const snap = await getDoc(docRef);

    // Ashqararealty@gmail.com is bootstrapped as admin
    const isAdminEmail = user.email?.toLowerCase() === 'ashqararealty@gmail.com';

    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      // Guarantee admin status if email matches
      if (isAdminEmail && existing.role !== 'admin') {
        const updated: UserProfile = { ...existing, role: 'admin' };
        await setDoc(docRef, updated, { merge: true });
        return updated;
      }
      return existing;
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Staff Member',
      email: user.email || '',
      role: isAdminEmail ? 'admin' : 'field_staff',
      createdAt: new Date().toISOString(),
    };

    await setDoc(docRef, newProfile);
    return newProfile;
  } catch (err) {
    console.warn('Could not sync user profile to Firestore:', err);
    // Return a local in-memory fallback user profile
    return {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Field Staff',
      email: user.email || '',
      role: user.email?.toLowerCase() === 'ashqararealty@gmail.com' ? 'admin' : 'field_staff',
    };
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch user profile:', err);
    return null;
  }
}
