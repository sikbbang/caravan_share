from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from authlib.integrations.starlette_client import OAuth

from app.schemas import user as user_schema
from app.crud import user as user_crud
from app.core import security
from app.core.config import settings
from app.db.database import get_db
from app.models.user import UserRole

router = APIRouter()

# OAuth settings
oauth = OAuth()
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    client_kwargs={
        'scope': 'email openid profile'
    }
)

@router.post("/signup", response_model=user_schema.UserInDB)
async def signup(user: user_schema.UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    db_user = await user_crud.create_user(db=db, user=user)
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

@router.get('/google/login')
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get('/google/callback')
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not fetch user info from Google",
        )

    email = user_info['email']
    user = await user_crud.get_user_by_email(db, email=email)

    if not user:
        # If user doesn't exist, create a new one.
        # We'll create them as a 'guest' by default.
        # A real app might have a page to ask them to choose a role.
        new_user_data = user_schema.UserCreate(
            email=email,
            name=user_info.get('name', 'New User'),
            password=email, # Use email as dummy password, will be hashed internally
            role=UserRole.guest 
        )
        user = await user_crud.create_user(db, user=new_user_data)

    # Create an access token for our app (moved outside the if block)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "name": user.name, "role": user.role.value},
        expires_delta=access_token_expires,
    )
    # Redirect to the frontend with the token in the hash
    response = RedirectResponse(url="/")
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True, # Prevent JS access
        samesite="lax",
        secure=False, # Set to True in production with HTTPS
    )
    # Also pass it in the hash for the JS to read and store
    response.headers["Location"] = f"/#token={access_token}"
    return response

@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Successfully logged out"}
