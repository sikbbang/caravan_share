from pydantic import BaseModel
from typing import Union
from .user import UserInDB

class CaravanBase(BaseModel):
    name: str
    description: Union[str, None] = None
    location: str
    price: float
    image: str

class CaravanCreate(CaravanBase):
    pass

class Caravan(CaravanBase):
    id: int
    host_id: Union[int, None] = None
    host: Union[UserInDB, None] = None
    is_in_cart: bool = False

    class Config:
        from_attributes = True
