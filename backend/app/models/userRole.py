from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(Base):
    __tablename__ = "user_role"
    
    id = Column(String, primary_key=True)  
    role_name = Column(String, nullable=False)  
    
    # relacija sa User tabelom
    users = relationship("User", back_populates="role")
