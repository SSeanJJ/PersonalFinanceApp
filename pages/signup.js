import { useState } from "react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { initFirebase } from "@/lib/firebase/initFirebase";

initFirebase();
const auth = getAuth();
const db = getFirestore();

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate match
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      // Create user
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Save user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        createdAt: new Date(),
      });

      setIsError(false);
      setMessage("Account created! You may log in now.");

      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("Signup error:", error);
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "380px",
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Create Account
        </h1>
        <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Fill out the form below to get started.
        </p>

        {/* MESSAGE */}
        {message && (
          <p
            style={{
              padding: "0.6rem",
              borderRadius: "6px",
              textAlign: "center",
              fontWeight: "bold",
              background: isError ? "#ffe5e5" : "#e7ffe8",
              color: isError ? "#b30000" : "#1e7e34",
              marginBottom: "1rem",
            }}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSignup}>
          {/* FULL NAME */}
          <label style={{ fontWeight: "bold" }}>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              margin: "0.3rem 0 1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          {/* EMAIL */}
          <label style={{ fontWeight: "bold" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              margin: "0.3rem 0 1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          {/* PASSWORD */}
          <label style={{ fontWeight: "bold" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              margin: "0.3rem 0 1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          {/* CONFIRM PASSWORD */}
          <label style={{ fontWeight: "bold" }}>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              margin: "0.3rem 0 1.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "#4A90E2",
              color: "white",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Create Account
          </button>
        </form>

        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/auth" style={{ color: "#4A90E2", fontWeight: "bold" }}>
            Login here
          </a>
        </p>
      </div>
    </main>
  );
}
