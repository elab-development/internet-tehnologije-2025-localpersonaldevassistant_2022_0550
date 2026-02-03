from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

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
        .order_by(Chat.created_at.desc())
        .all()
    )

    return chats
