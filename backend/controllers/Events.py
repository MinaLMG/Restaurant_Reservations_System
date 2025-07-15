from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import datetime
from  sqlalchemy.orm import Session
from database import get_db
from database import models 
from controllers.schemas import Event,UserReduced
from controllers.Users import verify_token

router =APIRouter(prefix="", tags=["Events"])

db_dependency = Annotated[Session,Depends(get_db)]

# POST /events
@router.post("/events",status_code=status.HTTP_201_CREATED)
async def createEvent(event:Event,db:db_dependency,current_user: UserReduced = Depends(verify_token)):
    user_id= current_user.id
    user=db.query(models.User).filter(models.User.id==user_id).first()
    if not user:
        raise HTTPException(status_code=400,detail="User not found")
    if(user.role!="admin"):
        raise HTTPException(status_code=400,detail="You are not an admin")
    
    if(event.capacity<=0):
        raise HTTPException(status_code=400,detail="The capacity is not a valid number")
    
    if  (event.date<datetime.now().strftime("%Y-%m-%d")):
        raise HTTPException(status_code=400,detail="The date is not a valid date") 

    db_event=db.query(models.Event).filter(models.Event.name==event.name).first()
    if db_event:
        raise HTTPException(status_code=400,detail="Event already exists")
    
    event.remaining_capacity=event.capacity
    db_event=models.Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return {"message":"Event created",
            "event":db_event}

# GET /events
@router.get("/events",status_code=status.HTTP_200_OK)
async def getEvents(db:db_dependency,current_user: UserReduced = Depends(verify_token)):
    events=db.query(models.Event).all()
    return events

# POST /events/{id}/rsvp
@router.post("/events/{id}/rsvp",status_code=status.HTTP_201_CREATED)
async def rsvpEvent(id:int,db:db_dependency,current_user: UserReduced = Depends(verify_token)):
    user_id=current_user.id
    user=db.query(models.User).filter(models.User.id==user_id).first()
    if not user:
        raise HTTPException(status_code=400,detail="User not found")
    
    db_event=db.query(models.Event).filter(models.Event.id==id).first()
    if not db_event:
        raise HTTPException(status_code=400,detail="Event not found")
    
    if(db_event.remaining_capacity<=0):
        raise HTTPException(status_code=400,detail="The event is already full")
    
    db_event_reservation=db.query(models.EventReservation).filter(models.EventReservation.event_id==id,models.EventReservation.user_id==user_id).first()
    if db_event_reservation:
        raise HTTPException(status_code=400,detail="You have already RSVPed for this event")
    
    db_event_reservation=models.EventReservation(event_id=id,user_id=user_id)

    db_event.remaining_capacity-=1
    db.query(models.Event).filter(models.Event.id==id).update({"remaining_capacity":db_event.remaining_capacity})
    
    db.add(db_event_reservation)
    db.commit()
    return {"message":"RSVP created"}

# DELETE /events/{id}/rsvp
@router.delete("/events/{id}/rsvp",status_code=status.HTTP_200_OK)
async def deleteRSVP(id:int,db:db_dependency,current_user: UserReduced = Depends(verify_token)):
    user_id=current_user.id
    user=db.query(models.User).filter(models.User.id==user_id).first()
    if not user:
        raise HTTPException(status_code=400,detail="User not found")
    
    event  =db.query(models.Event).filter(models.Event.id==id).first()
    if not event:
        raise HTTPException(status_code=400,detail="Event not found")
    
    db_event_reservation=db.query(models.EventReservation).filter(models.EventReservation.event_id==id,models.EventReservation.user_id==user_id).first()
    if not db_event_reservation:
        raise HTTPException(status_code=400,detail="You have not RSVPed for this event")
    
    event.remaining_capacity+=1
    db.query(models.Event).filter(models.Event.id==id).update({"remaining_capacity":event.remaining_capacity})

    db.delete(db_event_reservation)
    
    db.commit()
    return {"message":"RSVP deleted"}
    
# GET /admin/events/{id}/rsvps
@router.get("/admin/events/{id}/rsvps",status_code=status.HTTP_200_OK)
async def getEventRSVPs(id:int,db:db_dependency,current_user: UserReduced = Depends(verify_token)):
    user_id = current_user.id
    user=db.query(models.User).filter(models.User.id==user_id).first()
    
    if not user:
        raise HTTPException(status_code=400,detail="User not found")
    
    if(user.role!="admin"):
        raise HTTPException(status_code=400,detail="You are not an admin")
    
    db_event=db.query(models.Event).filter(models.Event.id==id).first()
    if not db_event:
        raise HTTPException(status_code=400,detail="Event not found")
    
    db_event_reservations=db.query(models.EventReservation).filter(models.EventReservation.event_id==id).all()
    return db_event_reservations

# GET /events/me
@router.get("/events/me", status_code=status.HTTP_200_OK)
async def getUserEventReservations(db: db_dependency, current_user: UserReduced = Depends(verify_token)):
    user_id = current_user.id
    
    # Get user's event reservations with event details
    reservations = (
        db.query(models.EventReservation, models.Event)
        .join(models.Event, models.EventReservation.event_id == models.Event.id)
        .filter(models.EventReservation.user_id == user_id)
        .all()
    )
    
    return [
        {
            "id": reservation.id,
            "event_id": reservation.event_id,
            "title": event.name, 
            "description": event.description,
            "event_date": event.date, 
            "capacity": event.capacity
        }
        for reservation, event in reservations
    ]




