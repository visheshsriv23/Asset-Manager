from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import verify_password, create_access_token, get_password_hash, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

def init_default_admin(db: Session):
    admin_email = "admin@gmail.com"
    existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
    if not existing_admin:
        user = models.User(
            email=admin_email,
            hashed_password=get_password_hash("admin123")
        )
        db.add(user)
        db.commit()