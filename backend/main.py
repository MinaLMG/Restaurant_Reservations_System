from controllers import table_reservations,users,events,others
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

app.include_router(users.router)
app.include_router(table_reservations.router)
app.include_router(events.router)
app.include_router(others.router)



@app.get("/", status_code=status.HTTP_200_OK)
async def getHome():
    return {
        "message": "Welcome to the Restaurant Reservation System"
    }
