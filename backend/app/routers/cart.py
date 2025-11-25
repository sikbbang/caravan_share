from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItem, CartItemInDB
from app.crud import cart as cart_crud

router = APIRouter()

@router.post("/cart", response_model=CartItemInDB, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item: CartItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await cart_crud.add_item_to_cart(db=db, item=item, user_id=current_user.id)

@router.get("/cart", response_model=List[CartItem])
async def read_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await cart_crud.get_cart_items_by_user(db=db, user_id=current_user.id)

@router.delete("/cart/{item_id}")
async def remove_from_cart(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted_item = await cart_crud.delete_cart_item(db=db, item_id=item_id, user_id=current_user.id)
    if not deleted_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    return {"ok": True}

@router.post("/cart/checkout")
async def checkout(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart_items = await cart_crud.get_cart_items_by_user(db=db, user_id=current_user.id)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # In a real application, you would integrate with a payment gateway like Stripe or Braintree.
    # Here, we'll just simulate a successful payment and clear the cart.
    
    for item in cart_items:
        await cart_crud.delete_cart_item(db=db, item_id=item.id, user_id=current_user.id)

    return {"message": "Payment successful, cart has been cleared."}
