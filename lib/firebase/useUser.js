import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initFirebase } from "@/lib/firebase/initFirebase";
import { getAuth } from "firebase/auth";
import {
  removeUserCookie,
  setUserCookie,
} from "@/lib/firebase/userCookies";
import { mapUserData } from "@/lib/firebase/mapUserData";

// Initialize Firebase
initFirebase();

const useUser = () => {
  const [user, setUser] = useState(undefined); // undefined = loading
  const router = useRouter();
  const auth = getAuth();

  // ---------------------------
  // LOGOUT
  // ---------------------------
  const logout = async () => {
    await auth.signOut();
    removeUserCookie();
    setUser(null);
    // ❗ No router.push here — redirect is handled below automatically
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
  // Pages that do NOT require auth
  // ---------------------------
  const publicPaths = ["/", "/auth", "/signup"];

  // ---------------------------
  // Redirect when unauthorized
  // ---------------------------
  useEffect(() => {
    // user === undefined → still loading → no redirect yet
    if (user === undefined) return;

    const isPublic = publicPaths.includes(router.pathname);

    if (user === null && !isPublic) {
      router.push("/auth");
    }
  }, [user, router.pathname]);

  return { user, logout };
};

export { useUser };
