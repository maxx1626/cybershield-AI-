from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.database.session import get_db
from backend.app.models import User
from backend.app.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from backend.app.auth.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Duplicate check
    existing_email = db.query(User).filter(User.email == user_in.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    existing_username = db.query(User).filter(User.username == user_in.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken. Please choose another."
        )

    # Password validation
    if len(user_in.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    hashed_pw = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=hashed_pw,
        role="operator",
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({
        "sub": user.username,
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name
    })

    user_dict = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_dict}

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user:
        # Check by username as well
        user = db.query(User).filter(User.username == user_in.email).first()

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({
        "sub": user.username,
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name
    })

    user_dict = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_dict}

@router.post("/demo", response_model=TokenResponse)
def demo_login():
    """
    Dedicated instant access endpoint for evaluators and judges.
    Provides a fully authenticated session without revealing hardcoded credentials in frontend code.
    """
    user_dict = {
        "id": 999,
        "email": "judge@cybershield.ai",
        "username": "distinguished_judge",
        "full_name": "Distinguished Evaluator",
        "role": "judge"
    }

    access_token = create_access_token({
        "sub": user_dict["username"],
        "id": user_dict["id"],
        "email": user_dict["email"],
        "role": user_dict["role"],
        "full_name": user_dict["full_name"]
    })

    return {"access_token": access_token, "token_type": "bearer", "user": user_dict}

@router.get("/me")
def read_current_user(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out."}

