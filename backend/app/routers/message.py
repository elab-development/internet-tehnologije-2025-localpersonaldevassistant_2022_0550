from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
        db.commit()
        db.refresh(ai_msg)

        return ai_msg

    except Exception as e:
        print(f"Ollama error: {e}")
        raise HTTPException(status_code=500, detail="Ollama is not responding. Is the app running?")

@router.get("/modes")
def fetch_modes(db: Session = Depends(get_db)):
    return db.query(Mode).all()