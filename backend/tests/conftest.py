import os
os.environ["TESTING"] = "1"  # must be set before app imports so lifespan skips migrations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
import db_models  # noqa: F401 — side-effect import registers all models on Base.metadata
from main import app

engine = create_engine(
    "sqlite://",  # in-memory, no file
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # forces all connections to share one underlying connection
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def register_and_login(client: TestClient, username="testuser", password="testpass123") -> str:
    client.post("/api/auth/register", json={
        "email": f"{username}@example.com",
        "username": username,
        "password": password,
    })
    resp = client.post("/api/auth/token", data={
        "username": username,
        "password": password,
    })
    return resp.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
