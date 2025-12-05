import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/firebase/initFirebase";
import { useUser } from "@/lib/firebase/useUser";

initFirebase();
const db = getFirestore();

export default function NetWorth() {
  const auth = getAuth();
  const { user } = useUser();

  // ------------------------
  // Form State
  // ------------------------
  const [type, setType] = useState("asset");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // ------------------------
  // Stored Data
  // ------------------------
  const [items, setItems] = useState([]);

  // ------------------------
  // Load Net Worth Items
  // ------------------------
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = collection(db, "users", auth.currentUser.uid, "networth");

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  if (user === undefined) return <p>Loading...</p>;
  if (!user) return null;

  // ------------------------
  // Add Entry
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "networth"), {
        type,
        name,
        amount: parseFloat(amount),
        createdAt: new Date(),
      });

      setMessage("Entry added!");
      setName("");
      setAmount("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to add entry.");
    }
  };

  // ------------------------
  // Delete Entry
  // ------------------------
  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "networth", id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete entry.");
    }
  };

  // ------------------------
  // Summary Calculations
  // ------------------------
  const totalAssets = items
    .filter((i) => i.type === "asset")
    .reduce((s, i) => s + i.amount, 0);

  const totalDebts = items
    .filter((i) => i.type === "debt")
    .reduce((s, i) => s + i.amount, 0);

  const netWorth = totalAssets - totalDebts;

  const assetPercent =
    totalAssets + totalDebts === 0
      ? 0
      : (totalAssets / (totalAssets + totalDebts)) * 100;

  const debtPercent =
    totalAssets + totalDebts === 0
      ? 0
      : (totalDebts / (totalAssets + totalDebts)) * 100;

  // ------------------------
  // UI Helpers / Styles
  // ------------------------
  const card = {
    background: "#fafafa",
    border: "1px solid #ddd",
    padding: "1.25rem",
    marginBottom: "2rem",
    borderRadius: "6px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
  };

  const thtd = {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "left",
  };

  const ProgressBar = ({ percent, color }) => (
    <div
      style={{
        width: "260px",
        background: "#ddd",
        height: "12px",
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          width: `${Math.min(percent, 100)}%`,
          height: "12px",
          background: color,
          borderRadius: "4px",
        }}
      ></div>
    </div>
  );

  // ------------------------
  // Render Page
  // ------------------------
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Net Worth Tracker</h1>
      <p>Track your assets, debts, and overall financial health.</p>

      {message && <p><strong>{message}</strong></p>}

      {/* ------------------ FORM CARD ------------------ */}
      <div style={card}>
        <h2>Add Asset or Debt</h2>

        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          <label>
            Type:
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="asset">Asset</option>
              <option value="debt">Debt</option>
            </select>
          </label>

          <br /><br />

          <label>
            Name:
            <input
              type="text"
              value={name}
              placeholder="e.g., Savings, Car Loan"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <br /><br />

          <label>
            Amount ($):
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>

          <br /><br />

          <button type="submit">Add Entry</button>
        </form>
      </div>

      {/* ------------------ SUMMARY CARD ------------------ */}
      <div style={card}>
        <h2>Summary</h2>

        <p><strong>Total Assets:</strong> ${totalAssets.toFixed(2)}</p>
        <p><strong>Total Debts:</strong> ${totalDebts.toFixed(2)}</p>

        <p style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>
          <strong>Net Worth:</strong> ${netWorth.toFixed(2)}
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <h3>Asset / Debt Ratio</h3>

          <p>Assets: {assetPercent.toFixed(1)}%</p>
          <ProgressBar percent={assetPercent} color="#4CAF50" />

          <br />

          <p>Debts: {debtPercent.toFixed(1)}%</p>
          <ProgressBar percent={debtPercent} color="#E53935" />
        </div>
      </div>

      {/* ------------------ TABLE CARD ------------------ */}
      <div style={card}>
        <h2>Your Entries</h2>

        {items.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thtd}>Type</th>
                <th style={thtd}>Name</th>
                <th style={thtd}>Amount</th>
                <th style={thtd}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td style={thtd}>{i.type}</td>
                  <td style={thtd}>{i.name}</td>
                  <td style={thtd}>${i.amount.toFixed(2)}</td>
                  <td style={thtd}>
                    <button style={{ color: "red" }} onClick={() => deleteItem(i.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ------------------ FUTURE FEATURE CARD ------------------ */}
      <div style={card}>
        <h2>Net Worth Over Time</h2>
        <p>Graph coming soon that will display your net worth trend!</p>
      </div>
    </main>
  );
}
