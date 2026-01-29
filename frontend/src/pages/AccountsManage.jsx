import { useState, useEffect } from "react";
import api from "../api";

function AccountsManage() {
  const [accounts, setAccounts] = useState([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("checking");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/accounts");
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();

    if (!newAccountName.trim()) {
      alert("Please enter an account name");
      return;
    }

    try {
      await api.post(
        `/accounts?name=${newAccountName}&account_type=${newAccountType}`
      );
      setNewAccountName("");
      setNewAccountType("checking");
      fetchAccounts();
    } catch (error) {
      console.error("Error adding account:", error);
      alert("Failed to add account");
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this account? All transactions in this account will be lost!"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/accounts/${accountId}`);
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    }
  };

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
        <h1 className="text-4xl font-bold text-navy-800 mb-2">
          Manage Accounts
        </h1>
        <p className="text-gray-600">
          Add, view, and delete your financial accounts.
        </p>
      </div>

      {/* Add Account Form */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-navy-800 mb-6">
          Add New Account
        </h2>
        <form onSubmit={handleAddAccount}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-navy-800">
                Account Name
              </label>
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="e.g., Chase Freedom"
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-navy-800">
                Account Type
              </label>
              <select
                value={newAccountType}
                onChange={(e) => setNewAccountType(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit Card</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-800 font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Add Account
          </button>
        </form>
      </div>

      {/* Existing Accounts */}
      <h2 className="text-2xl font-semibold text-navy-800 mb-5">
        Existing Accounts
      </h2>
      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-gray-500">
            No accounts yet. Create your first account above!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-xl p-6 shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold text-navy-800">
                  {account.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Type: <span className="capitalize">{account.type}</span>
                </p>
              </div>

              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
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
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountsManage;
