from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.caravan import Caravan
from app.schemas.caravan import CaravanCreate

async def get_caravans(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Caravan).offset(skip).limit(limit))
    return result.scalars().all()

async def create_caravan(db: AsyncSession, caravan: CaravanCreate):
    db_caravan = Caravan(**caravan.dict())
    db.add(db_caravan)
    await db.commit()
    await db.refresh(db_caravan)
    return db_caravan

async def get_or_create_caravan(db: AsyncSession, caravan: CaravanCreate):
    result = await db.execute(select(Caravan).filter(Caravan.name == caravan.name))
    db_caravan = result.scalars().first()
    if db_caravan:
        return db_caravan
    return await create_caravan(db, caravan)

async def create_initial_caravans(db: AsyncSession):
    initial_caravans = [
        CaravanCreate(name='해변의 카라반', location='부산', price=150000, image='https://images.unsplash.com/photo-1712765124506-67e68c30e90f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjN8fCVFQyVCOSVCNCVFQiU5RCVCQyVFQiVCMCU5OHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900'),
        CaravanCreate(name='가족용 대형 카라반', location='전라남도', price=200000, image='https://images.unsplash.com/photo-1548513830-5e684f0d4d82?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2832'),
        CaravanCreate(name='커플용 카라반', location='충청북도', price=110000, image='https://images.unsplash.com/photo-1667574309729-6d71c99d0cbe?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjYwfHxjYXJhdmFufGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900'),
    ]
    for caravan in initial_caravans:
        await get_or_create_caravan(db, caravan)
