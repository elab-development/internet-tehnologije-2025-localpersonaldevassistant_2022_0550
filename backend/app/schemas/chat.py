from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.message import MessageResponse

class ChatResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True