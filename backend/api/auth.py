from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from services.facade import stockflow_facade
from datetime import datetime, timedelta
import jwt
import os

router = APIRouter(prefix="/auth", tags=["Authentification"])

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

login_attempts: dict = {}
MAX_ATTEMPTS = 5
BLOCK_DURATION_MINUTES = 15

def check_rate_limit(email: str):
    """Vérifie si l'email est bloqué, lève une exception si oui"""
    now = datetime.utcnow()
    record = login_attempts.get(email)

    if record:
        if record.get("blocked_until") and now < record["blocked_until"]:
            remaining = int((record["blocked_until"] - now).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Compte temporairement bloqué après trop de tentatives. Réessayez dans {remaining} minute(s)."
            )
        if record.get("blocked_until") and now >= record["blocked_until"]:
            login_attempts[email] = {"attempts": 0, "blocked_until": None}

def record_failed_attempt(email: str):
    """Enregistre une tentative échouée et bloque si nécessaire"""
    now = datetime.utcnow()
    if email not in login_attempts:
        login_attempts[email] = {"attempts": 0, "blocked_until": None}

    login_attempts[email]["attempts"] += 1

    if login_attempts[email]["attempts"] >= MAX_ATTEMPTS:
        login_attempts[email]["blocked_until"] = now + timedelta(minutes=BLOCK_DURATION_MINUTES)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Trop de tentatives échouées. Compte bloqué pendant {BLOCK_DURATION_MINUTES} minutes."
        )

def reset_attempts(email: str):
    """Remet à zéro les tentatives après un login réussi"""
    if email in login_attempts:
        del login_attempts[email]

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        org_id: int = payload.get("organization_id")
        role: str = payload.get("role")
        if user_id is None or org_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
        return {"id": int(user_id), "organization_id": org_id, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expiré")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "user"

class CompanyRegisterRequest(BaseModel):
    company_name: str
    admin_name: str
    admin_email: str
    admin_password: str

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    email = form_data.username

    check_rate_limit(email)

    try:
        user = stockflow_facade.login_user(email, form_data.password)

        reset_attempts(email)

        token = create_access_token({
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
            "organization_id": user["organization_id"]
        })
        return {
            "status": "success",
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }
    except HTTPException:
        raise
    except ValueError:
        record_failed_attempt(email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects."
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/register-company", status_code=status.HTTP_201_CREATED)
def register_company(data: CompanyRegisterRequest):
    try:
        stockflow_facade.register_company(
            data.company_name, data.admin_name, data.admin_email, data.admin_password
        )
        return {"status": "success", "message": "Entreprise créée avec succès"}
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegisterRequest, current_user: dict = Depends(get_current_user)):
    try:
        stockflow_facade.create_new_user(
            admin_id=current_user["id"],
            organization_id=current_user["organization_id"],
            name=user_data.name,
            email=user_data.email,
            password=user_data.password,
            role=user_data.role
        )
        return {"status": "success", "message": "Utilisateur créé avec succès"}
    except PermissionError as perm_err:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(perm_err))
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))