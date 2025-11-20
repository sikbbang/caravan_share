from sqlalchemy import Column, Integer, String, Enum as PyEnum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

class UserRole(str, enum.Enum):
    guest = "guest"
    host = "host"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(PyEnum(UserRole))

    caravans = relationship("Caravan", back_populates="host")
    cart_items = relationship("CartItem", back_populates="user")
