import { useUser } from "@/lib/firebase/useUser";

export default function Home() {
  const { user, logout } = useUser();

  const cardStyle = {
    maxWidth: "450px",
    margin: "80px auto",
    padding: "30px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  };

  const buttonStyle = {
    background: "#4A90E2",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  };

  const logoutButton = {
    background: "#E53935",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginTop: "20px",
  };

  // --------------------------
  // If user is logged in
  // --------------------------
  if (user) {
    return (
      <main style={cardStyle}>
        <h1 style={{ marginBottom: "5px" }}>Welcome, User</h1>
        <p style={{ color: "#555", marginTop: "0" }}>{user.email}</p>

        <hr style={{ margin: "20px 0" }} />

        <h2 style={{ marginBottom: "15px" }}>Menu</h2>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            fontSize: "18px",
            lineHeight: "2.2rem",
            textAlign: "left",
          }}
        >
          <li><a href="/transactions">💸 Transactions</a></li>
          <li><a href="/budgets">📆 Budgets</a></li>
          <li><a href="/bills">🧾 Bills & Reminders</a></li>
          <li><a href="/goals">🎯 Savings Goals</a></li>
          <li><a href="/networth">💰 Net Worth</a></li>
          <li><a href="/reports">📈 Reports</a></li>
        </ul>

        <button onClick={logout} style={logoutButton}>
          Log Out
        </button>
      </main>
    );
  }

  // --------------------------
  // If user is NOT logged in
  // --------------------------
  return (
    <main style={cardStyle}>
      <h1 style={{ marginBottom: "10px" }}>Welcome to Your Finance App</h1>
      <p style={{ color: "#555" }}>Track spending, bills, budgets, goals, and more.</p>

      <a href="/auth" style={{ textDecoration: "none" }}>
        <button style={{ ...buttonStyle, marginTop: "20px" }}>Log In</button>
      </a>

      <p style={{ marginTop: "15px", color: "#777" }}>
        Don’t have an account? <a href="/signup">Create one</a>
      </p>
    </main>
  );
}
