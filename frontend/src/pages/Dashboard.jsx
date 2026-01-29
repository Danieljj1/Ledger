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
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-navy-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's your financial overview.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Total Balance
          </div>
          <div className="text-3xl font-bold text-navy-800">
            ${totalBalance.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            This Month Income
          </div>
          <div className="text-3xl font-bold text-green-500">
            +${thisMonthIncome.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            This Month Expenses
          </div>
          <div className="text-3xl font-bold text-red-500">
            -${thisMonthExpenses.toFixed(2)}
          </div>
        </div>
      </div>

      {/* My Accounts */}
      <h2 className="text-2xl font-semibold text-navy-800 mb-5">My Accounts</h2>
      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-gray-500 mb-4">
            No accounts yet. Create your first account!
          </p>
          <button
            onClick={() => navigate("/accounts")}
            className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-800 font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Create Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => navigate(`/account/${account.id}`)}
              className="bg-white rounded-xl p-6 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-2 hover:border-gold-500 border-2 border-transparent"
            >
              <div className="text-lg font-semibold text-navy-800 mb-2">
                {account.name}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">
                {account.type}
              </div>
              <div className="text-3xl font-bold text-gold-500">
                ${parseFloat(account.balance || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Spending Chart */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-navy-800 mb-6">
            Overall Spending by Category
          </h2>
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
