from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm,OAuth2PasswordBearer
from datetime import timedelta,datetime,timezone
from  sqlalchemy.orm import Session
from controllers.schemas import User,Token
from database import get_db
from database import models 
from passlib.context import CryptContext
import os
from controllers.schemas import UserReduced
import jwt

router = APIRouter(prefix="", tags=["Users"])

db_dependency = Annotated[Session,Depends(get_db)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
SECRET_KEY =os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db:db_dependency, username: str, password: str):
    user = db.query(models.User).filter(models.User.username==username).first()
    if not user:
        return False
    if not pwd_context.verify(password,user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(db:db_dependency,token: str = Depends(oauth2_scheme) ) -> UserReduced:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None :
            raise HTTPException(status_code=401, detail="Invalid token")
        db_user = db.query( models.User).filter(models.User.username==username ).first()
        if db_user is None :
            raise HTTPException(status_code=401, detail="Invalid token")
        ret = UserReduced(username=db_user.username ,role= db_user.role,id=db_user.id) 
        return ret
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
# POST /auth/register:
@router.post("/auth/register",status_code=status.HTTP_201_CREATED)
async def creteUser(user:User,db:db_dependency):
    db_user=db.query(models.User).filter(models.User.username==user.username).first()
    if db_user:
        raise HTTPException(status_code=400,detail="Username already exists")
    user.role="user"
    user.password=get_password_hash(user.password)
    db_user=models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    del db_user.password
    return {"message":"User created successfully","user":db_user}

# POST /auth/login
@router.post("/auth/login")
async def login_for_access_token(db:db_dependency ,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = authenticate_user(db, form_data.username,form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"username": user.username,"role" : user.role,"id":user.id}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

# GET /users/me
@router.get("/users/me",status_code=status.HTTP_200_OK)
async def getMe(db:db_dependency,current_user: UserReduced = Depends(verify_token)):
    user=db.query(models.User).filter(models.User.username==current_user.username).first()
    del user.password
    return user
