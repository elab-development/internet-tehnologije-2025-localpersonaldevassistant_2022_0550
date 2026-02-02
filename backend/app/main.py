

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth


app = FastAPI(
    title="Local Personal Dev Assistant API",
    description="Backend API for Local Personal Dev Assistant ",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)



origins = [

    "http://localhost:5173",    
    "http://localhost:3000",  
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",  
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth.router)



@app.get("/")
def read_root():
    """Root endpoint - Health check."""
    return {
        "message": "Local Personal Dev Assistant API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }



@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected"
    }
