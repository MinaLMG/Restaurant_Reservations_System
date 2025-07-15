from sqlalchemy import Boolean, Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(30), unique=True)
    password = Column(String(100))
    role = Column(String(10))

class Event(Base):
    __tablename__ = 'events'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    description = Column(String(200))
    date = Column(String(20))
    capacity = Column(Integer)
    remaining_capacity = Column(Integer)

class Table(Base):
    __tablename__ = 'tables'
    id = Column(Integer, primary_key=True)
    table_no = Column(Integer)
    capacity = Column(Integer)

class Slot(Base):
    __tablename__ = 'slots'
    id = Column(Integer, primary_key=True)
    start_time = Column(String(20))
    end_time = Column(String(20))

class TableReservation(Base):
    __tablename__ = 'table_reservations'
    id = Column(Integer, primary_key=True)
    table_id = Column(Integer)
    slot_id = Column(Integer)
    capacity = Column(Integer)
    user_id = Column(Integer)

class EventReservation(Base):
    __tablename__ = 'event_reservations'
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer)    
    user_id = Column(Integer)

