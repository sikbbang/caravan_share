from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app import crud, schemas
from app.db.database import get_db
from app.core.auth import get_current_user_optional
from app.models.user import User

router = APIRouter()

@router.get("/caravans", response_model=List[schemas.caravan.Caravan])
async def read_caravans(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    caravans = await crud.caravan.get_caravans(db, skip=skip, limit=limit)
    
    if current_user:
        cart_items = await crud.cart.get_cart_items_by_user(db, user_id=current_user.id)
        cart_caravan_ids = {item.caravan_id for item in cart_items}
        for caravan in caravans:
            if caravan.id in cart_caravan_ids:
                caravan.is_in_cart = True
                
    return caravans

@router.get("/caravans/{caravan_id}", response_model=schemas.caravan.Caravan)
async def read_caravan(caravan_id: int, db: AsyncSession = Depends(get_db)):
    db_caravan = await crud.caravan.get_caravan_by_id(db, caravan_id=caravan_id)
    if db_caravan is None:
        raise HTTPException(status_code=404, detail="Caravan not found")
    return db_caravan

