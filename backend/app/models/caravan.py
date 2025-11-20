from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Caravan(Base):
    __tablename__ = "caravans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    location = Column(String)
    image = Column(String)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    host = relationship("User", back_populates="caravans")

