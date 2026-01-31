from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Association table za many-to-many relaciju između Message i Document
message_documents = Table(
    'message_documents',
    Base.metadata,
    Column('message_id', Integer, ForeignKey('messages.id'), primary_key=True),
    Column('document_id', Integer, ForeignKey('documents.id'), primary_key=True)
)

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)  
    path = Column(String, nullable=False)  
    file_type = Column(String, nullable=True)  
    #file_size = Column(Integer, nullable=True)  # Veličina fajla u bajtovima
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacija sa Message tabelom (many-to-many)
    messages = relationship("Message", secondary=message_documents, back_populates="documents")
