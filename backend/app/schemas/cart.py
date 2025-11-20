from pydantic import BaseModel
from .caravan import Caravan

class CartItemBase(BaseModel):
    caravan_id: int

class CartItemCreate(CartItemBase):
    pass

class CartItemInDB(CartItemBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class CartItem(CartItemBase):
    id: int
    user_id: int
    caravan: Caravan

    class Config:
        from_attributes = True
