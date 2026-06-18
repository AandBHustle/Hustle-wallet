/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

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

let firebaseApp;
let db: any = null;
let auth: any = null;
let isFirebaseActive = false;

// Determine if config is a real project config (not generic placeholder)
const isConfigReal = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'MOCK_API_KEY_PLACEHOLDER' &&
  !firebaseConfig.apiKey.includes('PLACEHOLDER') &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'mock-project-id';

if (isConfigReal) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(firebaseApp);
    isFirebaseActive = true;
    console.log("Firebase initialized successfully with real configuration.");
  } catch (error) {
    console.warn("Failed to initialize Firebase with current configuration. Falling back to secure local state.", error);
    isFirebaseActive = false;
  }
} else {
  console.log("Using Mock Firebase config. Application is falling back to Secure Local State mode.");
}

export { db, auth, isFirebaseActive };

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Secure Rule Failure Triggered: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
