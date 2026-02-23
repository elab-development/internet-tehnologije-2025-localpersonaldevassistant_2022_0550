from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.chat import Chat
from app.models.user import User
from app.models.message import Message
from app.models.document import Document
from app.schemas.chat import ChatResponse
from app.utils.deps import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

class ChatUpdate(BaseModel):
    title: str

@router.post("/create", response_model=ChatResponse, summary="Kreiranje novog četa", description="Inicijalizuje novu sesiju razgovora za ulogovanog korisnika.")
def create_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()
    new_chat = Chat(
        user_id=current_user.id,
        title="New chat",
        created_at=now,
        updated_at=now
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return new_chat

@router.get("/get-all", response_model=List[ChatResponse], summary="Istorija svih četova", description="Vraća listu svih sesija razgovora trenutnog korisnika, poređanih od najnovijih.")
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

@router.get("/{chat_id}", response_model=ChatResponse, summary="Detalji jednog četa", description="Vraća punu istoriju poruka za određeni čet, uključujući i metapodatke o fajlovima.")
def get_chat_by_id(
    chat_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = (
        db.query(Chat)
        .options(
            joinedload(Chat.messages).joinedload(Message.documents)
        ) 
        .filter(Chat.id == chat_id, Chat.user_id == current_user.id)
        .first()
    )
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or you don't have access"
        )
        
    return chat

@router.patch("/{chat_id}", response_model=ChatResponse, summary="Promena naslova četa", description="Ažurira naziv sesije razgovora (npr. preimenovanje 'New chat' u smisleniji naslov).")
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

@router.delete("/{chat_id}", summary="Brisanje četa", description="Trajno briše čet, sve njegove poruke i reference na dokumente iz baze podataka.")
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat ne postoji")

    messages = db.query(Message).filter(Message.chat_id == chat_id).all()
    
    document_ids = []
    for msg in messages:
        for doc in msg.documents:
            document_ids.append(doc.id)

    db.delete(chat)

    if document_ids:
        db.query(Document).filter(Document.id.in_(document_ids)).delete(synchronize_session=False)
        
    db.commit()
    
    return {"status": "success", "message": "Chat, poruke i svi pripadajući fajlovi su obrisani iz baze."}