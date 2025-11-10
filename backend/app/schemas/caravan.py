from pydantic import BaseModel

class CaravanBase(BaseModel):
    name: str
    location: str
    price: float
    image: str

class CaravanCreate(CaravanBase):
    pass

class Caravan(CaravanBase):
    id: int

    class Config:
        orm_mode = True
