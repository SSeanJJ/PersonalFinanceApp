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

export default function Budgets() {
  const auth = getAuth();

  // Form state
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // Budget list state
  const [budgets, setBudgets] = useState([]);

  // Add a new budget
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in to add budgets.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "budgets"), {
        category,
        amount: parseFloat(amount),
        createdAt: new Date(),
      });

      setMessage("Budget added successfully!");
      setAmount("");

    } catch (error) {
      console.error("Error adding budget:", error);
      setMessage("Failed to add budget.");
    }
  };

  // Fetch budgets in real time
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "budgets"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBudgets(items);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Budgets</h1>
      <p>Set your monthly budget for each category.</p>

      {message && <p><strong>{message}</strong></p>}

      {/* Budget Form */}
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        
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
        <br /><br />

        <label>
          Monthly Budget ($):
          <input 
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <br /><br />

        <button type="submit">Add Budget</button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      {/* Budget Table */}
      <h2>Your Budgets</h2>

      {budgets.length === 0 ? (
        <p>No budgets added yet.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Category</th>
              <th>Budget Amount</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => (
              <tr key={b.id}>
                <td>{b.category}</td>
                <td>${b.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
