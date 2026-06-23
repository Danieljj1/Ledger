from tests.conftest import register_and_login


def test_register_success(client):
    resp = client.post("/api/auth/register", json={
        "email": "new@example.com",
        "username": "newuser",
        "password": "password123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "new@example.com"
    assert data["username"] == "newuser"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={
        "email": "dupe@example.com", "username": "user1", "password": "pass",
    })
    resp = client.post("/api/auth/register", json={
        "email": "dupe@example.com", "username": "user2", "password": "pass",
    })
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Email already registered"


def test_register_duplicate_username(client):
    client.post("/api/auth/register", json={
        "email": "a@example.com", "username": "sameuser", "password": "pass",
    })
    resp = client.post("/api/auth/register", json={
        "email": "b@example.com", "username": "sameuser", "password": "pass",
    })
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Username already taken"


def test_login_success(client):
    register_and_login(client, username="loginuser", password="mypassword")
    resp = client.post("/api/auth/token", data={
        "username": "loginuser",
        "password": "mypassword",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "email": "wrong@example.com", "username": "wronguser", "password": "correct",
    })
    resp = client.post("/api/auth/token", data={
        "username": "wronguser",
        "password": "notcorrect",
    })
    assert resp.status_code == 401
