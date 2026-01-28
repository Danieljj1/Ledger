from pydantic import BaseModel
from datetime import date
from typing import Literal, Optional


#Model for account selection
class Account(BaseModel):
    id: int
    name: str
    account_type: Optional[str] = None # e.g., 'savings', 'checking'


# Model for new financial transactions
class TransactionCreate(BaseModel):
    amount: float
    date: date
    description: str = ""
    type: Literal['income', 'expense']
    category: str

class Transaction(TransactionCreate):
    id: int
    account_id: int

