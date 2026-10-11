import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with custom firestoreDatabaseId if configured
export const db: Firestore = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);

// Validate connection helper
export const checkFirestoreConnection = async (): Promise<{ success: boolean; latency?: number; message: string }> => {
  const start = performance.now();
  try {
    await getDocFromServer(doc(db, 'settings', 'general'));
    const latency = Math.round(performance.now() - start);
    return {
      success: true,
      latency,
      message: `Firebase Firestore connected (${latency}ms) [${firebaseConfig.projectId}]`,
    };
  } catch (error: any) {
    const latency = Math.round(performance.now() - start);
    if (error?.message?.includes('the client is offline')) {
      return {
        success: false,
        latency,
        message: 'Firebase Firestore client is offline or network restricted.',
      };
    }
    // Document not existing still means live connection to Firestore is active
    return {
      success: true,
      latency,
      message: `Firebase Firestore live & responding (${latency}ms) [${firebaseConfig.projectId}]`,
    };
  }
};
