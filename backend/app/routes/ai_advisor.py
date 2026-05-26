from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from openai import OpenAI
from database import get_db
import db_models
from app.routes.auth import get_current_user
import os

router = APIRouter()


@router.get("/ai-advisor")
def get_ai_advice(
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    accounts = db.query(db_models.Account).filter(
        db_models.Account.user_id == current_user.id
    ).all()

    if not accounts:
        return {"advice": "No accounts found. Add some transactions to get personalized financial advice!", "summary": {}}

    all_txns = []
    for acc in accounts:
        txns = db.query(db_models.Transaction).filter(
            db_models.Transaction.account_id == acc.id
        ).all()
        all_txns.extend(txns)

    if not all_txns:
        return {"advice": "No transactions yet. Start logging your income and expenses to get AI-powered financial insights!", "summary": {}}

    category_spending = {}
    total_income = 0
    total_expenses = 0
    for t in all_txns:
        if t.type == "expense":
            category_spending[t.category] = category_spending.get(t.category, 0) + t.amount
            total_expenses += t.amount
        else:
            total_income += t.amount

    summary = {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net": round(total_income - total_expenses, 2),
        "spending_by_category": {k: round(v, 2) for k, v in sorted(category_spending.items(), key=lambda x: x[1], reverse=True)},
        "transaction_count": len(all_txns)
    }

    spending_lines = "\n".join([f"  - {cat}: ${amt}" for cat, amt in summary["spending_by_category"].items()])
    prompt = f"""You are a personal finance advisor. Analyze this user's financial data and give 3-5 specific, actionable tips.

Financial Summary:
- Total Income: ${summary['total_income']}
- Total Expenses: ${summary['total_expenses']}
- Net (Income - Expenses): ${summary['net']}
- Number of Transactions: {summary['transaction_count']}

Spending by Category:
{spending_lines}

Give concise, practical advice. Be encouraging but honest. Format as numbered tips. Keep it under 200 words."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful personal finance advisor. Give specific, actionable advice based on the user's actual spending data."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.7
        )
        advice = response.choices[0].message.content.strip()
    except Exception as e:
        advice = f"Unable to generate AI advice at this time. Your net balance is ${summary['net']}. {'You are saving money!' if summary['net'] >= 0 else 'You are spending more than you earn - consider reducing expenses.'}"

    return {"advice": advice, "summary": summary}
