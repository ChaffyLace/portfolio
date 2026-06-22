from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from services.facade import stockflow_facade

router = APIRouter(prefix="/auth", tags=["Authentification"])

class LoginRequest(BaseModel):
    email: str
    password: str

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "user"

@router.post("/login")
def login(data: LoginRequest):
    try:
        user = stockflow_facade.login_user(data.email, data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Identifiants incorrects"
            )
        return {"status": "success", "user": user}
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegisterRequest):
    try:
        stockflow_facade.create_new_user(user.name, user.email, user.password, user.role)
        return {"status": "success", "message": "Utilisateur créé avec succès"}
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))