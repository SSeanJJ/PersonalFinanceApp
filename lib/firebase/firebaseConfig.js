import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBoaPfklrAO6DWLKMW1cQuWHj98pyQ5ZDs",
  authDomain: "sei-project-fall2025-f9469.firebaseapp.com",
  projectId: "sei-project-fall2025-f9469",
  storageBucket: "sei-project-fall2025-f9469.appspot.com",
  messagingSenderId: "842002279517",
  appId: "1:842002279517:web:06662131d6094c6da9b1b4",
  measurementId: "G-V0W590GDNB"
};

// Initialize Firebase ONCE
export const app = initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
