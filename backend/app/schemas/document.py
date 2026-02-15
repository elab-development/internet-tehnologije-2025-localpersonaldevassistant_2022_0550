from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentResponse(BaseModel):
    id: int
    title: str
    file_type: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True