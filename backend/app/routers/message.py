import os
from fastapi import APIRouter, Depends, HTTPException, Body, File, UploadFile, Form
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.message import Message
from app.models.mode import Mode
from app.models.user import User
from app.schemas.message import MessageResponse
from typing import Optional
import io
import PyPDF2 # type: ignore
import ollama
from app.models.document import Document
from app.utils.deps import get_current_user
from app.utils.memory import memory_manager, classify_memory_scope
from config import get_config;

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("/send", response_model=MessageResponse)
async def send_message(
    chat_id: int = Form(...),
    content: str = Form(...),
    mode_id: int = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    config = get_config()
    model_name = config['MODEL_NAME']
    ollama_url = config['OLLAMA_URL']
    print(f"Config: model={model_name}, url={ollama_url}")
    file_context = ""
    new_doc = None

    scope = await classify_memory_scope(content)
    past_memories = memory_manager.recall_memory(current_user.id, chat_id, content)
    
    recent_db_messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.id.desc()).limit(5).all()
    short_term_history = []
    for m in reversed(recent_db_messages):
        short_term_history.append({"role": m.role, "content": m.content})

    if file and file.content_type == "application/pdf":
        try:
            pdf_content = await file.read()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text: file_context += text
            
            new_doc = Document(
                title=file.filename,
                path=f"uploads/{file.filename}",
                file_type=file.content_type,
                file_size=len(pdf_content)
            )
        except Exception as e:
            print(f"PDF Error: {e}")

    db_mode = db.query(Mode).filter(Mode.id == mode_id).first()
    mode_instructions = db_mode.description if db_mode else "You are a helpful AI assistant."
    
    memory_string = "\n".join(past_memories) if past_memories else "None"
    system_content = f"""{mode_instructions}
    
    Use the following long-term memory only if relevant to the user's current question:
    {memory_string}

    Context from uploaded document:
    {file_context if file_context else "No document uploaded."}
    """

    messages = [{"role": "system", "content": system_content}]
    messages.extend(short_term_history)
    messages.append({"role": "user", "content": content})

    try:
        response = ollama.chat(model=model_name, messages=messages)
        ai_content = response['message']['content']

        user_msg = Message(chat_id=chat_id, content=content, role="user", mode_id=mode_id)
        if new_doc: user_msg.documents.append(new_doc)
        db.add(user_msg)
        
        ai_msg = Message(chat_id=chat_id, content=ai_content, role="assistant", mode_id=mode_id)
        db.add(ai_msg)
        
        memory_manager.add_memory(current_user.id, chat_id, content, ai_content, scope)
        
        db.commit()
        db.refresh(ai_msg)
        return ai_msg

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/modes", summary="Dostupni AI režimi", description="Vraća listu svih modova rada")
def fetch_modes(db: Session = Depends(get_db)):
    return db.query(Mode).all()

@router.post("/send-anonymous", summary="Anonimni čet (Guest)", description="Ograničena ruta za posetioce bez naloga. Ne podržava memoriju niti slanje fajlova.")
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
        
        return {
            "content": response['message']['content'],
            "role": "assistant"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ollama error.")