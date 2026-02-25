

from pydantic import BaseModel, EmailStr, Field
from typing import Optional



class UserRegisterRequest(BaseModel):
    """
    Schema za registraciju korisnika.
    Frontend šalje: email, full_name, password
    """
    email: EmailStr = Field(
        ..., 
        example="user@example.com",
        description="Valid email address"
    )
    full_name: str = Field(
        ..., 
        min_length=2, 
        max_length=100, 
        example="Pera Peric",
        description="User's full name"
    )
    password: str = Field(
        ..., 
        min_length=8, 
        max_length=100, 
        example="peraperic123",
        description="Password (min 8 characters)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "peraperic@gmail.com",
                "full_name": "Pera Peric",
                "password": "peraperic123"
            }
        }


class UserRegisterResponse(BaseModel):
    """
    Schema za odgovor nakon registracije.
    Backend vraća: id, email, full_name, role_id
    """
    id: int
    email: str
    full_name: str
    role_id: str
    
    class Config:
        from_attributes = True  # Omogućava kreiranje iz SQLAlchemy modela




class UserLoginRequest(BaseModel):
    """
    Schema za login.
    Frontend šalje: email, password
    """
    email: EmailStr = Field(
        ..., 
        example="user@example.com",
        description="User's email address"
    )
    password: str = Field(
        ..., 
        example="peraperic123",
        description="User's password"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "peraperic@example.com",
                "password": "peraperic123"
            }
        }


class UserLoginResponse(BaseModel):
    """
    Schema za odgovor nakon login-a.
    Backend vraća: access_token, token_type, user
    """
    access_token: str = Field(
        ...,
        description="JWT access token"
    )
    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer')"
    )
    user: "UserResponse" = Field(
        ...,
        description="User information"
    )




class UserResponse(BaseModel):
    """
    Schema za informacije o korisniku.
    Bez password-a! (bezbednost)
    """
    id: int
    email: str
    full_name: str
    role_id: str
    
    class Config:
        from_attributes = True




class GuestCreateResponse(BaseModel):
    """
    Schema za odgovor nakon kreiranja guest naloga.
    """
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    message: str = Field(
        default="Guest account created. Limited to 1 chat and 10 messages.",
        description="Info message for guest user"
    )




class TokenData(BaseModel):
    """
    Schema za JWT token payload (šta je unutar tokena).
    """
    user_id: Optional[int] = None
    email: Optional[str] = None
    role_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "email": "john.doe@example.com",
                "role_id": "standard_user"
            }
        }
