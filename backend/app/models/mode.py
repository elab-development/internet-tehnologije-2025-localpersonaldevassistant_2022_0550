# backend/app/models/assistant_type.py
class Mode(Base):
    __tablename__ = "mode"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  
    description = Column(Text, nullable=True) 
     
    
    # Relacija sa Chat tabelom 
    chats = relationship("Chat", back_populates="assistant_type")
