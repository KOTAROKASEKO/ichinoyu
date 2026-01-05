import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDUOh1zXg48NfR9GSIw_ZxkkDuWDFtZ5s",
  authDomain: "ichinoyu.firebaseapp.com",
  projectId: "ichinoyu",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
