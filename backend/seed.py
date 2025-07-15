from    faker import Faker
from    sqlalchemy.orm import Session
from    database import SessionLocal
import  database.models as models
import  random
from    datetime import datetime, timedelta
from    passlib.context import CryptContext
from    database import Base

fake = Faker()

from database import engine

Base.metadata.create_all(bind=engine)

db: Session = SessionLocal()    

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# for i in range(5):
#     user = models.User(
#         username=fake.user_name(),
#         password=pwd_context.hash( fake.password()), 
#         role= "admin" if i==4 else "user"
#     )
#     db.add(user)


for i in range(20):
    table = models.Table(
        table_no =  i + 1,
        capacity=random.choice([i for i in range(5,10)])
    )
    db.add(table)

base_time = datetime.now().replace(minute=0, second=0, microsecond=0)
for i in range(3):
    for j in range(10):
        slot_time = base_time + timedelta(days=base_time.day+ i, hours=j+12)
        slot = models.Slot(
            start_time=slot_time,
            end_time=slot_time + timedelta(hours=1)
        )
        db.add(slot)

for i in range(4):
    cap=  random.choice([j for j in range(20,40)])
    events = models.Event(
    name = fake.name(),
    description =   fake.text(),
    date =  fake.date(),
    capacity = cap,
    remaining_capacity = cap 

    )
    db.add(events)


db.commit()
db.close()
