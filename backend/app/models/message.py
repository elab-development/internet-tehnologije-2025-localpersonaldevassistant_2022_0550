from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    content = Column(Text, nullable=False)  
    role = Column(String, nullable=False)  
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacija sa Chat tabelom (many-to-one)
    chat = relationship("Chat", back_populates="messages")
    
    #Relacija sa File tabelom (one-to-many) - opciono, za kasnije
    files = relationship("File", back_populates="message", cascade="all, delete-orphan")
    #Relacija sa Mode tabelom
    mode = relationship("Mode", back_populates="messages")
