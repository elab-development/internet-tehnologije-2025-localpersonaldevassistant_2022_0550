from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.chat import Chat
from app.schemas.admin import UserAdminResponse, UpdateUserRoleRequest
from app.utils.deps import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

#  Provera da li je admin
def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role_id != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# Ovo cu mozda koristiti za config kasnije
@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    
    total_users = db.query(func.count(User.id)).scalar()
    total_chats = db.query(func.count(Chat.id)).scalar()
    total_messages = 0 
    
    users_by_role = (
        db.query(User.role_id, func.count(User.id))
        .group_by(User.role_id)
        .all()
    )
    
    role_breakdown = {role: count for role, count in users_by_role}
    
    return {
        "total_users": total_users,
        "total_chats": total_chats,
        "total_messages": total_messages,
        "users_by_role": {
            "admin": role_breakdown.get("admin", 0),
            "standard_user": role_breakdown.get("standard_user", 0),
            "guest": role_breakdown.get("guest", 0),
        }
    }




# Lista svih korisnika (bez guest-ova)
@router.get("/users", response_model=List[UserAdminResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
   
    users = db.query(User).filter(User.role_id != "guest").all()
    return users


#  Ne može brisati admin-e
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Ne dozvoli brisanje samog sebe
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    # Ne dozvoli brisanje drugih admina
    if user.role_id == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete admin users"
        )
    
    # Obriši korisnika 
    db.delete(user)
    db.commit()
    
    return {
        "message": f"User {user.email} deleted successfully",
        "deleted_user_id": user_id
    }


#  Može menjati samo standard_user
@router.patch("/users/{user_id}/role", response_model=UserAdminResponse)
def update_user_role(
    user_id: int,
    role_data: UpdateUserRoleRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    
    # Validacija uloge - samo admin i standard_user su dozvoljeni
    valid_roles = ["admin", "standard_user"]
    if role_data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Pronađi korisnika
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Proveri da li je korisnik standard_user
    if user.role_id != "standard_user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only change role of standard users"
        )
    
    # Promeni ulogu
    user.role_id = role_data.role
    db.commit()
    db.refresh(user)
    
    return user
