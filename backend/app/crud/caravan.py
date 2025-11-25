from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.caravan import Caravan
from app.schemas.caravan import CaravanCreate

async def get_caravan_by_id(db: AsyncSession, caravan_id: int):
    result = await db.execute(
        select(Caravan)
        .options(selectinload(Caravan.host))
        .filter(Caravan.id == caravan_id)
    )
    return result.scalars().first()

async def get_caravans(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Caravan)
        .options(selectinload(Caravan.host))
        .offset(skip)
        .limit(limit)
    )
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
    pass

async def delete_caravan(db: AsyncSession, caravan_id: int, host_id: int):
    result = await db.execute(select(Caravan).filter(Caravan.id == caravan_id))
    db_caravan = result.scalars().first()
    if db_caravan and db_caravan.host_id == host_id:
        await db.delete(db_caravan)
        await db.commit()
        return db_caravan
    return None

