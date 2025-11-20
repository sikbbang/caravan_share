from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.cart import CartItem
from app.schemas.cart import CartItemCreate

async def get_cart_items_by_user(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(CartItem)
        .filter(CartItem.user_id == user_id)
        .options(selectinload(CartItem.caravan))
    )
    return result.scalars().all()

async def add_item_to_cart(db: AsyncSession, item: CartItemCreate, user_id: int):
    db_item = CartItem(**item.model_dump(), user_id=user_id)
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

async def delete_cart_item(db: AsyncSession, item_id: int, user_id: int):
    result = await db.execute(select(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user_id))
    db_item = result.scalars().first()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return db_item
