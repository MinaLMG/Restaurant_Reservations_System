from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from database import models
from controllers.schemas import TableReservation,UserReduced
from controllers.Users import verify_token


router = APIRouter(prefix="", tags=["TableReservations"])

db_dependency = Annotated[Session, Depends(get_db)]

# POST /reservations
@router.post("/reservations",status_code=status.HTTP_201_CREATED)
async def createReservation(reservation:TableReservation,db:db_dependency,current_user: UserReduced = Depends(verify_token)):    
    reservation.user_id=current_user.id
    
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
    db.refresh(db_reservation) 
    return {"message":"Reservation created",
            "reservation":db_reservation}

# GET /reservations
@router.get("/reservations",status_code=status.HTTP_200_OK)
async def getReservations(db:db_dependency,current_user: UserReduced = Depends(verify_token)):    
    user_id=current_user.id
    db_reservations=db.query(models.TableReservation).filter(models.TableReservation.user_id==user_id).all()
    return db_reservations

# DELETE /reservations/{id}
@router.delete("/reservations/{id}",status_code=status.HTTP_200_OK)
async def deleteReservation(id:int,db:db_dependency,current_user: UserReduced = Depends(verify_token)):    
    user_id=current_user.id
    db_reservation=db.query(models.TableReservation).filter(models.TableReservation.id==id,models.TableReservation.user_id==user_id).first()
    if not db_reservation:
        raise HTTPException(status_code=400,detail="Reservation not found")
    db.delete(db_reservation)
    db.commit()
    return {"message":"Reservation deleted",
            "reservation":db_reservation}    

# GET /admin/reservations
@router.get("/admin/reservations",status_code=status.HTTP_200_OK)
async def getAdminReservations(db:db_dependency,current_user: UserReduced = Depends(verify_token)):
    user_id=current_user.id
    user=db.query(models.User).filter(models.User.id==user_id).first()
    if not user:
        raise HTTPException(status_code=400,detail="User not found")
    if(user.role!="admin"):
        raise HTTPException(status_code=400,detail="You are not an admin")    
    db_reservations=db.query(models.TableReservation).all()
    return db_reservations


# GET /user/reservations
@router.get("/user/reservations", status_code=status.HTTP_200_OK)
async def getUserReservations(db: db_dependency, current_user: UserReduced = Depends(verify_token)):
    reservations = (
        db.query(
            models.TableReservation.id,
            models.TableReservation.table_id,
            models.TableReservation.slot_id,
            models.TableReservation.capacity,
            models.Table.table_no,
            models.Slot.start_time,
            models.Slot.end_time
        )
        .join(models.Table, models.TableReservation.table_id == models.Table.id)
        .join(models.Slot, models.TableReservation.slot_id == models.Slot.id)
        .filter(models.TableReservation.user_id == current_user.id)
        .all()
    )
    
    return [
        {
            "id": res.id,
            "table_id": res.table_id,
            "slot_id": res.slot_id,
            "capacity": res.capacity,
            "table_no": res.table_no,
            "start_time": res.start_time,
            "end_time": res.end_time
        }
        for res in reservations
    ]