from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.caravan import Caravan
from app.schemas.caravan import CaravanCreate

async def get_caravan_by_id(db: AsyncSession, caravan_id: int):
    result = await db.execute(select(Caravan).filter(Caravan.id == caravan_id))
    return result.scalars().first()

async def get_caravans(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Caravan).offset(skip).limit(limit))
    return result.scalars().all()

async def get_caravans_by_host(db: AsyncSession, host_id: int):
    result = await db.execute(select(Caravan).filter(Caravan.host_id == host_id))
    return result.scalars().all()

async def get_or_create_caravan(db: AsyncSession, caravan: CaravanCreate):
    result = await db.execute(select(Caravan).filter(Caravan.name == caravan.name))
    db_caravan = result.scalars().first()
    if db_caravan:
        # Update existing caravan's image
        db_caravan.image = caravan.image
    else:
        # Create new caravan
        db_caravan = Caravan(**caravan.model_dump())
        db.add(db_caravan)
    
    await db.commit()
    await db.refresh(db_caravan)
    return db_caravan

async def create_caravan(db: AsyncSession, caravan: CaravanCreate, host_id: int):
    db_caravan = Caravan(**caravan.model_dump(), host_id=host_id)
    db.add(db_caravan)
    await db.commit()
    await db.refresh(db_caravan)
    return db_caravan

async def create_initial_caravans(db: AsyncSession):
    initial_caravans = [
        CaravanCreate(name="Airstream Bambi", description="A compact and stylish travel trailer.", price=80.0, location="Seoul", image="https://images.unsplash.com/photo-1712765124506-67e68c30e90f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjN8fCVFQyVCOSVCNCVFQiU5RCVCQyVFQiVCMCU5OHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900"),
        CaravanCreate(name="Winnebago Micro Minnie", description="A lightweight and versatile caravan.", price=70.0, location="Busan", image="https://images.unsplash.com/photo-1548513830-5e684f0d4d82?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2832"),
        CaravanCreate(name="Jayco Jay Flight", description="A family-friendly and spacious caravan.", price=90.0, location="Jeju", image="https://www.jayco.com/static/uploads/2022/08/2023-Jay-Flight-Bungalow-EXT-1-1.jpg"),
    ]
    for caravan in initial_caravans:
        await get_or_create_caravan(db, caravan)


