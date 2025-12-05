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

export default function Transactions() {
  const auth = getAuth();
  const { user } = useUser(); 

  // -------------------- FORM STATE --------------------
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState("one-time");
  const [message, setMessage] = useState("");

  const expenseCategories = ["Food", "Transportation", "Entertainment", "Rent", "Utilities", "Other"];
  const incomeCategories = ["Salary", "Freelance", "Investments", "Other"];

  const [transactions, setTransactions] = useState([]);

  // -------------------- FILTER STATE --------------------
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // -------------------- LOAD TRANSACTIONS --------------------
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "users", auth.currentUser.uid, "transactions"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [auth.currentUser]);

  if (user === undefined) return <p>Loading...</p>;
  if (!user) return null;

  // -------------------- ADD TRANSACTION --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const current = auth.currentUser;
    if (!current) return;

    try {
      await addDoc(collection(db, "users", current.uid, "transactions"), {
        type,
        category,
        amount: parseFloat(amount),
        date,
        note,
        frequency: type === "income" ? frequency : "one-time",
        createdAt: new Date(),
      });

      setMessage("Transaction added!");
      setAmount("");
      setDate("");
      setNote("");
      setFrequency("one-time");
    } catch (error) {
      setMessage("Failed to add transaction.");
    }
  };

  // -------------------- DELETE --------------------
  const deleteTransaction = async (id) => {
    const current = auth.currentUser;
    if (!current) return;
    try {
      await deleteDoc(doc(db, "users", current.uid, "transactions", id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  // -------------------- FILTER LOGIC --------------------
  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;

    if (searchKeyword.trim() !== "") {
      const text = `${t.note} ${t.category}`.toLowerCase();
      if (!text.includes(searchKeyword.toLowerCase())) return false;
    }

    if (filterStartDate && new Date(t.date) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(t.date) > new Date(filterEndDate)) return false;

    return true;
  });

  // -------------------- UI --------------------
  const cardStyle = {
    background: "white",
    padding: "1.5rem",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    marginBottom: "2rem",
  };

  const inputStyle = {
    padding: "0.5rem",
    width: "100%",
    maxWidth: "250px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem",
  };

  const labelStyle = { fontWeight: "bold", display: "block", marginBottom: "0.3rem" };

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

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>Transactions</h1>

      {message && <p><strong>{message}</strong></p>}

      {/* ---------------- FORM ---------------- */}
      <div style={cardStyle}>
        <h2>Add Transaction</h2>

        <form onSubmit={handleSubmit}>
          {/* TYPE */}
          <label style={labelStyle}>Type:</label>
          <select
            style={inputStyle}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCategory("");
            }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <br /><br />

          {/* CATEGORY */}
          <label style={labelStyle}>Category:</label>
          <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
            {(type === "expense" ? expenseCategories : incomeCategories).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <br /><br />

          {/* INCOME FREQUENCY */}
          {type === "income" && (
            <>
              <label style={labelStyle}>Income Frequency:</label>
              <select
                style={inputStyle}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="one-time">One-Time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              <br /><br />
            </>
          )}

          {/* AMOUNT */}
          <label style={labelStyle}>Amount ($):</label>
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <br /><br />

          {/* DATE */}
          <label style={labelStyle}>Date:</label>
          <input
            style={inputStyle}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <br /><br />

          {/* NOTE */}
          <label style={labelStyle}>Note:</label>
          <input
            style={inputStyle}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />

          <button type="submit" style={buttonStyle}>Add Transaction</button>
        </form>
      </div>

      {/* ---------------- FILTERS ---------------- */}
      <div style={cardStyle}>
        <h2>Filters</h2>

        <label style={labelStyle}>Type:</label>
        <select style={inputStyle} value={filterType} onChange={(e) => {
          setFilterType(e.target.value);
          setFilterCategory("all");
        }}>
          <option value="all">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <br /><br />

        <label style={labelStyle}>Category:</label>
        <select
          style={inputStyle}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All</option>
          {(filterType === "expense" ? expenseCategories : incomeCategories).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <br /><br />

        <label style={labelStyle}>Keyword:</label>
        <input
          style={inputStyle}
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Search..."
        />

        <br /><br />

        <label style={labelStyle}>Start Date:</label>
        <input
          style={inputStyle}
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
        />

        <br /><br />

        <label style={labelStyle}>End Date:</label>
        <input
          style={inputStyle}
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
        />

        <br /><br />

        <button
          style={{ ...buttonStyle, background: "#999" }}
          onClick={() => {
            setFilterType("all");
            setFilterCategory("all");
            setSearchKeyword("");
            setFilterStartDate("");
            setFilterEndDate("");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div style={cardStyle}>
        <h2>Filtered Transactions</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
          }}
        >
          <thead>
            <tr style={{ background: "#f4f4f4", borderBottom: "2px solid #ddd" }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Freq</th>
              <th style={thStyle}>Note</th>
              <th style={thStyle}>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{t.date}</td>
                <td style={tdStyle}>{t.type}</td>
                <td style={tdStyle}>{t.category}</td>
                <td style={tdStyle}>${t.amount}</td>
                <td style={tdStyle}>{t.frequency || "one-time"}</td>
                <td style={tdStyle}>{t.note}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
