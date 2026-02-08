from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime,timezone

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    UserRegisterRequest,
    UserRegisterResponse,
    UserLoginRequest,
    UserLoginResponse,
    UserResponse,
    GuestCreateResponse
)
from app.utils.security import hash_password, verify_password, create_user_token
from app.utils.deps import get_current_user



router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)




@router.post("/register", response_model=UserRegisterResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    
    
    #Provera da li email postoji
    existing_user = db.query(User).filter(User.email == request.email).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    

    hashed_password = hash_password(request.password)
    

    new_user = User(
        email=request.email,
        full_name=request.full_name,
        password=hashed_password,
        role_id="standard_user",
        created_at=datetime.now(timezone.utc)
    )
    
    # Dpdavanje u bazu
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 5. Vrati odgovor
    return new_user




@router.post("/login", response_model=UserLoginResponse)
def login(
    request: UserLoginRequest,
    db: Session = Depends(get_db)
):
   
    
   
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    
    if not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    
    access_token = create_user_token(
        user_id=user.id,
        email=user.email,
        role_id=user.role_id
    )
    
   
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role_id": user.role_id
        }
    }




@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    
    return current_user





