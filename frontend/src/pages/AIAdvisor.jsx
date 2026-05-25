import { useState, useEffect } from "react";
import api from "../api";

export default function AIAdvisor() {
  const [advice, setAdvice] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchAdvice() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ai-advisor");
      setAdvice(res.data.advice);
      setSummary(res.data.summary);
    } catch (err) {
      setError("Could not load AI advice. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdvice();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI Financial Advisor</h1>
        <p className="text-gray-500 mt-1">Personalized insights based on your transaction history</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-sm text-green-600 font-medium">Total Income</div>
            <div className="text-2xl font-bold text-green-700">${summary.total_income?.toLocaleString()}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-sm text-red-600 font-medium">Total Expenses</div>
            <div className="text-2xl font-bold text-red-700">${summary.total_expenses?.toLocaleString()}</div>
          </div>
          <div className={`rounded-xl p-4 border ${summary.net >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
            <div className={`text-sm font-medium ${summary.net >= 0 ? "text-blue-600" : "text-orange-600"}`}>Net Balance</div>
            <div className={`text-2xl font-bold ${summary.net >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              {summary.net >= 0 ? "+" : ""}${summary.net?.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {summary?.spending_by_category && Object.keys(summary.spending_by_category).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Spending by Category</h2>
          {Object.entries(summary.spending_by_category).map(([cat, amt]) => {
            const pct = summary.total_expenses > 0 ? (amt / summary.total_expenses) * 100 : 0;
            return (
              <div key={cat} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{cat}</span>
                  <span className="text-gray-500">${amt.toLocaleString()} ({pct.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: "#d97706" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <span>🤖</span> AI Advice
          </h2>
          <button
            onClick={fetchAdvice}
            disabled={loading}
            className="text-sm px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-all"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {loading ? "Analyzing..." : "Refresh Advice"}
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-gray-500">
            <div className="animate-spin w-5 h-5 border-2 border-gray-300 rounded-full" style={{ borderTopColor: "#1e3a5f" }}></div>
            <span>Analyzing your finances...</span>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {advice && !loading && (
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {advice}
          </div>
        )}
      </div>
    </div>
  );
}
