from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from database import models
from controllers.schemas import Table, UserReduced
from controllers.users import verify_token

router = APIRouter(prefix="", tags=["Tables"])

db_dependency = Annotated[Session, Depends(get_db)]

# GET /tables
@router.get("/tables", status_code=status.HTTP_200_OK)
async def get_tables(db: db_dependency, current_user: UserReduced = Depends(verify_token)):
    tables = db.query(models.Table).all()
    return tables


# GET /slots
@router.get("/slots", status_code=status.HTTP_200_OK)
async def get_slots(db: db_dependency, current_user: UserReduced = Depends(verify_token)):
    slots = db.query(models.Slot).all()
    return slots
