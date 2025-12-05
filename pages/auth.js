import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initFirebase } from "@/lib/firebase/initFirebase";

initFirebase();
const auth = getAuth();

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsError(false);
      setMessage("Login successful! Redirecting...");
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      setIsError(true);
      setMessage("Invalid email or password.");
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
          width: "350px",
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Login</h1>

        {/* Message */}
        {message && (
          <p
            style={{
              padding: "0.5rem",
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

        {/* Form */}
        <form onSubmit={handleLogin}>
          <label style={{ fontWeight: "bold" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              marginBottom: "1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />

          <label style={{ fontWeight: "bold" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              marginBottom: "1.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "#4A90E2",
              color: "white",
              fontWeight: "bold",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        <p style={{ marginTop: "1.2rem", textAlign: "center" }}>
          Don’t have an account?{" "}
          <a href="/signup" style={{ color: "#4A90E2" }}>
            Create Account
          </a>
        </p>

        <p style={{ marginTop: "0.8rem", textAlign: "center" }}>
          <a href="/" style={{ color: "#4A90E2" }}>
            Back to Home
          </a>
        </p>
      </div>
    </main>
  );
}
