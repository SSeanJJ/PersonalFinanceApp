import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/firebase/initFirebase";
import { useUser } from "@/lib/firebase/useUser";

initFirebase();
const db = getFirestore();

export default function Budgets() {
  const auth = getAuth();
  const { user } = useUser();

  // ---------------- FORM STATE ----------------
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [budgetType, setBudgetType] = useState("monthly");
  const [message, setMessage] = useState("");

  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // ---------------- LOAD BUDGETS ----------------
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(collection(db, "users", currentUser.uid, "budgets"));
    return onSnapshot(q, (snapshot) => {
      setBudgets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [auth.currentUser]);

  // ---------------- LOAD TRANSACTIONS ----------------
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(db, "users", currentUser.uid, "transactions"),
      orderBy("date", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [auth.currentUser]);

  if (user === undefined) return <p>Loading...</p>;
  if (!user) return null;

  // ---------------- ADD BUDGET ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "budgets"), {
        category,
        amount: parseFloat(amount),
        type: budgetType,
        createdAt: new Date(),
      });

      setMessage("Budget added!");
      setAmount("");
    } catch (error) {
      setMessage("Failed to add budget.");
    }
  };

  // ---------------- DELETE ----------------
  const deleteBudget = async (id) => {
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "budgets", id));
    } catch (error) {
      alert("Failed to delete budget.");
    }
  };

  // ---------------- CALCULATIONS ----------------
  const getWeeklySpending = (cat) => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    return transactions
      .filter((t) => t.category === cat && t.type === "expense")
      .filter((t) => new Date(t.date) >= monday)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlySpending = (cat) => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return transactions
      .filter((t) => t.category === cat && t.type === "expense")
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getStatusInfo = (percent) => {
    if (!isFinite(percent) || percent < 0)
      return { text: "No data", color: "black" };
    if (percent >= 100)
      return { text: "Over budget!", color: "red" };
    if (percent >= 80)
      return { text: "Nearing limit", color: "orange" };
    return { text: "On track", color: "green" };
  };

  const ProgressBar = ({ percent }) => (
    <div style={{ width: "160px", background: "#e6e6e6", height: "10px", borderRadius: "6px" }}>
      <div
        style={{
          width: `${Math.min(Math.max(percent, 0), 100)}%`,
          height: "10px",
          background: "#4A90E2",
          borderRadius: "6px"
        }}
      ></div>
    </div>
  );

  // ---------------- STYLES ----------------
  const cardStyle = {
    background: "white",
    padding: "1.5rem",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    marginBottom: "2rem",
  };

  const labelStyle = { fontWeight: "bold", display: "block", marginBottom: "0.3rem" };

  const inputStyle = {
    padding: "0.5rem",
    width: "100%",
    maxWidth: "250px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem",
  };

  const buttonStyle = {
    background: "#4A90E2",
    color: "white",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "1rem",
  };

  // ---------------- PAGE ----------------
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Budgets</h1>

      {message && <p><strong>{message}</strong></p>}

      {/* ---------------- ADD BUDGET ---------------- */}
      <div style={cardStyle}>
        <h2>Add Budget</h2>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Category:</label>
          <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>

          <br /><br />

          <label style={labelStyle}>Budget Type:</label>
          <select style={inputStyle} value={budgetType} onChange={(e) => setBudgetType(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>

          <br /><br />

          <label style={labelStyle}>Amount ($):</label>
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <br />

          <button type="submit" style={buttonStyle}>Add Budget</button>
        </form>
      </div>

      {/* ---------------- BUDGET LIST ---------------- */}
      <div style={cardStyle}>
        <h2>Your Budgets</h2>

        {budgets.length === 0 ? (
          <p>No budgets added yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f4f4f4", borderBottom: "2px solid #ddd" }}>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Budget</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Progress</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Delete</th>
              </tr>
            </thead>

            <tbody>
              {budgets.map((b) => {
                const spent = b.type === "weekly"
                  ? getWeeklySpending(b.category)
                  : getMonthlySpending(b.category);

                const percent = (spent / b.amount) * 100;
                const { text, color } = getStatusInfo(percent);

                return (
                  <tr key={b.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdStyle}>{b.category}</td>
                    <td style={tdStyle}>${b.amount.toFixed(2)}</td>
                    <td style={tdStyle}>{b.type}</td>
                    <td style={tdStyle}>
                      <ProgressBar percent={percent} />
                      <small>{isFinite(percent) ? `${percent.toFixed(1)}%` : "-"}</small>
                    </td>
                    <td style={{ ...tdStyle, color }}>{text}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => deleteBudget(b.id)}
                        style={{
                          background: "red",
                          color: "white",
                          border: "none",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        X
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  fontWeight: "bold",
  color: "#333",
};

const tdStyle = {
  padding: "0.75rem",
  color: "#444",
};
