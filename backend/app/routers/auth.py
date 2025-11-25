from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from .. import schemas
from ..crud import user as user_crud
from ..core.security import create_access_token, verify_password
from ..db.database import get_db
from ..core.config import settings
from ..auth import get_current_user

router = APIRouter()

@router.post("/register", response_model=schemas.user.User)
async def register(user: schemas.user.UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = await user_crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return await user_crud.create_user(db=db, user=user)


@router.post("/token", response_model=schemas.user.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await user_crud.get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.user.User)
async def read_users_me(current_user: schemas.user.User = Depends(get_current_user)):
    return current_user

