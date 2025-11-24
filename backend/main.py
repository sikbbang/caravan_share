from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.sessions import SessionMiddleware

from app.db.database import engine, Base, SessionLocal
from app.crud.caravan import create_initial_caravans
from app.routers import caravans, users, cart as cart_router, host
from app.models import caravan, user, cart # Import models
from app.core.config import settings

app = FastAPI()

# Middlewares
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Serve frontend files
app.mount("/frontend", StaticFiles(directory="../frontend"), name="frontend")
app.mount("/static", StaticFiles(directory="static"), name="static")

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
app.include_router(users.router, prefix="/api/v1/users")
app.include_router(cart_router.router, prefix="/api/v1/cart")
app.include_router(host.router, prefix="/api/v1/host")
