import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initFirebase } from "@/lib/firebase/initFirebase";
import { getAuth } from "firebase/auth";
import {
  removeUserCookie,
  setUserCookie,
  getUserFromCookie,
} from "@/lib/firebase/userCookies";
import { mapUserData } from "@/lib/firebase/mapUserData";

// Initialize Firebase
initFirebase();

const useUser = () => {
  const [user, setUser] = useState(undefined); // undefined = loading
  const router = useRouter();
  const auth = getAuth();

  // ---------------------------
  // LOGOUT (fixed)
  // ---------------------------
  const logout = async () => {
    await auth.signOut();
    removeUserCookie();
    setUser(null);
    // ❗ Do NOT router.push() here
    // The redirect hook below will handle it automatically
  };

  // ---------------------------
  // Listen for Firebase login/logout
  // ---------------------------
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged((firebaseUser) => {
      if (firebaseUser) {
        const userData = mapUserData(firebaseUser);
        setUserCookie(userData);
        setUser(userData);
      } else {
        removeUserCookie();
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ---------------------------
  // Pages that DO NOT require auth
  // ---------------------------
  const publicPaths = ["/", "/auth"];

  // ---------------------------
  // Redirect when logged out
  // ---------------------------
  useEffect(() => {
    if (user === null && !publicPaths.includes(router.pathname)) {
      router.push("/auth");
    }
  }, [user, router.pathname]);

  return { user, logout };
};

export { useUser };
