import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { OnlinePlayer, PlayerProgress, PlayerSession } from '../types/game';

const app = initializeApp(firebaseConfig);
const firestoreDbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = firestoreDbId ? getFirestore(app, firestoreDbId) : getFirestore(app);
export const auth = getAuth(app);

// In-memory only access token for Google Workspace Sheets/Drive (never persisted to localStorage)
let cachedSheetsAccessToken: string | null = null;
let isAuthFlowActive = false;

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

export type OperationTypeValue = (typeof OperationType)[keyof typeof OperationType];

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationTypeValue;
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
  operationType: OperationTypeValue,
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
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection check
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase Firestore client appears offline. Verify configuration.');
    }
    return false;
  }
}

// 1) Basic Google Sign-In (ONLY basic profile, NO Drive/Sheets scope so all Google accounts work cleanly)
export async function googleSignInBasic(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    isAuthFlowActive = true;
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } finally {
    isAuthFlowActive = false;
  }
}

// 2) Incremental Google Workspace Sheets/Drive Sign-In (ONLY requested when submitting to or reading Teacher Sheet)
export async function requestSheetsAccessToken(): Promise<string> {
  if (cachedSheetsAccessToken) {
    return cachedSheetsAccessToken;
  }
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.setCustomParameters({ prompt: 'consent' });
  try {
    isAuthFlowActive = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Sheets. Silakan izinkan akses spreadsheet.');
    }
    cachedSheetsAccessToken = credential.accessToken;
    return cachedSheetsAccessToken;
  } finally {
    isAuthFlowActive = false;
  }
}

export function getCachedSheetsAccessToken(): string | null {
  return cachedSheetsAccessToken;
}

export function clearSheetsAccessToken(): void {
  cachedSheetsAccessToken = null;
}

export function subscribeAuthState(cb: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user && !isAuthFlowActive) {
      cachedSheetsAccessToken = null;
    }
    cb(user);
  });
}

export async function signOutFirebase(): Promise<void> {
  cachedSheetsAccessToken = null;
  await signOut(auth);
}

