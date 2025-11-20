from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    caravan_id = Column(Integer, ForeignKey("caravans.id"), nullable=False)

    user = relationship("User", back_populates="cart_items")
    caravan = relationship("Caravan")
