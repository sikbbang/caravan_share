from pydantic import BaseModel
from typing import Union

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

    class Config:
        from_attributes = True
