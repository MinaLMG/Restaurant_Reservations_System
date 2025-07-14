from sqlalchemy import Boolean,Column, Integer , String
from database import Base

class User(Base):
    __tablename__ ='users'
    id = Column(Integer,primary_key=True)
    username = Column(String(30),unique=True)
    # email = Column(String,unique=True)
    password = Column(String(100))

class event(Base):
    __tablename__ = 'events'
    id = Column(Integer,primary_key=True)
    name = Column(String(50))
    description = Column(String(200))
    date = Column(String(20))
    capacity = Column(Integer)

class Table(Base):
    __tablename__ = 'tables'
    id = Column(Integer,primary_key=True)
    table_no = Column(Integer)
    capacity = Column(Integer)

class Slot(Base):
    __tablename__ = 'slots'
    id = Column(Integer,primary_key=True)
    start_time = Column(String(20))
    end_time = Column(String(20))
    MAX_PARTY_Size= Column(Integer)

class TableReservation(Base):
    __tablename__ = 'tablereservations'
    id = Column(Integer,primary_key=True)
    table_id = Column(Integer)
    slot_id = Column(Integer)
    capacity = Column(Integer)

class EventReservation(Base):
    __tablename__ = 'eventreservations'
    id = Column(Integer,primary_key=True)
    table_id = Column(Integer)
    event_id = Column(Integer)
    capacity = Column(Integer)


