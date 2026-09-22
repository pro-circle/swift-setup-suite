"""FastAPI application entry point."""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import tickets

load_dotenv()

app = FastAPI(title="Support Ticket Tracker API", version="1.0.0")

# Comma-separated list of allowed frontend origins.
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins.split(",") if origin.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router)


@app.get("/health")
def health():
    return {"status": "ok"}
