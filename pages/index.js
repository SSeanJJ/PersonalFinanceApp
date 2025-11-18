import { useUser } from '@/lib/firebase/useUser'

export default function Home() {
  const { user, logout } = useUser()

  // --------------------------
  // If user is logged in
  // --------------------------
  if (user) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Welcome, {user.name}</h1>
        <p>{user.email}</p>

        <hr />

        <h2>Menu</h2>
        <ul style={{ listStyle: "none", padding: 0, fontSize: "18px", lineHeight: "2rem" }}>
          <li><a href="/dashboard">📊 Dashboard</a></li>
          <li><a href="/income">💰 Income</a></li>
          <li><a href="/expenses">💸 Expenses</a></li>
          <li><a href="/budgets">📆 Budgets</a></li>
          <li><a href="/goals">🎯 Goals</a></li>
          <li><a href="/bills">🧾 Bills & Reminders</a></li>
          <li><a href="/reports">📈 Reports</a></li>
          <li><a href="/settings">⚙️ Settings</a></li>
        </ul>

        <hr />

        <button
          onClick={logout}
          style={{
            background: "red",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Log Out
        </button>
      </div>
    )
  }

  // --------------------------
  // If user is NOT logged in
  // --------------------------
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to the Personal Finance App</h1>
      <p>Please log in to continue.</p>
      <a href="/auth" style={{ fontSize: "20px", color: "blue" }}>Log In</a>
    </div>
  )
}
