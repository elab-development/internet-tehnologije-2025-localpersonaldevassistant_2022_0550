from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.document import DocumentResponse

class MessageCreate(BaseModel):
    chat_id: int
    content: str
    mode_id: int

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    content: str
    role: str
    timestamp: datetime
    mode_id: Optional[int]
    documents: List[DocumentResponse] = []

    class Config:
        from_attributes = True