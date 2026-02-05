from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.chat import Chat
from app.models.user import User
from app.schemas.chat import ChatResponse
from app.utils.deps import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("/create", response_model=ChatResponse)
def create_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_chat = Chat(
        user_id=current_user.id,
        title="New chat"
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return new_chat


@router.get("/get-all", response_model=List[ChatResponse])
def get_all_user_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(Chat.updated_at.desc())
        .all()
    )

    return chats


@router.get("/{chat_id}", response_model=ChatResponse)
def get_chat_by_id(
    chat_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or you don't have access"
        )
        
    return chat

class ChatUpdate(BaseModel):
    title: str
    
    
@router.patch("/{chat_id}", response_model=ChatResponse)
def update_chat_title(
    chat_id: int,
    update_data: ChatUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    chat.title = update_data.title
    chat.updated_at = datetime.now()
    db.commit()
    db.refresh(chat)
    return chat

@router.delete("/{chat_id}")
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    db.delete(chat)
    db.commit()
    return {"message": "Chat successfully deleted"}