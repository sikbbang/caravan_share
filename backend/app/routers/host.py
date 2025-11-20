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

@router.post("/caravans", response_model=Caravan, dependencies=[Depends(require_host_role)])
async def create_caravan_for_host(
    caravan: CaravanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await caravan_crud.create_caravan(db=db, caravan=caravan, host_id=current_user.id)

@router.get("/caravans", response_model=List[Caravan], dependencies=[Depends(require_host_role)])
async def read_host_caravans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await caravan_crud.get_caravans_by_host(db=db, host_id=current_user.id)
