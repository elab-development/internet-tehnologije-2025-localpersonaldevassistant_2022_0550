from pydantic import BaseModel

# Response za jednog korisnika - samo osnovni podaci
class UserAdminResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role_id: str

    class Config:
        from_attributes = True

# Request za promenu role
class UpdateUserRoleRequest(BaseModel):
    role: str  
