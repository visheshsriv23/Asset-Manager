from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.database import Base, engine, SessionLocal
from app.routers import auth, dashboard, assets, employees
from app import models

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    auth.init_default_admin(db)

app = FastAPI(title="Asset Management Portal API", version="1.0.0")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(assets.router)
app.include_router(employees.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Asset Management Portal API!"}