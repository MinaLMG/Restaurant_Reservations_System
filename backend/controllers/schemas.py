from pydantic import BaseModel,Field


class User(BaseModel):
    username:str
    password:str
    role:str

class UserReduced(BaseModel):
    username:str
    role:str
    id:int

class Table(BaseModel):
    table_no:int
    capacity:int =Field(gt=0) 

class slot(BaseModel):
    start_time :str
    end_time :str

class TableReservation(BaseModel):
    table_id :int
    slot_id :int
    capacity :int =Field(gt=0)
    user_id : int | None = None
    class Config:
        orm_mode = True 

class Event(BaseModel):
    name :str
    description :str
    date :str
    capacity :int =Field(gt=0)
    remaining_capacity :int

class EventReservation(BaseModel):
    event_id :int
    user_id : int | None = None

class Token(BaseModel):
    access_token: str
    token_type: str