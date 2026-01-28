from datetime import date
from .models import Account, Transaction

accounts = [
    Account(id=1, name="Checking", type="checking"),
    Account(id=2, name="Savings", type="savings"),
    Account(id=3, name="Credit Card", type="credit"),
]
next_account_id = 4

categories = [
    {"id": 1, "name": "Groceries"},
    {"id": 2, "name": "Entertainment"},
    {"id": 3, "name": "Bills"},
    {"id": 4, "name": "Salary"},
    {"id": 5, "name": "General"},
]
next_category_id = 6

transactions: list[Transaction] = []
next_transaction_id = 1

# Account functions
def account_exists(account_id: int) -> bool:
    return any(account.id == account_id for account in accounts)

def get_all_accounts():
    return accounts

def add_account(name: str, account_type: str):
    global next_account_id
    account_data = {
        "id": next_account_id,
        "name": name,
        "type": account_type
    }
    new_account = Account(**account_data)
    next_account_id += 1
    accounts.append(new_account)
    return new_account

def delete_account(account_id: int) -> bool:
    global accounts
    for i, a in enumerate(accounts):
        if a.id == account_id:
            accounts.pop(i)
            return True
    return False

# Transaction functions
def add_transaction(account_id: int, transaction: Transaction) -> Transaction:
    global next_transaction_id
    transaction.id = next_transaction_id
    next_transaction_id += 1
    transactions.append(transaction)
    return transaction

def get_transactions_for_account(account_id: int) -> list[Transaction]:
    return [t for t in transactions if t.account_id == account_id]

def get_transaction_by_id(transaction_id: int) -> Transaction | None:
    for t in transactions:
        if t.id == transaction_id:
            return t
    return None

def update_transaction(transaction_id: int, updated_transaction: dict) -> Transaction | None:
    transaction = get_transaction_by_id(transaction_id)
    if transaction:
        for key, value in updated_transaction.items():
            if hasattr(transaction, key):
                setattr(transaction, key, value)
        return transaction
    return None

def delete_transaction(transaction_id: int) -> bool:
    global transactions
    for i, t in enumerate(transactions):
        if t.id == transaction_id:
            transactions.pop(i)
            return True
    return False

def get_summary_for_account(account_id: int) -> dict:
    transaction = get_transactions_for_account(account_id)
    income = sum(t.amount for t in transaction if t.type == 'income')
    expense = sum(t.amount for t in transaction if t.type == 'expense')
    return {
        "income": income,
        "expense": expense,
        "net": income - expense,
        "count": len(transaction),
    }

# Category functions
def get_all_categories():
    return categories

def add_category(name: str):
    global next_category_id
    new_category = {"id": next_category_id, "name": name}
    next_category_id += 1
    categories.append(new_category)
    return new_category

def delete_category(category_id: int) -> bool:
    global categories
    for i, c in enumerate(categories):
        if c["id"] == category_id:
            categories.pop(i)
            return True
    return False