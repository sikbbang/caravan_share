from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.caravan import CaravanCreate, Caravan
from app.crud import caravan as caravan_crud

router = APIRouter()

def require_host_role(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action. Host role required.",
        )
    return current_user

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import shutil
import uuid

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.caravan import CaravanCreate, Caravan
from app.crud import caravan as caravan_crud

router = APIRouter()

def require_host_role(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action. Host role required.",
        )
    return current_user

@router.post("/caravans", response_model=Caravan, dependencies=[Depends(require_host_role)])
async def create_caravan_for_host(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    name: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    price: float = Form(...),
    image: UploadFile = File(...)
):
    # Generate a unique filename
    file_extension = image.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"static/images/{unique_filename}"
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    # Create the Pydantic model from form data
    caravan_data = CaravanCreate(
        name=name,
        description=description,
        location=location,
        price=price,
        image=f"/{file_path}" # URL path to the image
    )
    
    return await caravan_crud.create_caravan(db=db, caravan=caravan_data, host_id=current_user.id)

@router.get("/caravans", response_model=List[Caravan], dependencies=[Depends(require_host_role)])
async def read_host_caravans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await caravan_crud.get_caravans_by_host(db=db, host_id=current_user.id)

@router.delete("/caravans/{caravan_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_host_role)])
async def delete_host_caravan(
    caravan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted_caravan = await caravan_crud.delete_caravan(db=db, caravan_id=caravan_id, host_id=current_user.id)
    if deleted_caravan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caravan not found or you do not have permission to delete it.")
    return

