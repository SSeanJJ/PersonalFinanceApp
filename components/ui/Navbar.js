import { useUser } from "@/lib/firebase/useUser";

export default function Navbar() {
  const { user, logout } = useUser();

  // Hide navbar if no user is logged in
  if (!user) return null;

  return (
    <nav
      style={{
        width: "100%",
        background: "#ffffff",
        borderBottom: "1px solid #e0e0e0",
        padding: "0.75rem 2rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        fontFamily: "Arial, sans-serif",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Navigation Links */}
      <a href="/transactions" style={linkStyle}>Transactions</a>
      <a href="/budgets" style={linkStyle}>Budgets</a>
      <a href="/bills" style={linkStyle}>Bills</a>
      <a href="/goals" style={linkStyle}>Goals</a>
      <a href="/reports" style={linkStyle}>Reports</a>
      <a href="/networth" style={linkStyle}>Net Worth</a>
     

      {/* Spacer pushes logout button right */}
      <div style={{ flexGrow: 1 }}></div>

      {/* Logout Button */}
      <button
        onClick={logout}
        style={{
          background: "#4A90E2",
          color: "white",
          border: "none",
          padding: "0.55rem 1.2rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "0.95rem",
        }}
      >
        Logout
      </button>
    </nav>
  );
}

// Reusable link style
const linkStyle = {
  textDecoration: "none",
  color: "#333",
  fontWeight: "bold",
  fontSize: "0.95rem",
  padding: "0.4rem 0.6rem",
  borderRadius: "5px",
  transition: "0.2s",
};
