import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDUOh1zXg48NfR9GSIw_ZxkkDuWDFtZ5s",
  authDomain: "ichinoyu.firebaseapp.com",
  projectId: "ichinoyu",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
