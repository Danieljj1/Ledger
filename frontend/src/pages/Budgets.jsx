import { useState, useEffect } from "react";
import api from "../api";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: "", monthly_limit: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  async function fetchBudgets() {
    try {
      const res = await api.get("/budgets");
      setBudgets(res.data);
    } catch {}
    setLoading(false);
  }

  async function fetchCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category || !form.monthly_limit) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/budgets", {
        category: form.category,
        monthly_limit: parseFloat(form.monthly_limit),
      });
      setForm({ category: "", monthly_limit: "" });
      fetchBudgets();
    } catch (err) {
      setError("Failed to save budget.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch {}
  }

  const getStatusColor = (pct) => {
    if (pct >= 100) return { bar: "#ef4444", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" };
    if (pct >= 80) return { bar: "#f97316", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" };
    return { bar: "#22c55e", bg: "bg-green-50", border: "border-green-200", text: "text-green-700" };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Monthly Budgets</h1>
        <p className="text-gray-500 mt-1">Set spending limits by category and track your progress</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Set a Budget</h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-40">
            <label className="text-sm text-gray-500 font-medium block mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-32">
            <label className="text-sm text-gray-500 font-medium block mb-1">Monthly Limit ($)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.monthly_limit}
              onChange={e => setForm(f => ({ ...f, monthly_limit: e.target.value }))}
              placeholder="500"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {saving ? "Saving..." : "Set Budget"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-lg font-medium">No budgets set yet</p>
          <p className="text-sm mt-1">Add a budget above to start tracking your spending limits</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map(b => {
            const colors = getStatusColor(b.percentage);
            return (
              <div key={b.id} className={`${colors.bg} border ${colors.border} rounded-xl p-5`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{b.category}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      ${b.spent.toLocaleString()} spent of ${b.monthly_limit.toLocaleString()} limit
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${colors.text}`}>{b.percentage}%</span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="w-full bg-white bg-opacity-60 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(b.percentage, 100)}%`, backgroundColor: colors.bar }}
                  />
                </div>
                {b.percentage >= 80 && (
                  <p className={`text-sm mt-2 font-medium ${colors.text}`}>
                    {b.percentage >= 100
                      ? `⚠️ Over budget by $${Math.abs(b.remaining).toLocaleString()}!`
                      : `⚡ $${b.remaining.toLocaleString()} remaining — approaching limit`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
