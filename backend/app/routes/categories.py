from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
import db_models

router = APIRouter()

# Get all categories
@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(db_models.Category).all()
    return categories

# Add a new category
@router.post("/categories")
def create_category(name: str, db: Session = Depends(get_db)):
    # Check if category already exists
    existing = db.query(db_models.Category).filter(db_models.Category.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    new_category = db_models.Category(name=name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return new_category

# Delete a category
@router.delete("/categories/{category_id}")
def delete_category_route(category_id: int, db: Session = Depends(get_db)):
    category = db.query(db_models.Category).filter(db_models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(category)
    db.commit()
    
    return {"message": "Category deleted successfully"}