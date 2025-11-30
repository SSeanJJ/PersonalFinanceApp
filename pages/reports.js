import { useEffect, useState } from "react";
import { collection, getFirestore, onSnapshot, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/firebase/initFirebase";

initFirebase();
const db = getFirestore();

export default function Reports() {
  const auth = getAuth();

  const [transactions, setTransactions] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [biggestCategory, setBiggestCategory] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "transactions"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(items);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  useEffect(() => {
    if (transactions.length === 0) return;

    let income = 0;
    let expenses = 0;
    let categories = {};

    // Only count this month's transactions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() !== currentMonth || tDate.getFullYear() !== currentYear) return;

      if (t.type === "income") {
        income += t.amount;
      } else if (t.type === "expense") {
        expenses += t.amount;

        if (!categories[t.category]) categories[t.category] = 0;
        categories[t.category] += t.amount;
      }
    });

    setMonthlyIncome(income);
    setMonthlyExpenses(expenses);
    setCategoryTotals(categories);

    // Find biggest category
    let biggest = "";
    let max = 0;
    for (const [cat, amt] of Object.entries(categories)) {
      if (amt > max) {
        max = amt;
        biggest = cat;
      }
    }
    setBiggestCategory(biggest);

  }, [transactions]);

  // Simple advice generator
  const generateAdvice = () => {
    if (monthlyExpenses > monthlyIncome) {
      return "You spent more than you earned this month. Consider reducing discretionary spending.";
    }

    if (biggestCategory) {
      return `Your largest spending category is ${biggestCategory}. Try setting a lower budget for this category next month.`;
    }

    return "Great job staying on track this month!";
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Financial Reports</h1>
      <p>Your monthly financial summary based on your transactions.</p>

      <hr /><br />

      <h2>Monthly Summary</h2>
      <p><strong>Total Income:</strong> ${monthlyIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> ${monthlyExpenses.toFixed(2)}</p>
      <p><strong>Net Balance:</strong> ${(monthlyIncome - monthlyExpenses).toFixed(2)}</p>

      <hr /><br />

      <h2>Spending by Category</h2>

      {Object.keys(categoryTotals).length === 0 ? (
        <p>No expenses recorded this month.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoryTotals).map(([cat, amt]) => (
              <tr key={cat}>
                <td>{cat}</td>
                <td>${amt.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr /><br />

      <h2>Insights & Recommendations</h2>
      <p>{generateAdvice()}</p>

    </main>
  );
}
