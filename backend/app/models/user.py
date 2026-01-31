from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password = Column(String, nullable=False)  # Hashovan password (bcrypt)
    role_id = Column(String, ForeignKey("user_roles.id"), default="standard_user", nullable=False)
    
    #relacija sa UserRole tabelom
    role = relationship("UserRole", back_populates="users")
    
    #relacija sa Chat tabelom
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")
