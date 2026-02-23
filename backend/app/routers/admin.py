from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, text
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


@router.get("/stats", summary="Administratorska statistika", description="Generiše detaljan izveštaj o broju korisnika, četova, prosečnoj dužini razgovora i najaktivnijim korisnicima.")
def get_admin_dashboard_stats(
    db: Session = Depends(get_db), 
    admin: User = Depends(get_admin_user) 
):
   
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_chats = db.query(func.count(Chat.id)).scalar() or 0
    
    
    avg_conv = db.execute(text("""
        SELECT ROUND(CAST(COUNT(m.id) AS FLOAT) / NULLIF(COUNT(DISTINCT c.id), 0),1)
        FROM chats c
        LEFT JOIN messages m ON c.id = m.chat_id
    """)).scalar() or 0
    
   
    modes_raw = db.execute(text("""
        SELECT COALESCE(mo.name, 'Default/Nepoznato'), COUNT(m.id) as count
        FROM messages m 
        LEFT JOIN modes mo ON m.mode_id = mo.id
        GROUP BY mo.id, mo.name
    """)).fetchall()
    
   
    top_users_raw = db.execute(text("""
        SELECT u.email, COUNT(m.id) as msg_count
        FROM users u
        JOIN chats c ON u.id = c.user_id
        JOIN messages m ON c.id = m.chat_id
        WHERE u.role_id != 'guest'
        GROUP BY u.id, u.email 
        ORDER BY msg_count DESC 
        LIMIT 5
    """)).fetchall()
    
    
    roles_raw = db.execute(text("""
        SELECT role_id, COUNT(*) FROM users GROUP BY role_id
    """)).fetchall()
    
    return {
        "summary": {
            "total_users": total_users,
            "total_chats": total_chats,
            "avg_chat_length": avg_conv
        },
        "modes": [["Mode", "Count of message"]] + [[r[0], r[1]] for r in modes_raw],
        "top_users": [["User", "Count of message"]] + [[r[0], r[1]] for r in top_users_raw],
        "roles": [["Role", "Number"]] + [[r[0], r[1]] for r in roles_raw]
    }


# Lista svih korisnika (bez guest-ova)
@router.get("/users", response_model=List[UserAdminResponse], summary="Lista svih korisnika", description="Vraća listu svih registrovanih korisnika. Guest nalozi su isključeni iz rezultata.")
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
   
    users = db.query(User).filter(User.role_id != "guest").all()
    return users


#  Ne može brisati admin-e
@router.delete("/users/{user_id}", summary="Brisanje korisnika", description="Trajno briše korisnika iz baze. Admin ne može obrisati samog sebe niti druge administratore.")
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
@router.patch("/users/{user_id}/role", response_model=UserAdminResponse, summary="Promena uloge korisnika", description="Omogućava promenu uloge korisnika (npr. iz standard_user u admin). Dozvoljeno samo za obične korisnike.")
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



from sqlalchemy import text



