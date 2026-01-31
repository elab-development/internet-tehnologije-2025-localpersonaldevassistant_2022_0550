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
    mode_id = Column(Integer, ForeignKey("modes.id"), nullable=True)  
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
   
    chat = relationship("Chat", back_populates="messages")
    
    
    mode = relationship("Mode", back_populates="messages")
    
    
    documents = relationship("Document", secondary="message_documents", back_populates="messages")
