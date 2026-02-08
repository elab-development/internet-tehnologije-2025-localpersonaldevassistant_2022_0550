from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(String, primary_key=True)  
    role_name = Column(String, nullable=False, unique=True)  
    
    # relacija sa User tabelom
    users = relationship("User", back_populates="role")
