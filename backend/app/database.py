from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database path (app.db file will be created in backend/)
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

# Create engine with SQLite-specific config
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# SessionLocal class for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

# Dependency for FastAPI routes to get DB session
def get_db():
    """
    Creates a database session for each request.
    Automatically closes session after request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
