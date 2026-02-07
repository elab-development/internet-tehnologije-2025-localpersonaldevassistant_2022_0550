from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.message import Message
from app.models.mode import Mode
from app.schemas.message import MessageCreate, MessageResponse
import ollama

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/send", response_model=MessageResponse)
async def send_message(data: MessageCreate, db: Session = Depends(get_db)):
    db_mode = db.query(Mode).filter(Mode.id == data.mode_id).first()
    
    system_instructions = db_mode.description if db_mode and db_mode.description else "You are a helpful AI assistant."

    user_msg = Message(
        chat_id=data.chat_id,
        content=data.content,
        role="user",
        mode_id=data.mode_id
    )
    db.add(user_msg)
    db.commit()

    try:
        response = ollama.chat(model='llama3.2:1b', messages=[
            {'role': 'system', 'content': system_instructions},
            {'role': 'user', 'content': data.content},
        ])
        
        ai_content = response['message']['content']

        ai_msg = Message(
            chat_id=data.chat_id,
            content=ai_content,
            role="assistant",
            mode_id=data.mode_id
        )
        db.add(ai_msg)

        from app.models.chat import Chat
        chat = db.query(Chat).filter(Chat.id == data.chat_id).first()
        if chat:
            chat.updated_at = datetime.now()


        db.commit()
        db.refresh(ai_msg)

        return ai_msg

    except Exception as e:
        print(f"Ollama error: {e}")
        raise HTTPException(status_code=500, detail="Ollama is not responding. Is the app running?")

@router.get("/modes")
def fetch_modes(db: Session = Depends(get_db)):
    return db.query(Mode).all()


# Za guest-a
@router.post("/send-anonymous")
async def send_message_anonymous(
    content: str = Body(...),
    mode_id: int = Body(default=4),
    db: Session = Depends(get_db)
):
    
    
    
    db_mode = db.query(Mode).filter(Mode.id == 4).first()
    system_instructions = db_mode.description if db_mode and db_mode.description else "You are a helpful AI assistant."
    
    try:
        
        response = ollama.chat(model='llama3.2:1b', messages=[
            {'role': 'system', 'content': system_instructions},
            {'role': 'user', 'content': content},
        ])
        
        ai_content = response['message']['content']
        
       
        return {
            "content": ai_content,
            "role": "assistant"
        }
    
    except Exception as e:
        print(f"Ollama error: {e}")
        raise HTTPException(status_code=500, detail="Ollama is not responding. Is the app running?")
