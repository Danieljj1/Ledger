import { useState, useEffect } from "react";
import api from "../api";

const DATE_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-year", label: "This Year" },
];

function getDateRange(filterType) {
  const today = new Date();
  if (filterType === "all") return { start_date: null, end_date: null };
  if (filterType === "this-month") {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start_date: first.toISOString().split("T")[0], end_date: last.toISOString().split("T")[0] };
  }
  if (filterType === "last-month") {
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start_date: first.toISOString().split("T")[0], end_date: last.toISOString().split("T")[0] };
  }
  if (filterType === "this-year") {
    const first = new Date(today.getFullYear(), 0, 1);
    const last = new Date(today.getFullYear(), 11, 31);
    return { start_date: first.toISOString().split("T")[0], end_date: last.toISOString().split("T")[0] };
  }
  return { start_date: null, end_date: null };
}

function Transactions({ accounts, onTransactionChange }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("expense");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("General");
  const [editCategory, setEditCategory] = useState("General");
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0, count: 0 });
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    if (accounts.length > 0 && selectedAccount === null) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts]);

  useEffect(() => {
    if (selectedAccount !== null) {
      fetchTransactions();
      fetchCategories();
      fetchSummary();
    }
  }, [selectedAccount, dateFilter]);

  const buildUrl = (base) => {
    const { start_date, end_date } = getDateRange(dateFilter);
    let url = `${base}?account_id=${selectedAccount}`;
    if (start_date && end_date) url += `&start_date=${start_date}&end_date=${end_date}`;
    return url;
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get(buildUrl("http://localhost:8000/api/transactions"));
      setTransactions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get(buildUrl("http://localhost:8000/api/transactions/summary"));
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/transactions?account_id=${selectedAccount}`, {
        description,
        amount: parseFloat(amount),
        type,
        date: new Date().toISOString().split("T")[0],
        category,
      });
      fetchTransactions();
      fetchSummary();
      onTransactionChange();
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("General");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
      fetchSummary();
      onTransactionChange();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (t) => {
    setEditingId(t.id);
    setEditDescription(t.description);
    setEditAmount(t.amount.toString());
    setEditType(t.type);
    setEditCategory(t.category);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/transactions/${editingId}`, {
        description: editDescription,
        amount: parseFloat(editAmount),
        type: editType,
        category: editCategory,
      });
      fetchTransactions();
      fetchSummary();
      onTransactionChange();
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelEdit = () => setEditingId(null);

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-colors bg-white";
  const selectClass = "px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-colors bg-white";

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-slate-500">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transactions</h1>
        <p className="text-slate-500 mt-1 text-sm">Track and manage your income and expenses.</p>
      </div>

      {/* Account Tabs */}
      {accounts.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedAccount === account.id
                  ? "bg-navy-800 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {account.name}
            </button>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Income</div>
          <div className="text-xl font-bold text-gold-500">+${summary.income.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Expenses</div>
          <div className="text-xl font-bold text-red-500">-${summary.expense.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Net</div>
          <div className={`text-xl font-bold ${summary.net >= 0 ? "text-gold-500" : "text-red-500"}`}>
            {summary.net >= 0 ? "+" : ""}${summary.net.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Count</div>
          <div className="text-xl font-bold text-slate-900">{summary.count}</div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setDateFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateFilter === f.value
                ? "bg-gold-500 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add Transaction */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Add Transaction</h2>
        <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
            className={inputClass + " lg:col-span-2"}
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            step="0.01"
            required
            className={inputClass}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 lg:col-span-1 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="text-3xl mb-3">💸</div>
          <p className="text-slate-500 text-sm">No transactions yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <div key={t.id} className="px-5 py-4">
                {editingId === t.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className={inputClass}
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className={inputClass}
                      placeholder="Amount"
                    />
                    <select value={editType} onChange={(e) => setEditType(e.target.value)} className={selectClass}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={selectClass}>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="sm:col-span-2 lg:col-span-4 flex gap-2 pt-1">
                      <button onClick={handleSaveEdit} className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-lg text-sm transition-colors">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        t.type === "income" ? "bg-gold-500/10" : "bg-red-50"
                      }`}>
                        {t.type === "income" ? (
                          <svg className="w-3.5 h-3.5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 text-sm truncate">{t.description}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {t.category} &middot; {t.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className={`font-semibold text-sm ${t.type === "income" ? "text-gold-500" : "text-red-500"}`}>
                        {t.type === "income" ? "+" : "-"}${parseFloat(t.amount).toFixed(2)}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(t)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
