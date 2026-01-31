

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext



# Secret key za JWT (u production-u staviti u .env fajl!)
SECRET_KEY = "your-secret-key-change-this-in-production"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  

# hashing passworda
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# funkcije za hashing

def hash_password(password: str) -> str:
    
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    
    return pwd_context.verify(plain_password, hashed_password)




def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    
    to_encode = data.copy()
    
   
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    
    to_encode.update({"exp": expire})
    
    # kreiranje tokena 
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def create_user_token(user_id: int, email: str, role_id: str) -> str:
    
    token_data = {
        "user_id": user_id,
        "email": email,
        "role_id": role_id
    }
    return create_access_token(token_data)
