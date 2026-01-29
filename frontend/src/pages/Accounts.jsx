import { useState, useEffect } from "react";
import api from "../api";

function Accounts({ accounts, refreshAccounts }) {
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("checking");

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      alert("Please enter an account name");
      return;
    }

    try {
      await api.post(
        `/accounts?name=${newAccountName}&account_type=${newAccountType}`
      );
      refreshAccounts();
      setNewAccountName("");
      setNewAccountType("checking");
    } catch (error) {
      console.error("Error adding account:", error);
      alert("Failed to add account");
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this account? All transactions in this account will become orphaned!"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/accounts/${accountId}`);
      refreshAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manage Accounts</h1>

      <div
        style={{
          border: "2px solid black",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h2>Add New Account</h2>

        <div style={{ marginBottom: "10px" }}>
          <label>Account Name: </label>
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="e.g., Chase Freedom"
            style={{ padding: "8px", width: "200px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Account Type: </label>
          <select
            value={newAccountType}
            onChange={(e) => setNewAccountType(e.target.value)}
            style={{ padding: "8px" }}
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit Card</option>
          </select>
        </div>

        <button
          onClick={handleAddAccount}
          style={{
            padding: "8px 20px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Add Account
        </button>
      </div>

      <h2>Existing Accounts</h2>
      {accounts.length === 0 ? (
        <p>No accounts yet.</p>
      ) : (
        <div>
          {accounts.map((account) => (
            <div
              key={account.id}
              style={{
                border: "1px solid gray",
                padding: "15px",
                margin: "10px 0",
                backgroundColor: "lightyellow",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>{account.name}</h3>
                <p style={{ color: "gray", margin: "5px 0 0 0" }}>
                  Type: {account.type}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "8px 15px",
                  cursor: "pointer",
                  borderRadius: "5px",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Accounts;
