import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [accountRes, transactionsRes, categoriesRes] = await Promise.all([
        api.get(`/accounts`),
        api.get(`/transactions?account_id=${id}`),
        api.get(`/categories`),
      ]);

      const foundAccount = accountRes.data.find(
        (acc) => acc.id === parseInt(id)
      );
      setAccount(foundAccount);
      setTransactions(transactionsRes.data);
      setCategories(categoriesRes.data);

      if (categoriesRes.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category: categoriesRes.data[0].name,
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      await api.post(`/transactions?account_id=${id}`, {
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        type: formData.type,
        category: formData.category,
      });

      // Reset form
      setFormData({
        type: "expense",
        amount: "",
        category: categories[0]?.name || "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });

      // Refresh transactions
      fetchData();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction");
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await api.delete(`/transactions/${transactionId}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    }
  };

  const calculateBalance = () => {
    return transactions.reduce((balance, t) => {
      if (t.type === "income") {
        return balance + parseFloat(t.amount);
      } else {
        return balance - parseFloat(t.amount);
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Account not found</div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-navy-800 mb-6 hover:text-gold-500 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="text-sm">Back to Dashboard</span>
      </button>

      {/* Account Header */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <h1 className="text-4xl font-bold text-navy-800 mb-2">
          {account.name}
        </h1>
        <div className="text-sm text-gray-500 uppercase tracking-wide mb-6">
          {account.type} Account
        </div>
        <div className="text-5xl font-bold text-gold-500">
          ${calculateBalance().toFixed(2)}
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-navy-800 mb-6">
          Add Transaction
        </h2>
        <form onSubmit={handleAddTransaction}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-navy-800">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-navy-800">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-navy-800">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-navy-800">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-sm font-medium text-navy-800">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description..."
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-800 font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Add Transaction
          </button>
        </form>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-navy-800 mb-6">
          Recent Transactions
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="space-y-0">
            {transactions
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center py-5 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex flex-col gap-1">
                    <div className="text-base font-medium text-navy-800">
                      {transaction.description || transaction.category}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.category} •{" "}
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`text-lg font-bold ${
                        transaction.type === "income"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {parseFloat(transaction.amount).toFixed(2)}
                    </div>

                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-red-500"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountDetail;
