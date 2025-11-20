from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from app.schemas import user as user_schema
from app.crud import user as user_crud
from app.core import security
from app.core.config import settings
from app.db.database import get_db

router = APIRouter()

@router.post("/signup", response_model=user_schema.UserInDB)
async def signup(user: user_schema.UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = security.get_password_hash(user.password)
    db_user = await user_crud.create_user(db=db, user=user, hashed_password=hashed_password)
    return db_user

@router.post("/login", response_model=user_schema.Token)
async def login(db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_crud.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "name": user.name, "role": user.role.value}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
