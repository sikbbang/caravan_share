from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app import crud, schemas
from app.db.database import get_db

router = APIRouter()

@router.get("/caravans", response_model=List[schemas.caravan.Caravan])
async def read_caravans(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    caravans = await crud.caravan.get_caravans(db, skip=skip, limit=limit)
    return caravans

@router.get("/caravans/{caravan_id}", response_model=schemas.caravan.Caravan)
async def read_caravan(caravan_id: int, db: AsyncSession = Depends(get_db)):
    db_caravan = await crud.caravan.get_caravan_by_id(db, caravan_id=caravan_id)
    if db_caravan is None:
        raise HTTPException(status_code=404, detail="Caravan not found")
    return db_caravan

