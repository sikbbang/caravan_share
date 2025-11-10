from sqlalchemy import Column, Integer, String, Float
from app.db.database import Base

class Caravan(Base):
    __tablename__ = "caravans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    price = Column(Float)
    image = Column(String)
