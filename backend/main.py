from fastapi import FastAPI,HTTPException,Depends,status
# from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from pydantic import BaseModel
import models
from typing import Annotated
from database import SessionLocal,engine
from sqlalchemy.orm import Session

app=FastAPI()
models.Base.metadata.create_all(bind=engine)

class User(BaseModel):
    username:str
    password:str

class Table(BaseModel):
    table_no:int
    capacity:int

class slot(BaseModel):
    start_time :str
    end_time :str
    MAX_PARTY_Size : int

def get_db():
    db=SessionLocal()
    try:
        yield db 
    finally:
        db.close()

db_dependency=Annotated[Session, Depends( get_db)]

# @app.post("/users",status_code=status.HTTP_201_CREATED)
# async def creteUser(user:User,db:db_dependency):
#     db_user=models.User(**user.model_dump())
#     db.add(db_user)
#     db.commit()
    
@app.get("/",status_code=status.HTTP_200_OK)
async def getHome(status_code=status.HTTP_200_OK):
    return {
        "message":"Welcome to the Restaurant Reservation System"
    }