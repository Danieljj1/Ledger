import { useState } from "react";
import api from "../api";

const ACCOUNT_TYPE_LABELS = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit Card",
};

function Accounts({ accounts, refreshAccounts }) {
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("checking");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/accounts?name=${newAccountName}&account_type=${newAccountType}`);
      refreshAccounts();
      setNewAccountName("");
      setNewAccountType("checking");
    } catch {
      setError("Failed to add account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm("Delete this account? Transactions will become orphaned.")) return;
    try {
      await api.delete(`/accounts/${accountId}`);
      refreshAccounts();
    } catch {
      setError("Failed to delete account.");
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-colors bg-white";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Accounts</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your financial accounts.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Add Account */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Add New Account</h2>
        <form onSubmit={handleAddAccount} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="e.g., Chase Freedom"
            required
            className={inputClass + " flex-1"}
          />
          <select
            value={newAccountType}
            onChange={(e) => setNewAccountType(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-colors bg-white"
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit Card</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {submitting ? "Adding..." : "Add Account"}
          </button>
        </form>
      </div>

      {/* Account List */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">
        Your Accounts
        {accounts.length > 0 && (
          <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {accounts.length}
          </span>
        )}
      </h2>

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="text-3xl mb-3">🏦</div>
          <p className="text-slate-500 text-sm">No accounts yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{account.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {ACCOUNT_TYPE_LABELS[account.type] || account.type}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete account"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Accounts;
