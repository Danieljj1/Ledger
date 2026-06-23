from tests.conftest import register_and_login, auth_headers

TXN_PAYLOAD = {
    "amount": 100.0,
    "date": "2024-01-15",
    "description": "Test payment",
    "type": "expense",
    "category": "Groceries",
}


def _setup(client):
    """Register a user, create an account, return (headers, account_id)."""
    token = register_and_login(client)
    headers = auth_headers(token)
    resp = client.post("/api/accounts?name=Checking&account_type=checking", headers=headers)
    assert resp.status_code == 200
    return headers, resp.json()["id"]


def test_create_transaction(client):
    headers, account_id = _setup(client)
    resp = client.post(f"/api/transactions?account_id={account_id}", json=TXN_PAYLOAD, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["amount"] == 100.0
    assert data["type"] == "expense"
    assert data["category"] == "Groceries"
    assert data["account_id"] == account_id


def test_get_transactions_returns_all(client):
    headers, account_id = _setup(client)
    for amount in [50.0, 75.0, 90.0]:
        client.post(f"/api/transactions?account_id={account_id}",
                    json={**TXN_PAYLOAD, "amount": amount}, headers=headers)

    resp = client.get(f"/api/transactions?account_id={account_id}", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 3


def test_delete_transaction(client):
    headers, account_id = _setup(client)
    create_resp = client.post(f"/api/transactions?account_id={account_id}", json=TXN_PAYLOAD, headers=headers)
    txn_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/transactions/{txn_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["detail"] == "Transaction deleted successfully"

    get_resp = client.get(f"/api/transactions?account_id={account_id}", headers=headers)
    assert len(get_resp.json()) == 0


def test_transactions_require_auth(client):
    resp = client.get("/api/transactions?account_id=1")
    assert resp.status_code == 401


def test_cannot_access_other_users_account(client):
    # User A creates account
    token_a = register_and_login(client, username="usera", password="passa")
    headers_a = auth_headers(token_a)
    account_resp = client.post("/api/accounts?name=A_Account&account_type=checking", headers=headers_a)
    account_id = account_resp.json()["id"]

    # User B tries to list that account's transactions
    token_b = register_and_login(client, username="userb", password="passb")
    headers_b = auth_headers(token_b)
    resp = client.get(f"/api/transactions?account_id={account_id}", headers=headers_b)
    assert resp.status_code == 404  # account not found for user B
