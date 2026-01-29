import { useState, useEffect } from "react";
import api from "../api";

function Transactions({ accounts, onTransactionChange }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("expense");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("General");
  const [editCategory, setEditCategory] = useState("General");
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    net: 0,
    count: 0,
  });
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    console.log("Accounts changed:", accounts);
    console.log("Current selectedAccount:", selectedAccount);
    if (accounts.length > 0 && selectedAccount === null) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts]);

  // Fetch transactions when component loads
  useEffect(() => {
    if (selectedAccount !== null) {
      fetchTransactions();
      fetchCategories();
      fetchSummary();
    }
  }, [selectedAccount, dateFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const { start_date, end_date } = getDateRange(dateFilter);

      let url = `http://localhost:8000/api/transactions/summary?account_id=${selectedAccount}`;

      if (start_date && end_date) {
        url += `&start_date=${start_date}&end_date=${end_date}`;
      }

      const response = await api.get(url);
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const calculateSummary = (transactionsList) => {
    const income = transactionsList
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactionsList
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income: income,
      expense: expense,
      net: income - expense,
      count: transactionsList.length,
    };
  };

  const handleAddTransaction = async () => {
    try {
      const newTransaction = {
        description: description,
        amount: parseFloat(amount),
        type: type,
        date: new Date().toISOString().split("T")[0], // Today's date
        category: category,
      };

      await api.post(
        `/transactions?account_id=${selectedAccount}`,
        newTransaction
      );

      // Refresh the list
      fetchTransactions();
      fetchSummary();
      onTransactionChange();

      // Clear the form
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("General"); // Reset category to default
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
      fetchTransactions();
      fetchSummary();
      onTransactionChange();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
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
  const handleEditClick = (transaction) => {
    setEditingId(transaction.id);
    setEditDescription(transaction.description);
    setEditAmount(transaction.amount.toString());
    setEditType(transaction.type);
    setEditCategory(transaction.category);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedData = {
        description: editDescription,
        amount: parseFloat(editAmount),
        type: editType,
        category: editCategory,
      };

      await api.put(`/transactions/${editingId}`, updatedData);

      fetchTransactions();
      fetchSummary();
      onTransactionChange();

      // Clear editing state
      setEditingId(null);
      setEditDescription("");
      setEditAmount("");
      setEditType("expense");
      setEditCategory("General");
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription("");
    setEditAmount("");
    setEditType("expense");
    setEditCategory("General");
  };

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div>
      <h1>Transactions</h1>

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

      {/* Date Filter Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Date Range:</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setDateFilter("all")}
            style={{
              padding: "10px 20px",
              backgroundColor: dateFilter === "all" ? "purple" : "lightgray",
              color: dateFilter === "all" ? "white" : "black",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            All Time
          </button>
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

      {/* Summary Box */}
      <div
        style={{
          border: "2px solid green",
          padding: "20px",
          marginBottom: "20px",
          backgroundColor: "lightgreen",
          borderRadius: "8px",
        }}
      >
        <h2>Account Summary</h2>
        <div style={{ display: "flex", gap: "30px", marginTop: "10px" }}>
          <div>
            <p style={{ margin: "5px 0", fontSize: "14px", color: "gray" }}>
              Total Income
            </p>
            <p
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "bold",
                color: "green",
              }}
            >
              ${summary.income.toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ margin: "5px 0", fontSize: "14px", color: "gray" }}>
              Total Expenses
            </p>
            <p
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "bold",
                color: "red",
              }}
            >
              ${summary.expense.toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ margin: "5px 0", fontSize: "14px", color: "gray" }}>
              Net Balance
            </p>
            <p
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "bold",
                color: summary.net >= 0 ? "green" : "red",
              }}
            >
              ${summary.net.toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ margin: "5px 0", fontSize: "14px", color: "gray" }}>
              Transactions
            </p>
            <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
              {summary.count}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          border: "2px solid black",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h2>Add New Transaction</h2>

        <div>
          <label>Description: </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Amount: </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Type: </label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Category: </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleAddTransaction} style={{ marginTop: "10px" }}>
          Add Transaction
        </button>
      </div>

      {transactions.length === 0 ? (
        <p>No transactions yet. Add your first one!</p>
      ) : (
        transactions.map((transaction) => (
          <div
            key={transaction.id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              margin: "10px 0",
              backgroundColor: "lightblue",
            }}
          >
            {editingId === transaction.id ? (
              // EDIT MODE - Show the edit form
              <div>
                <h3>Editing Transaction</h3>

                <div style={{ marginTop: "10px" }}>
                  <label>Description: </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: "10px" }}>
                  <label>Category: </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <label>Amount: </label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: "10px" }}>
                  <label>Type: </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      marginRight: "10px",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      backgroundColor: "gray",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      cursor: "pointer",
                      borderRadius: "5px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // NORMAL MODE - Show the transaction info
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3>{transaction.description}</h3>
                  <p>Amount: ${transaction.amount}</p>
                  <p>Type: {transaction.type}</p>
                  <p>Category: {transaction.category}</p>
                  <p>Date: {transaction.date}</p>
                </div>

                <div>
                  <button
                    onClick={() => handleEditClick(transaction)}
                    style={{
                      backgroundColor: "blue",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      marginRight: "10px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      cursor: "pointer",
                      borderRadius: "5px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Transactions;
