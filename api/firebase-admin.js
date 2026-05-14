import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(decoded);
    serviceAccount.private_key = serviceAccount.private_key?.replace(/\\n/g, "\n");
    return serviceAccount;
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    serviceAccount.private_key = serviceAccount.private_key?.replace(/\\n/g, "\n");
    return serviceAccount;
  }

  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_BASE64");
}

export function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(getServiceAccount())
    });
  }

  return getFirestore();
}

export { FieldValue };
