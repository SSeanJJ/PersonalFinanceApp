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

  const logout = async () => {
    await auth.signOut();
    removeUserCookie();
    setUser(null);
    router.push("/auth");
  };

  useEffect(() => {
    // Listen for Firebase login/logout
    const unsubscribe = auth.onIdTokenChanged((firebaseUser) => {
      if (firebaseUser) {
        const userData = mapUserData(firebaseUser);
        setUserCookie(userData); // valid object saved
        setUser(userData);
      } else {
        removeUserCookie();
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Redirect ONLY after:
  // 1. We know user is null
  // 2. We are NOT currently on /auth
  useEffect(() => {
    if (user === null && router.pathname !== "/auth") {
      router.push("/auth");
    }
  }, [user, router.pathname]);

  return { user, logout };
};

export { useUser };
