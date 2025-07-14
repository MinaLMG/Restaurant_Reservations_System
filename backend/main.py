
from    controllers import TableReservations,Users,Events
from    fastapi import FastAPI,status
from    fastapi.middleware.cors import CORSMiddleware




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



@app.get("/",status_code=status.HTTP_200_OK)
async def getHome():
    return {
        "message":"Welcome to the Restaurant Reservation System"
    }
