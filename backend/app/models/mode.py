from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Mode(Base):
    __tablename__ = "modes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  
    description = Column(Text, nullable=True)  
    
    # Relacija sa Message tabelom (one-to-many)
    messages = relationship("Message", back_populates="mode")
