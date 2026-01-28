from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import transactions, categories, accounts, auth
from database import engine, SessionLocal
import db_models 

db_models.Base.metadata.create_all(bind=engine)

def init_db():
    db = SessionLocal()
    try:
        # Only create default categories (categories are shared by all users)
        category_count = db.query(db_models.Category).count()
        if category_count == 0:
            default_categories = [
                db_models.Category(name="Groceries"),
                db_models.Category(name="Entertainment"),
                db_models.Category(name="Bills"),
                db_models.Category(name="Salary"),
                db_models.Category(name="General"),
            ]
            db.add_all(default_categories)
            db.commit()
            print("✓ Default categories created")
    finally:
        db.close()

# Call when app starts
init_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api", tags=["transactions"])
app.include_router(categories.router, prefix="/api", tags=["categories"])
app.include_router(accounts.router, prefix="/api", tags=["accounts"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@app.get("/")
def root():
    return {"message": "Finance Manager API"}
