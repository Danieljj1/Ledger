import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const accountsRes = await api.get("/accounts");
      setAccounts(accountsRes.data);

      // Fetch transactions for all accounts
      const transactionsPromises = accountsRes.data.map((account) =>
        api.get(`/transactions?account_id=${account.id}`)
      );
      const transactionsResults = await Promise.all(transactionsPromises);
      const allTrans = transactionsResults.flatMap((res) => res.data);
      setAllTransactions(allTrans);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + parseFloat(acc.balance || 0),
    0
  );

  const thisMonthIncome = allTransactions
    .filter((t) => t.type === "income" && isThisMonth(t.date))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const thisMonthExpenses = allTransactions
    .filter((t) => t.type === "expense" && isThisMonth(t.date))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  function isThisMonth(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  // Prepare category data for pie chart
  const getCategoryData = () => {
    const expenses = allTransactions.filter((t) => t.type === "expense");
    const categoryTotals = {};

    expenses.forEach((t) => {
      if (categoryTotals[t.category]) {
        categoryTotals[t.category] += parseFloat(t.amount);
      } else {
        categoryTotals[t.category] = parseFloat(t.amount);
      }
    });

    return Object.keys(categoryTotals).map((category) => ({
      name: category,
      value: parseFloat(categoryTotals[category].toFixed(2)),
    }));
  };

  const categoryData = getCategoryData();
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Your financial overview at a glance.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Total Balance</div>
          <div className="text-2xl font-bold text-slate-900">${totalBalance.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">This Month Income</div>
          <div className="text-2xl font-bold text-gold-500">+${thisMonthIncome.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">This Month Expenses</div>
          <div className="text-2xl font-bold text-red-500">-${thisMonthExpenses.toFixed(2)}</div>
        </div>
      </div>

      {/* My Accounts */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">My Accounts</h2>
      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center mb-8">
          <p className="text-slate-500 text-sm mb-4">No accounts yet. Create your first account.</p>
          <button
            onClick={() => navigate("/accounts")}
            className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Add Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => navigate(`/account/${account.id}`)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer transition-all hover:border-gold-500 hover:shadow-md"
            >
              <div className="font-semibold text-slate-900 text-sm mb-1">{account.name}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-4">{account.type}</div>
              <div className="text-2xl font-bold text-gold-500">
                ${parseFloat(account.balance || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Spending Chart */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-6">Spending by Category</h2>
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
