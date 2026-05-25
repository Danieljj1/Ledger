from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from pydantic import BaseModel
from database import get_db
import db_models
from app.routes.auth import get_current_user

router = APIRouter()

class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float
    month: Optional[int] = None
    year: Optional[int] = None

@router.get("/budgets")
def get_budgets(
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    today = date.today()
    budgets = db.query(db_models.Budget).filter(
        db_models.Budget.user_id == current_user.id,
        db_models.Budget.month == today.month,
        db_models.Budget.year == today.year
    ).all()

    result = []
    for b in budgets:
        spent = db.query(db_models.Transaction).join(db_models.Account).filter(
            db_models.Account.user_id == current_user.id,
            db_models.Transaction.category == b.category,
            db_models.Transaction.type == "expense",
        ).all()
        total_spent = sum(t.amount for t in spent if t.date.month == today.month and t.date.year == today.year)
        result.append({
            "id": b.id,
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "spent": round(total_spent, 2),
            "remaining": round(b.monthly_limit - total_spent, 2),
            "percentage": round((total_spent / b.monthly_limit) * 100, 1) if b.monthly_limit > 0 else 0
        })
    return result

@router.post("/budgets")
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    today = date.today()
    month = budget.month or today.month
    year = budget.year or today.year

    existing = db.query(db_models.Budget).filter(
        db_models.Budget.user_id == current_user.id,
        db_models.Budget.category == budget.category,
        db_models.Budget.month == month,
        db_models.Budget.year == year
    ).first()

    if existing:
        existing.monthly_limit = budget.monthly_limit
        db.commit()
        db.refresh(existing)
        return existing

    new_budget = db_models.Budget(
        user_id=current_user.id,
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        month=month,
        year=year
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    budget = db.query(db_models.Budget).filter(
        db_models.Budget.id == budget_id,
        db_models.Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"detail": "Budget deleted"}
