import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/firebase/initFirebase";
import { useUser } from "@/lib/firebase/useUser";

initFirebase();
const db = getFirestore();

export default function Goals() {
  const auth = getAuth();
  const { user } = useUser();

  // -------------------------
  // Form State
  // -------------------------
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [message, setMessage] = useState("");

  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = collection(db, "users", auth.currentUser.uid, "goals");

    return onSnapshot(q, (snapshot) => {
      setGoals(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          currentAmount: doc.data().currentAmount || 0,
        }))
      );
    });
  }, [auth.currentUser]);

  if (user === undefined) return <p>Loading...</p>;
  if (!user) return null;

  // -------------------------
  // Add Goal
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const curr = auth.currentUser;
    if (!curr) return;

    try {
      await addDoc(collection(db, "users", curr.uid, "goals"), {
        name: goalName,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        createdAt: new Date(),
      });

      setMessage("Goal added!");
      setGoalName("");
      setTargetAmount("");
    } catch (error) {
      setMessage("Failed to add goal.");
    }
  };

  // -------------------------
  // Add contribution
  // -------------------------
  const addContribution = async (goal, amountToAdd) => {
    const curr = auth.currentUser;
    if (!curr) return;

    const newAmount = goal.currentAmount + parseFloat(amountToAdd);

    try {
      await updateDoc(doc(db, "users", curr.uid, "goals", goal.id), {
        currentAmount: newAmount,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // Delete goal
  // -------------------------
  const deleteGoal = async (id) => {
    const curr = auth.currentUser;
    if (!curr) return;

    try {
      await deleteDoc(doc(db, "users", curr.uid, "goals", id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  // -------------------------
  // UI Styles
  // -------------------------
  const card = {
    background: "white",
    padding: "1.5rem",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    marginBottom: "2rem",
  };

  const label = {
    fontWeight: "bold",
    display: "block",
    marginBottom: "0.3rem",
  };

  const input = {
    padding: "0.5rem",
    width: "100%",
    maxWidth: "250px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  };

  const button = {
    background: "#4A90E2",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
    marginTop: "1rem",
  };

  const th = {
    padding: "0.75rem",
    background: "#f4f4f4",
    textAlign: "left",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd",
  };

  const td = {
    padding: "0.75rem",
    borderBottom: "1px solid #eee",
  };

  const ProgressBar = ({ percent }) => (
    <div style={{ width: "150px", background: "#ddd", height: "10px", borderRadius: "6px" }}>
      <div
        style={{
          width: `${Math.min(percent, 100)}%`,
          height: "10px",
          background: "#4A90E2",
          borderRadius: "6px",
        }}
      ></div>
    </div>
  );

  // -------------------------
  // Render
  // -------------------------
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>Savings Goals</h1>
      <p>Create goals and track your savings progress over time.</p>
      {message && <p><strong>{message}</strong></p>}

      {/* Add Goal Card */}
      <div style={card}>
        <h2>Add New Goal</h2>

        <form onSubmit={handleSubmit}>
          <label style={label}>Goal Name:</label>
          <input
            style={input}
            type="text"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            required
          />

          <br /><br />

          <label style={label}>Target Amount ($):</label>
          <input
            style={input}
            type="number"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />

          <br />
          <button style={button} type="submit">
            Add Goal
          </button>
        </form>
      </div>

      {/* Goals Table */}
      <div style={card}>
        <h2>Your Goals</h2>

        {goals.length === 0 ? (
          <p>No goals added yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Target</th>
                <th style={th}>Saved</th>
                <th style={th}>Progress</th>
                <th style={th}>Add Money</th>
                <th style={th}>Status</th>
                <th style={th}>Delete</th>
              </tr>
            </thead>

            <tbody>
              {goals.map((g) => {
                const percent = (g.currentAmount / g.targetAmount) * 100;

                return (
                  <tr key={g.id}>
                    <td style={td}>{g.name}</td>
                    <td style={td}>${g.targetAmount.toFixed(2)}</td>
                    <td style={td}>${g.currentAmount.toFixed(2)}</td>

                    <td style={td}>
                      <ProgressBar percent={percent} />
                      <small>{percent.toFixed(1)}%</small>
                    </td>

                    {/* Add Contribution */}
                    <td style={td}>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const amt = e.target.elements.add.value;
                          if (amt > 0) addContribution(g, amt);
                          e.target.reset();
                        }}
                      >
                        <input
                          type="number"
                          name="add"
                          min="0"
                          step="0.01"
                          style={{ width: "90px", padding: "0.4rem" }}
                          required
                        />
                        <button
                          type="submit"
                          style={{
                            marginLeft: "6px",
                            background: "#4A90E2",
                            color: "white",
                            border: "none",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          +
                        </button>
                      </form>
                    </td>

                    {/* Status */}
                    <td style={td}>
                      {percent >= 100 ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          Achieved 🎉
                        </span>
                      ) : (
                        "In Progress"
                      )}
                    </td>

                    {/* Delete */}
                    <td style={td}>
                      <button
                        onClick={() => deleteGoal(g.id)}
                        style={{
                          background: "red",
                          color: "white",
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "6px",
                          cursor: "pointer",
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
