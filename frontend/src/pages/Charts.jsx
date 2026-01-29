import { useState, useEffect } from "react";
import api from "../api";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Charts({ accounts, refreshTrigger }) {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dateFilter, setDateFilter] = useState("this-month");

  // Set default account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && selectedAccount === null) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts]);

  // Fetch transactions when account or date changes
  useEffect(() => {
    if (selectedAccount !== null) {
      fetchTransactions();
    }
  }, [selectedAccount, dateFilter, refreshTrigger]);

  const fetchTransactions = async () => {
    try {
      const { start_date, end_date } = getDateRange(dateFilter);

      let url = `http://localhost:8000/api/transactions?account_id=${selectedAccount}`;

      if (start_date && end_date) {
        url += `&start_date=${start_date}&end_date=${end_date}`;
      }

      const response = await api.get(url);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const getDateRange = (filterType) => {
    const today = new Date();

    if (filterType === "all") {
      return { start_date: null, end_date: null };
    }

    if (filterType === "this-month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        start_date: firstDay.toISOString().split("T")[0],
        end_date: lastDay.toISOString().split("T")[0],
      };
    }

    if (filterType === "last-month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        start_date: firstDay.toISOString().split("T")[0],
        end_date: lastDay.toISOString().split("T")[0],
      };
    }

    if (filterType === "this-year") {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      const lastDay = new Date(today.getFullYear(), 11, 31);
      return {
        start_date: firstDay.toISOString().split("T")[0],
        end_date: lastDay.toISOString().split("T")[0],
      };
    }

    return { start_date: null, end_date: null };
  };

  // Prepare data for category pie chart
  const getCategoryData = () => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const categoryTotals = {};

    expenses.forEach((t) => {
      if (categoryTotals[t.category]) {
        categoryTotals[t.category] += t.amount;
      } else {
        categoryTotals[t.category] = t.amount;
      }
    });

    return Object.keys(categoryTotals).map((category) => ({
      name: category,
      value: parseFloat(categoryTotals[category].toFixed(2)),
    }));
  };

  // Prepare data for daily spending line chart
  const getDailyData = () => {
    const dailyTotals = {};

    transactions.forEach((t) => {
      const date = t.date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = { date, income: 0, expense: 0 };
      }

      if (t.type === "income") {
        dailyTotals[date].income += t.amount;
      } else {
        dailyTotals[date].expense += t.amount;
      }
    });

    return Object.values(dailyTotals).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  if (selectedAccount === null) {
    return <div>Loading...</div>;
  }

  const categoryData = getCategoryData();
  const dailyData = getDailyData();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Charts & Insights</h1>

      {/* Account Selector */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Select Account:</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account.id)}
              style={{
                padding: "10px 20px",
                backgroundColor:
                  selectedAccount === account.id ? "blue" : "lightgray",
                color: selectedAccount === account.id ? "white" : "black",
                border: "none",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              {account.name}
            </button>
          ))}
        </div>
      </div>

      {/* Date Filter */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Date Range:</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setDateFilter("this-month")}
            style={{
              padding: "10px 20px",
              backgroundColor:
                dateFilter === "this-month" ? "purple" : "lightgray",
              color: dateFilter === "this-month" ? "white" : "black",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter("last-month")}
            style={{
              padding: "10px 20px",
              backgroundColor:
                dateFilter === "last-month" ? "purple" : "lightgray",
              color: dateFilter === "last-month" ? "white" : "black",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            Last Month
          </button>
          <button
            onClick={() => setDateFilter("this-year")}
            style={{
              padding: "10px 20px",
              backgroundColor:
                dateFilter === "this-year" ? "purple" : "lightgray",
              color: dateFilter === "this-year" ? "white" : "black",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Charts */}
      <div style={{ marginTop: "40px" }}>
        <h2>Spending by Category</h2>
        {categoryData.length === 0 ? (
          <p>No expense data to display</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value}`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Income vs Expenses Over Time</h2>
        {dailyData.length === 0 ? (
          <p>No transaction data to display</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default Charts;
