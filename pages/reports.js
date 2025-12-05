import { useEffect, useState } from "react";
import { collection, getFirestore, onSnapshot, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/firebase/initFirebase";
import { useUser } from "@/lib/firebase/useUser";

initFirebase();
const db = getFirestore();

export default function Reports() {
  const auth = getAuth();
  const { user } = useUser(); // FIRST HOOK — DO NOT MOVE

  // -----------------------------
  // STATE HOOKS (do not reorder)
  // -----------------------------
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyCategoryTotals, setMonthlyCategoryTotals] = useState({});

  const [weeklyIncome, setWeeklyIncome] = useState(0);
  const [weeklyExpenses, setWeeklyExpenses] = useState(0);
  const [weeklyCategoryTotals, setWeeklyCategoryTotals] = useState({});

  // -----------------------------
  // FIRESTORE LISTENERS
  // -----------------------------
  useEffect(() => {
    const curr = auth.currentUser;
    if (!curr) return;

    const tQuery = query(collection(db, "users", curr.uid, "transactions"));
    const bQuery = query(collection(db, "users", curr.uid, "budgets"));

    const unsubT = onSnapshot(tQuery, (snap) =>
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubB = onSnapshot(bQuery, (snap) =>
      setBudgets(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubT();
      unsubB();
    };
  }, [auth.currentUser]);

  // -----------------------------
  // DATE CALCULATIONS
  // -----------------------------
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const startOfWeek = getStartOfWeek();

  // -----------------------------
  // PROCESS MONTHLY + WEEKLY SPENDING  (❗ unchanged logic)
  // -----------------------------
  useEffect(() => {
    let mInc = 0,
      mExp = 0,
      mCat = {};
    let wInc = 0,
      wExp = 0,
      wCat = {};

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const isMonth = d.getMonth() === month && d.getFullYear() === year;
      const isWeek = d >= startOfWeek;

      if (isMonth) {
        if (t.type === "income") mInc += t.amount;
        else if (t.type === "expense") {
          mExp += t.amount;
          mCat[t.category] = (mCat[t.category] || 0) + t.amount;
        }
      }

      if (isWeek) {
        if (t.type === "income") wInc += t.amount;
        else if (t.type === "expense") {
          wExp += t.amount;
          wCat[t.category] = (wCat[t.category] || 0) + t.amount;
        }
      }
    });

    setMonthlyIncome(mInc);
    setMonthlyExpenses(mExp);
    setMonthlyCategoryTotals(mCat);

    setWeeklyIncome(wInc);
    setWeeklyExpenses(wExp);
    setWeeklyCategoryTotals(wCat);
  }, [transactions]);

  // -----------------------------
  // UI helpers (styling only)
  // -----------------------------
  const card = {
    padding: "1rem",
    border: "1px solid #ccc",
    background: "#fafafa",
    marginBottom: "2rem",
  };

  const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
  };

  const cell = {
    border: "1px solid #ccc",
    padding: "8px",
  };

  const ProgressBar = ({ percent }) => (
    <div style={{ width: "150px", background: "#ddd", height: "10px" }}>
      <div
        style={{
          width: `${Math.min(Math.max(percent, 0), 100)}%`,
          height: "10px",
          background: "#4A90E2",
        }}
      ></div>
    </div>
  );

  const getMonthlyBudget = (cat) => {
    const b = budgets.find((x) => x.category === cat && x.type === "monthly");
    return b ? b.amount : null;
  };

  // -----------------------------
  // AUTH CHECK (cannot wrap hooks)
  // -----------------------------
  if (user === undefined) return <p>Loading...</p>;
  if (!user) return null;

  // -----------------------------
  // PAGE RENDER
  // -----------------------------
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Financial Reports</h1>

      {/* MONTHLY SUMMARY */}
      <div style={card}>
        <h2>Monthly Summary</h2>
        <p><strong>Income:</strong> ${monthlyIncome.toFixed(2)}</p>
        <p><strong>Expenses:</strong> ${monthlyExpenses.toFixed(2)}</p>
        <p><strong>Net Balance:</strong> ${(monthlyIncome - monthlyExpenses).toFixed(2)}</p>
      </div>

      {/* MONTHLY CATEGORY TABLE */}
      <div style={card}>
        <h2>Monthly Category Spending</h2>

        {Object.keys(monthlyCategoryTotals).length === 0 ? (
          <p>No monthly spending.</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={cell}>Category</th>
                <th style={cell}>Spent</th>
                <th style={cell}>Budget</th>
                <th style={cell}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlyCategoryTotals).map(([cat, amt]) => {
                const b = getMonthlyBudget(cat);
                const pct = b ? (amt / b) * 100 : null;
                return (
                  <tr key={cat}>
                    <td style={cell}>{cat}</td>
                    <td style={cell}>${amt.toFixed(2)}</td>
                    <td style={cell}>{b ? `$${b.toFixed(2)}` : "None"}</td>
                    <td style={cell}>
                      {b ? (
                        <>
                          <ProgressBar percent={pct} />
                          <small>{pct.toFixed(1)}%</small>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* WEEKLY SUMMARY */}
      <div style={card}>
        <h2>Weekly Summary</h2>
        <p><strong>Income:</strong> ${weeklyIncome.toFixed(2)}</p>
        <p><strong>Expenses:</strong> ${weeklyExpenses.toFixed(2)}</p>
      </div>

      {/* WEEKLY CATEGORY TABLE */}
      <div style={card}>
        <h2>Weekly Category Spending</h2>

        {Object.keys(weeklyCategoryTotals).length === 0 ? (
          <p>No weekly spending.</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={cell}>Category</th>
                <th style={cell}>Spent</th>
                <th style={cell}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(weeklyCategoryTotals).map(([cat, amt]) => {
                const max = Math.max(...Object.values(weeklyCategoryTotals));
                const pct = (amt / max) * 100;

                return (
                  <tr key={cat}>
                    <td style={cell}>{cat}</td>
                    <td style={cell}>${amt.toFixed(2)}</td>
                    <td style={cell}>
                      <ProgressBar percent={pct} />
                      <small>{pct.toFixed(1)}%</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* INSIGHTS */}
      <div style={card}>
        <h2>Insights & Recommendations</h2>

        {monthlyExpenses > monthlyIncome ? (
          <p>You spent more than you earned this month.</p>
        ) : (
          <p>Great job staying within your income!</p>
        )}

        {Object.keys(monthlyCategoryTotals).length > 0 && (
          <p>
            Biggest category:{" "}
            <strong>
              {Object.entries(monthlyCategoryTotals).sort((a, b) => b[1] - a[1])[0][0]}
            </strong>
          </p>
        )}

        {/* Smart suggestion */}
        {Object.keys(monthlyCategoryTotals).length > 0 && (() => {
          const sorted = Object.entries(monthlyCategoryTotals).sort((a, b) => b[1] - a[1]);
          const [cat, amt] = sorted[0];

          if (amt < 50) return <p>Your spending is balanced.</p>;

          const pct = amt >= 400 ? 25 : amt >= 250 ? 20 : 15;
          const save = (amt * pct / 100).toFixed(2);

          return (
            <p>
              Cutting <strong>{cat}</strong> by <strong>{pct}%</strong> saves{" "}
              <strong>${save}/month</strong>.
            </p>
          );
        })()}

      </div>
    </main>
  );
}
