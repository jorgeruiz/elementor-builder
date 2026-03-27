from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Elementor Builder API",
    version="1.0.0",
    description="Convierte diseños HTML en JSON válido para Elementor Pro v3",
)

cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import health, analyze, generate

app.include_router(health.router, tags=["health"])
app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(generate.router, prefix="/generate", tags=["generate"])
app.include_router(generate.download_router, tags=["download"])
