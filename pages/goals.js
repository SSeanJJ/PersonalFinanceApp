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

export default function Goals() {
  const auth = getAuth();

  // Form state
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [message, setMessage] = useState("");

  // Goals list state
  const [goals, setGoals] = useState([]);

  // Add new goal
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in to add goals.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "goals"), {
        name: goalName,
        targetAmount: parseFloat(targetAmount),
        createdAt: new Date(),
      });

      setMessage("Goal added successfully!");
      setGoalName("");
      setTargetAmount("");

    } catch (error) {
      console.error("Error adding goal:", error);
      setMessage("Failed to add goal.");
    }
  };

  // Fetch goals in real time
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "goals"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(items);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Savings Goals</h1>
      <p>Create and track your savings goals.</p>

      {message && <p><strong>{message}</strong></p>}

      {/* Goal Form */}
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        
        <label>
          Goal Name:
          <input 
            type="text"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            required
          />
        </label>
        <br /><br />

        <label>
          Target Amount ($):
          <input 
            type="number"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </label>
        <br /><br />

        <button type="submit">Add Goal</button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      {/* Goals Table */}
      <h2>Your Goals</h2>

      {goals.length === 0 ? (
        <p>No goals added yet.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Goal Name</th>
              <th>Target Amount</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g.id}>
                <td>{g.name}</td>
                <td>${g.targetAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
