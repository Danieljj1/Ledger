from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Optional
from app.models import TransactionCreate
from database import get_db
import db_models
from app.routes.auth import get_current_user  

router = APIRouter()

# Get summary for an account
@router.get("/transactions/summary")
def get_account_summary(
    account_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)  
):
    # Check if account exists AND belongs to current user
    account = db.query(db_models.Account).filter(
        db_models.Account.id == account_id,
        db_models.Account.user_id == current_user.id  
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Query transactions for this account
    query = db.query(db_models.Transaction).filter(db_models.Transaction.account_id == account_id)
    
    # Apply date filters
    if start_date:
        query = query.filter(db_models.Transaction.date >= datetime.fromisoformat(start_date).date())
    if end_date:
        query = query.filter(db_models.Transaction.date <= datetime.fromisoformat(end_date).date())
    
    all_transactions = query.all()
    
    # Calculate summary
    income = sum(t.amount for t in all_transactions if t.type == 'income')
    expense = sum(t.amount for t in all_transactions if t.type == 'expense')
    
    return {
        "income": income,
        "expense": expense,
        "net": income - expense,
        "count": len(all_transactions),
    }

# Get all transactions for an account
@router.get("/transactions")
def get_transactions(
    account_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)  
):
    # Check if account exists AND belongs to current user
    account = db.query(db_models.Account).filter(
        db_models.Account.id == account_id,
        db_models.Account.user_id == current_user.id  
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Query transactions for this account
    query = db.query(db_models.Transaction).filter(db_models.Transaction.account_id == account_id)
    
    # Apply date filters
    if start_date:
        query = query.filter(db_models.Transaction.date >= datetime.fromisoformat(start_date).date())
    if end_date:
        query = query.filter(db_models.Transaction.date <= datetime.fromisoformat(end_date).date())
    
    return query.all()

# Create a new transaction
@router.post("/transactions")
def create_transaction(
    account_id: int, 
    transaction: TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)  
):
    # Check if account exists AND belongs to current user
    account = db.query(db_models.Account).filter(
        db_models.Account.id == account_id,
        db_models.Account.user_id == current_user.id  
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    new_transaction = db_models.Transaction(
        account_id=account_id,
        amount=transaction.amount,
        date=transaction.date,
        description=transaction.description,
        type=transaction.type,
        category=transaction.category
    )
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    return new_transaction

# Get one transaction by id
@router.get("/transactions/{transaction_id}")
def get_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)  
):
    # Join with Account to verify ownership
    transaction = db.query(db_models.Transaction).join(
        db_models.Account
    ).filter(
        db_models.Transaction.id == transaction_id,
        db_models.Account.user_id == current_user.id  
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction

# Update a transaction
@router.put("/transactions/{transaction_id}")
def update_transaction_route(
    transaction_id: int, 
    updated_data: dict, 
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)  
):
    # Join with Account to verify ownership
    transaction = db.query(db_models.Transaction).join(
        db_models.Account
    ).filter(
        db_models.Transaction.id == transaction_id,
        db_models.Account.user_id == current_user.id  
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update fields
    for key, value in updated_data.items():
        if hasattr(transaction, key):
            setattr(transaction, key, value)
    
    db.commit()
    db.refresh(transaction)
    
    return transaction

# Delete a transaction
@router.delete("/transactions/{transaction_id}")
def delete_transaction_route(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)  
):
    # Join with Account to verify ownership
    transaction = db.query(db_models.Transaction).join(
        db_models.Account
    ).filter(
        db_models.Transaction.id == transaction_id,
        db_models.Account.user_id == current_user.id  
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    
    return {"detail": "Transaction deleted successfully"}