import os
from fastapi import APIRouter, Depends, HTTPException, Body, File, UploadFile, Form
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.message import Message
from app.models.mode import Mode
from app.schemas.message import MessageCreate, MessageResponse
from typing import Optional
import io
import PyPDF2 # type: ignore
import ollama
from app.models.document import Document

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/send", response_model=MessageResponse)
async def send_message(
    chat_id: int = Form(...),
    content: str = Form(...),
    mode_id: int = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    file_context = ""
    new_doc = None

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
            
        except Exception as e:
            print(f"PDF Error: {e}")

    db_mode = db.query(Mode).filter(Mode.id == mode_id).first()
    system_instructions = db_mode.description if db_mode else "You are a helpful AI assistant."
    
    prompt_content = content
    if file_context:
        prompt_content = f"Context from uploaded file:\n{file_context}\n\nUser question: {content}"

    user_msg = Message(chat_id=chat_id, content=content, role="user", mode_id=mode_id)
    if new_doc:
        user_msg.documents.append(new_doc)
    
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    try:
        response = ollama.chat(model='llama3.2:1b', messages=[
            {'role': 'system', 'content': system_instructions},
            {'role': 'user', 'content': prompt_content},
        ])
        
        ai_content = response['message']['content']
        ai_msg = Message(chat_id=chat_id, content=ai_content, role="assistant", mode_id=mode_id)
        
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        
        return ai_msg

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