// Persist Google user profile
export async function saveUserProfile(session: PlayerSession): Promise<void> {
  if (!session.uid || !auth.currentUser) return;
  const path = `users/${session.uid}`;
  try {
    await setDoc(
      doc(db, 'users', session.uid),
      {
        uid: session.uid,
        displayName: session.name.slice(0, 80),
        school: session.school.slice(0, 100),
        className: session.className.slice(0, 40),
        role: session.role === 'teacher' ? 'teacher' : 'student',
        shirtColor: session.avatar.shirtColor,
        pantsColor: session.avatar.pantsColor,
        hairColor: session.avatar.hairColor,
        hatColor: session.avatar.hatColor,
        companion: session.avatar.companion,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    // Non-fatal if teacher role isn't in admins collection yet; fall back cleanly
    console.warn('saveUserProfile warning:', error);
  }
}

export async function loadStudentProgressCloud(uid: string): Promise<PlayerProgress | null> {
  const path = `student_progress/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'student_progress', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      answeredCorrectIds: Array.isArray(d.answeredCorrectIds) ? d.answeredCorrectIds : [],
      completedChapterIds: Array.isArray(d.completedChapters) ? d.completedChapters : [],
      reflections: typeof d.reflections === 'object' && d.reflections ? d.reflections : {},
      totalScore: Number(d.totalScore || 0),
      pvpWins: Number(d.pvpWins || 0),
      level: Number(d.level || 1),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveStudentProgressCloud(
  session: PlayerSession,
  progress: PlayerProgress
): Promise<void> {
  if (!session.uid || !auth.currentUser) return;
  const path = `student_progress/${session.uid}`;
  try {
    await setDoc(doc(db, 'student_progress', session.uid), {
      uid: session.uid,
      studentName: session.name.slice(0, 80),
      school: session.school.slice(0, 100),
      className: session.className.slice(0, 40),
      totalScore: Math.max(0, Math.min(100000, progress.totalScore)),
      level: Math.max(1, Math.min(100, progress.level)),
      pvpWins: Math.max(0, Math.min(10000, progress.pvpWins)),
      answeredCorrectIds: progress.answeredCorrectIds.slice(0, 100),
      completedChapters: progress.completedChapterIds.slice(0, 10),
      reflections: progress.reflections,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAllCloudProgressForAdmin(): Promise<
  Array<{
    uid: string;
    studentName: string;
    school: string;
    className: string;
    totalScore: number;
    level: number;
    pvpWins: number;
    answeredCount: number;
    completedChaptersCount: number;
    updatedAt: string;
  }>
> {
  if (!auth.currentUser) return [];
  const path = 'student_progress';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        uid: String(d.uid || docSnap.id),
        studentName: String(d.studentName || 'Siswa'),
        school: String(d.school || '-'),
        className: String(d.className || '-'),
        totalScore: Number(d.totalScore || 0),
        level: Number(d.level || 1),
        pvpWins: Number(d.pvpWins || 0),
        answeredCount: Array.isArray(d.answeredCorrectIds) ? d.answeredCorrectIds.length : 0,
        completedChaptersCount: Array.isArray(d.completedChapters) ? d.completedChapters.length : 0,
        updatedAt: String(d.updatedAt || ''),
      };
    });
  } catch {
    return [];
  }
}

// Public city presence sync in Firestore (for cross-device & cross-link synchronization)
export async function upsertFirestorePresence(player: OnlinePlayer): Promise<void> {
  const safeId = player.sessionId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const path = `city_presence/${safeId}`;
  try {
    await setDoc(doc(db, 'city_presence', safeId), {
      sessionId: safeId,
      name: player.name.slice(0, 80),
      school: player.school.slice(0, 100),
      className: player.className.slice(0, 40),
      role: player.role === 'teacher' ? 'teacher' : 'student',
      shirtColor: player.avatar.shirtColor,
      pantsColor: player.avatar.pantsColor,
      hairColor: player.avatar.hairColor,
      hatColor: player.avatar.hatColor,
      companion: player.avatar.companion,
      x: Math.max(-499, Math.min(499, player.x)),
      y: Math.max(-49, Math.min(199, player.y)),
      z: Math.max(-499, Math.min(499, player.z)),
      rotY: Math.max(-99, Math.min(99, player.rotY)),
      animState: player.animState,
      level: Math.max(1, Math.min(100, player.level)),
      progressPct: Math.max(0, Math.min(100, player.progressPct)),
      buildingId: player.buildingId.slice(0, 64),
      lastSeenMs: Date.now(),
    });
  } catch (error) {
    console.warn('Presence upsert warning:', path, error);
  }
}

export async function removeFirestorePresence(sessionId: string): Promise<void> {
  const safeId = sessionId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  try {
    await deleteDoc(doc(db, 'city_presence', safeId));
  } catch {
    // ignore cleanup error
  }
}

export function subscribeFirestorePresence(
  onPlayers: (players: OnlinePlayer[]) => void
): Unsubscribe {
  const cutoff = Date.now() - 45_000;
  const q = query(collection(db, 'city_presence'), where('lastSeenMs', '>', cutoff));
  return onSnapshot(
    q,
    (snapshot) => {
      const now = Date.now();
      const list: OnlinePlayer[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (Number(d.lastSeenMs || 0) < now - 35_000) return;
        list.push({
          sessionId: String(d.sessionId || docSnap.id),
          name: String(d.name || 'Siswa'),
          school: String(d.school || 'SMP'),
          className: String(d.className || 'VIII'),
          role: d.role === 'teacher' ? 'teacher' : 'student',
          avatar: {
            shirtColor: String(d.shirtColor || '#2563EB'),
            pantsColor: String(d.pantsColor || '#1E293B'),
            hairColor: String(d.hairColor || '#1E1B18'),
            hatColor: String(d.hatColor || '#F59E0B'),
            companion: (d.companion || 'owl') as OnlinePlayer['avatar']['companion'],
          },
          x: Number(d.x || 0),
          y: Number(d.y || 0),
          z: Number(d.z || 0),
          rotY: Number(d.rotY || 0),
          animState: (d.animState || 'idle') as OnlinePlayer['animState'],
          level: Number(d.level || 1),
          progressPct: Number(d.progressPct || 0),
          buildingId: String(d.buildingId || ''),
          lastSeenMs: Number(d.lastSeenMs || now),
        });
      });
      onPlayers(list);
    },
    (error) => {
      console.warn('Presence listener warning:', error);
    }
  );
}
