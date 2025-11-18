import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";

export function initFirebase() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
}
