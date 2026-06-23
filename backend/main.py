from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from alembic.config import Config
from alembic import command
from app.routes import transactions, categories, accounts, auth, ai_advisor, budgets
from database import SessionLocal
import db_models
import os


def run_migrations():
    if os.getenv("TESTING"):
        return
    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "alembic.ini"))
    command.upgrade(alembic_cfg, "head")


def seed_categories():
    if os.getenv("TESTING"):
        return
    db = SessionLocal()
    try:
        if db.query(db_models.Category).count() == 0:
            db.add_all([
                db_models.Category(name="Groceries"),
                db_models.Category(name="Entertainment"),
                db_models.Category(name="Bills"),
                db_models.Category(name="Salary"),
                db_models.Category(name="General"),
            ])
            db.commit()
            print("✓ Default categories created")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    seed_categories()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ledger-frontend-f452.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api", tags=["transactions"])
app.include_router(categories.router, prefix="/api", tags=["categories"])
app.include_router(accounts.router, prefix="/api", tags=["accounts"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(ai_advisor.router, prefix="/api", tags=["ai-advisor"])
app.include_router(budgets.router, prefix="/api", tags=["budgets"])


@app.get("/")
def root():
    return {"message": "Finance Manager API"}
