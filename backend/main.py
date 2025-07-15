from controllers import TableReservations, Users, Events, Other
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

allowed = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #  temporarily
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

app.include_router(Users.router)
app.include_router(TableReservations.router)
app.include_router(Events.router)
app.include_router(Other.router)



@app.get("/", status_code=status.HTTP_200_OK)
async def getHome():
    return {
        "message": "Welcome to the Restaurant Reservation System"
    }
