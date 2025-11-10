from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import caravan as crud_caravan
from app.schemas import caravan as schema_caravan
from app.db.database import get_db

router = APIRouter()

@router.get("/caravans", response_model=List[schema_caravan.Caravan])
async def read_caravans(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    caravans = await crud_caravan.get_caravans(db, skip=skip, limit=limit)
    return caravans
