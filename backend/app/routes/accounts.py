from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
import db_models
from app.routes.auth import get_current_user

router = APIRouter()

# Get all accounts for the current user
@router.get("/accounts")
def get_accounts(
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    accounts = db.query(db_models.Account).filter(
        db_models.Account.user_id == current_user.id
    ).all()
    return accounts

# Add a new account for the current user
@router.post("/accounts")
def create_account(
    name: str, 
    account_type: str, 
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    new_account = db_models.Account(
        name=name, 
        type=account_type,
        user_id=current_user.id  # Associate with current user
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account

# Delete an account (only if it belongs to current user)
@router.delete("/accounts/{account_id}")
def delete_account_route(
    account_id: int, 
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    account = db.query(db_models.Account).filter(
        db_models.Account.id == account_id,
        db_models.Account.user_id == current_user.id  # Only delete own accounts
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(account)
    db.commit()
    return {"message": "Account deleted successfully"}