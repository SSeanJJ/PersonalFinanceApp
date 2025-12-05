/* import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { initFirebase } from "@/lib/firebase/initFirebase";
import { useUser } from "@/lib/firebase/useUser";

initFirebase();
const db = getFirestore();

export default function Settings() {
  const auth = getAuth();
  const { user } = useUser();   // 🔒 AUTH CHECK FIRST

  // ---------------------------------------
  // ALL HOOKS MUST BE DECLARED BEFORE ANY RETURN
  // ---------------------------------------

  const [currency, setCurrency] = useState("USD");
  const [message, setMessage] = useState("");

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const ref = doc(db, "users", currentUser.uid, "settings", "preferences");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        if (data.currency) setCurrency(data.currency);
      }
    };

    loadSettings();
  }, [auth.currentUser]);

  // ---------------------------------------
  // PAGE PROTECTION (AFTER ALL HOOKS)
  // ---------------------------------------
  if (user === undefined) return <p>Loading...</p>;
  if (!user) return null; // redirect handled by useUser()

  // ---------------------------------------
  // Save currency preference
  // ---------------------------------------
  const handleSave = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setMessage("You must be logged in to save settings.");
      return;
    }

    try {
      const ref = doc(db, "users", currentUser.uid, "settings", "preferences");
      await setDoc(ref, { currency }, { merge: true });

      setMessage("Preferences saved successfully!");
      
      setTimeout(() => setMessage(""), 3000);

    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Failed to save preferences.");
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Settings</h1>
      <p>Manage your account and financial preferences.</p>

      {message && <p><strong>{message}</strong></p>}

      <h2>Financial Preferences</h2>

      <label>
        Preferred Currency:
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{ marginLeft: "1rem" }}
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </label>

      <br /><br />

      <button onClick={handleSave}>Save Preferences</button>
    </main>
  );
} */
