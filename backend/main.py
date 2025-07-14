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
    role:str

class Table(BaseModel):
    table_no:int
    capacity:int

class slot(BaseModel):
    start_time :str
    end_time :str

class TableReservation(BaseModel):
    table_id :int
    slot_id :int
    capacity :int
    user_id : int | None = None

def get_db():
    db=SessionLocal()
    try:
        yield db 
    finally:
        db.close()

db_dependency=Annotated[Session, Depends( get_db)]

# @app.post("/users",status_code=status.HTTP_201_CREATED)
# async def creteUser(user:User,db:db_dependency):
#     user.role="user"
#     db_user=models.User(**user.model_dump())
#     db.add(db_user)
#     db.commit()
    
@app.get("/",status_code=status.HTTP_200_OK)
async def getHome():
    return {
        "message":"Welcome to the Restaurant Reservation System"
    }

# POST /reservations
@app.post("/reservations",status_code=status.HTTP_201_CREATED)
async def createReservation(reservation:TableReservation,db:db_dependency):    
    reservation.user_id=1
    
    #checking both the slot and table exist and not rserved at this slot
    db_table=db.query(models.Table).filter(models.Table.id==reservation.table_id).first()
    if not db_table:
        raise HTTPException(status_code=400,detail="Table not found")
    
    db_slot=db.query(models.Slot).filter(models.Slot.id==reservation.slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=400,detail="Slot not found")
    
    db_reservation=db.query(models.TableReservation).filter(models.TableReservation.table_id==reservation.table_id,models.TableReservation.slot_id==reservation.slot_id).first()
    if db_reservation:
        raise HTTPException(status_code=400,detail="The table is already reserved at this slot")
    
    
    if(reservation.capacity>db_table.capacity):
        raise HTTPException(status_code=400,detail="The table capacity is not enough")
    
    if(reservation.capacity<=0):
        raise HTTPException(status_code=400,detail="The capacity is not a valid number")
    

    # Join TableReservation and Slot, and check if the user already reserved any slot with same start_time
    db_user_reserved_in_same_slot = (
        db.query(models.TableReservation)
        .filter(models.TableReservation.slot_id == reservation.slot_id,
                models.TableReservation.user_id == reservation.user_id) 
        .first())

    if db_user_reserved_in_same_slot:
        raise HTTPException(
        status_code=400,
        detail="You have already reserved a table at this slot")
    
    db_reservation=models.TableReservation(**reservation.model_dump())

    db.add(db_reservation)
    db.commit()


# GET /reservations
@app.get("/reservations",status_code=status.HTTP_200_OK)
async def getReservations(db:db_dependency):    
    user_id=1
    db_reservations=db.query(models.TableReservation).filter(models.TableReservation.user_id==user_id).all()
    return db_reservations

# DELETE /reservations/{id}
@app.delete("/reservations/{id}",status_code=status.HTTP_200_OK)
async def deleteReservation(id:int,db:db_dependency):    
    user_id=1
    db_reservation=db.query(models.TableReservation).filter(models.TableReservation.id==id,models.TableReservation.user_id==user_id).first()
    if not db_reservation:
        raise HTTPException(status_code=400,detail="Reservation not found")
    db.delete(db_reservation)
    db.commit()
    return {"message":"Reservation deleted",
            "reservation":db_reservation}    
# GET /admin/reservations
@app.get("/admin/reservations",status_code=status.HTTP_200_OK)
async def getAdminReservations(db:db_dependency):
    user_id=5
    user=db.query(models.User).filter(models.User.id==user_id).first()
    if not user:
        raise HTTPException(status_code=400,detail="User not found")
    if(user.role!="admin"):
        raise HTTPException(status_code=400,detail="You are not an admin")    
    db_reservations=db.query(models.TableReservation).all()
    return db_reservations
