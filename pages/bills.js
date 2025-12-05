import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/firebase/initFirebase";
import { useUser } from "@/lib/firebase/useUser";

initFirebase();
const db = getFirestore();

export default function Bills() {
  const auth = getAuth();
  const { user } = useUser();

  // ---------------- FORM STATE ----------------
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");

  const [bills, setBills] = useState([]);

  // ---------------- LOAD BILLS ----------------
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, "users", auth.currentUser.uid, "bills"));
    return onSnapshot(q, (snapshot) => {
      setBills(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [auth.currentUser]);

  if (user === undefined) return <p>Loading...</p>;
  if (!user) return null;

  // ---------------- ADD BILL ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "bills"), {
        name,
        amount: parseFloat(amount),
        dueDate,
        createdAt: new Date(),
      });

      setMessage("Bill added!");
      setName("");
      setAmount("");
      setDueDate("");
    } catch (err) {
      setMessage("Failed to add bill.");
    }
  };

  // ---------------- DELETE BILL ----------------
  const deleteBill = async (id) => {
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "bills", id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  // ---------------- REMINDER LOGIC ----------------
  const getReminderStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Overdue", color: "red", days: diffDays };
    if (diffDays === 0) return { label: "Due Today", color: "orange", days: diffDays };
    if (diffDays <= 3) return { label: `Due in ${diffDays} day(s)`, color: "orange", days: diffDays };
    return { label: `Due in ${diffDays} day(s)`, color: "green", days: diffDays };
  };

  const reminders = bills
    .map((bill) => ({
      ...bill,
      status: getReminderStatus(bill.dueDate),
    }))
    .sort((a, b) => a.status.days - b.status.days);

  // ---------------- STYLES ----------------
  const card = {
    background: "white",
    padding: "1.5rem",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    marginBottom: "2rem"
  };

  const label = {
    fontWeight: "bold",
    display: "block",
    marginBottom: "0.3rem"
  };

  const input = {
    padding: "0.5rem",
    width: "100%",
    maxWidth: "250px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem"
  };

  const button = {
    background: "#4A90E2",
    color: "white",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "1rem"
  };

  const th = {
    padding: "0.75rem",
    textAlign: "left",
    fontWeight: "bold",
    background: "#f4f4f4",
    borderBottom: "2px solid #ddd"
  };

  const td = {
    padding: "0.75rem",
    borderBottom: "1px solid #eee"
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>Bills</h1>
      <p style={{ marginBottom: "1.5rem" }}>Manage your recurring bills with reminders.</p>

      {message && <p><strong>{message}</strong></p>}

      {/* ---------------- REMINDERS PANEL ---------------- */}
      <div style={card}>
        <h2>Upcoming Bill Reminders</h2>

        {reminders.length === 0 ? (
          <p>No bills yet.</p>
        ) : (
          reminders.map((b) => (
            <p key={b.id} style={{ fontWeight: "bold", color: b.status.color }}>
              {b.name}: {b.status.label}
            </p>
          ))
        )}
      </div>

      {/* ---------------- FORM ---------------- */}
      <div style={card}>
        <h2>Add Bill</h2>

        <form onSubmit={handleSubmit}>
          <label style={label}>Bill Name:</label>
          <input
            style={input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <br /><br />

          <label style={label}>Amount ($):</label>
          <input
            style={input}
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <br /><br />

          <label style={label}>Due Date:</label>
          <input
            style={input}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          <br />
          <button style={button} type="submit">Add Bill</button>
        </form>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div style={card}>
        <h2>Your Bills</h2>

        {bills.length === 0 ? (
          <p>No bills added yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Amount</th>
                <th style={th}>Due Date</th>
                <th style={th}>Reminder</th>
                <th style={th}>Delete</th>
              </tr>
            </thead>

            <tbody>
              {reminders.map((b) => (
                <tr key={b.id}>
                  <td style={td}>{b.name}</td>
                  <td style={td}>${b.amount.toFixed(2)}</td>
                  <td style={td}>{b.dueDate}</td>
                  <td style={{ ...td, color: b.status.color }}>
                    {b.status.label}
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => deleteBill(b.id)}
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
