'use server';

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { collection, addDoc } from "firebase/firestore";


let app: App;

async function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  // FIREBASE_CONFIG is an env variable automatically set by App Hosting.
  // It's a JSON string, so we need to parse it.
  const firebaseConfig = process.env.FIREBASE_CONFIG
    ? JSON.parse(process.env.FIREBASE_CONFIG)
    : undefined;
    
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;


  if (firebaseConfig && serviceAccount) {
     app = initializeApp({
       credential: cert(serviceAccount),
       projectId: firebaseConfig.projectId,
     });
  } else {
    // This is for local development, where FIREBASE_CONFIG might not be set.
    // You'd need to have your service account key file available.
    console.warn("Firebase Admin credentials not found in environment variables. Using fallback.");
    app = initializeApp();
  }

  return app;
}

export async function getFirebaseAdmin() {
  const app = await getFirebaseAdminApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  return { app, auth, firestore, collection, addDoc };
}
