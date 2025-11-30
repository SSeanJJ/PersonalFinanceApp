import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  query
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/firebase/initFirebase";

initFirebase();
const db = getFirestore();

export default function Bills() {
  const auth = getAuth();

  // Form State
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");

  // Bills list state
  const [bills, setBills] = useState([]);

  // Add a bill
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in to add bills.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "bills"), {
        name,
        amount: parseFloat(amount),
        dueDate,
        createdAt: new Date(),
      });

      setMessage("Bill added successfully!");
      setName("");
      setAmount("");
      setDueDate("");

    } catch (error) {
      console.error("Error adding bill:", error);
      setMessage("Failed to add bill.");
    }
  };

  // Fetch bills in real time
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "bills"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBills(items);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Bills</h1>
      <p>Add your recurring bills below.</p>

      {message && <p><strong>{message}</strong></p>}

      {/* Bill Form */}
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        
        <label>
          Bill Name:
          <input 
            type="text"
            value={name}
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

        <label>
          Due Date:
          <input 
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </label>
        <br /><br />

        <button type="submit">Add Bill</button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      {/* Bills Table */}
      <h2>Your Bills</h2>

      {bills.length === 0 ? (
        <p>No bills added yet.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Bill Name</th>
              <th>Amount</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>${b.amount}</td>
                <td>{b.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
