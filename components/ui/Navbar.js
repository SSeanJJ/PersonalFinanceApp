import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{
      display: "flex",
      gap: "1rem",
      padding: "1rem",
      background: "#111",
      color: "white",
      alignItems: "center"
    }}>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/transactions">Transactions</Link>
      <Link href="/budgets">Budget</Link>
      <Link href="/bills">Bills</Link>
      <Link href="/goals">Goals</Link>
      <Link href="/reports">Reports</Link>
      <Link href="/settings">Settings</Link>
      <Link href="/auth" style={{ marginLeft: "auto" }}>Login</Link>
    </nav>
  );
}
