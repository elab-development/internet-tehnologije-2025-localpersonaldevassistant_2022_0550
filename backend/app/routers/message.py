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

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/send", response_model=MessageResponse, summary="Slanje poruke sa memorijom", description="Glavna ruta za AI komunikaciju. Podržava slanje PDF-a, klasifikaciju memorije u ChromaDB i generisanje RAG odgovora.")
async def send_message(
    chat_id: int = Form(...),
    content: str = Form(...),
    mode_id: int = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_context = ""
    new_doc = None

    scope = await classify_memory_scope(content)

    past_memories = memory_manager.recall_memory(current_user.id, chat_id, content)
    memory_context = "\n".join(past_memories) if past_memories else "No previous relevant memory."

    if file and file.content_type == "application/pdf":
        try:
            pdf_content = await file.read()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    file_context += text
            
            new_doc = Document(
                title=file.filename,
                path=f"uploads/{file.filename}",
                file_type=file.content_type,
                file_size=len(pdf_content)
            )
            
            if file_context:
                memory_manager.add_memory(current_user.id, chat_id, f"Document summary ({file.filename}): {file_context[:300]}", "conversation")
                
        except Exception as e:
            print(f"PDF Error: {e}")

    db_mode = db.query(Mode).filter(Mode.id == mode_id).first()
    system_instructions = db_mode.description if db_mode else "You are a helpful AI assistant."
    
    final_prompt = f"""
    [PAST MEMORY]
    {memory_context}

    [DOCUMENT CONTEXT]
    {file_context if file_context else "No document uploaded."}

    [USER QUESTION]
    {content}
    """

    user_msg = Message(chat_id=chat_id, content=content, role="user", mode_id=mode_id)
    if new_doc:
        user_msg.documents.append(new_doc)
    
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    try:
        response = ollama.chat(model='llama3.2:1b', messages=[
            {'role': 'system', 'content': system_instructions},
            {'role': 'user', 'content': final_prompt},
        ])
        
        ai_content = response['message']['content']
        
        ai_msg = Message(chat_id=chat_id, content=ai_content, role="assistant", mode_id=mode_id)
        db.add(ai_msg)
        
        memory_manager.add_memory(current_user.id, chat_id, content, scope)
        
        db.commit()
        db.refresh(ai_msg)
        
        return ai_msg

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/modes", summary="Dostupni AI režimi", description="Vraća listu svih modova rada (npr. 'Doktor', 'Programer') sa njihovim sistemskim instrukcijama.")
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