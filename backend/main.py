from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.db.database import engine, Base, SessionLocal
from app.crud.caravan import create_initial_caravans
from app.routers import caravans

app = FastAPI()

# Serve frontend files
app.mount("/frontend", StaticFiles(directory="../frontend"), name="frontend")

# CORS (Cross-Origin Resource Sharing)
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://127.0.0.1:5500",  # For Live Server in VSCode
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with SessionLocal() as db:
        await create_initial_caravans(db)

@app.get("/")
async def read_root():
    return FileResponse('../frontend/index.html')

# Include your routers here
app.include_router(caravans.router, prefix="/api/v1")
