from fastapi import FastAPI,HTTPException,Depends,status
# from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from pydantic import BaseModel,Field
import database.models as models
from typing import Annotated
from database import SessionLocal,engine
from sqlalchemy.orm import Session
from datetime import datetime
from  controllers import TableReservations
from database import get_db
from    controllers.schemas import User,Event

app=FastAPI()

# app.include_router(user.router)
app.include_router(TableReservations.router)
# app.include_router(event.router)

db_dependency=Annotated[Session, Depends( get_db)]

@app.post("/users",status_code=status.HTTP_201_CREATED)
async def creteUser(user:User,db:db_dependency):
    user.role="user"
    db_user=models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message":"User created","user":db_user}
    
@app.get("/",status_code=status.HTTP_200_OK)
async def getHome():
    return {
        "message":"Welcome to the Restaurant Reservation System"
    }


# POST /events
@app.post("/events",status_code=status.HTTP_201_CREATED)
async def createEvent(event:Event,db:db_dependency):
    user_id=5
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
@app.get("/events",status_code=status.HTTP_200_OK)
async def getEvents(db:db_dependency):
    events=db.query(models.User).all()
    return events

# POST /events/{id}/rsvp
@app.post("/events/{id}/rsvp",status_code=status.HTTP_201_CREATED)
async def rsvpEvent(id:int,db:db_dependency):
    user_id=1
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
@app.delete("/events/{id}/rsvp",status_code=status.HTTP_200_OK)
async def deleteRSVP(id:int,db:db_dependency):
    user_id=1
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
@app.get("/admin/events/{id}/rsvps",status_code=status.HTTP_200_OK)
async def getEventRSVPs(id:int,db:db_dependency):
    user_id=5
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




