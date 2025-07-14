from    fastapi import FastAPI,HTTPException,Depends,status
from    fastapi.security import OAuth2PasswordBearer
import  database.models as models
from    typing import Annotated
from    sqlalchemy.orm import Session
from    datetime import  timedelta,datetime,timezone
from    controllers import TableReservations,Users,Events
from    database import get_db
from    controllers.schemas import User,Event,UserReduced
from    dotenv import load_dotenv
import  os
import  jwt
from    fastapi.middleware.cors import CORSMiddleware
from    pydantic import BaseModel
from    passlib.context import CryptContext
from    controllers.Users import verify_token




app = FastAPI()

# Add this block
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

app.include_router(Users.router)
app.include_router(TableReservations.router)
app.include_router(Events.router)

db_dependency=Annotated[Session, Depends( get_db)]


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")



@app.get("/",status_code=status.HTTP_200_OK)
async def getHome():
    return {
        "message":"Welcome to the Restaurant Reservation System"
    }
