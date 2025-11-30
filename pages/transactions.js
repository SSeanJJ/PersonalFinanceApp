import { useState, useEffect } from "react";
import { addDoc, collection, getFirestore, onSnapshot, query, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/firebase/initFirebase";

initFirebase();
const db = getFirestore();

export default function Transactions() {
  const auth = getAuth();

  // Form state
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  // Transaction list state
  const [transactions, setTransactions] = useState([]);

  // Submit a new transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in to add transactions.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        type,
        category,
        amount: parseFloat(amount),
        date,
        note,
        createdAt: new Date(),
      });

      setMessage("Transaction added successfully!");
      setAmount("");
      setDate("");
      setNote("");

    } catch (error) {
      console.error("Error adding transaction:", error);
      setMessage("Failed to add transaction.");
    }
  };

  // Fetch transactions in real time
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(items);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Transactions</h1>
      <p>Add your income or expenses below.</p>

      {message && <p><strong>{message}</strong></p>}

      {/* Transaction Form */}
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        
        <label>
          Type:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <br/><br/>

        <label>
          Category:
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <br/><br/>

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
        <br/><br/>

        <label>
          Date:
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <br/><br/>

        <label>
          Note:
          <input 
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </label>
        <br/><br/>

        <button type="submit">Add Transaction</button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      {/* Transaction Table */}
      <h2>Your Transactions</h2>

      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td>${t.amount}</td>
                <td>{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
