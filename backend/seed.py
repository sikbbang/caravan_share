import asyncio
import json
from app.db.database import SessionLocal, engine
from app.models.caravan import Caravan, Base
from app.models.user import User  # Import User model to create the table if it doesn't exist

async def seed_data():
    # Create tables
    async with engine.begin() as conn:
        # Drop all tables first to start fresh (optional, use with caution)
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        try:
            # Delete all existing caravan records
            await session.execute(Caravan.__table__.delete())
            
            # Load data from JSON file
            with open('../caravans.json', 'r') as f:
                caravans_data = json.load(f)

            # Create Caravan objects and add them to the session
            for caravan_data in caravans_data:
                caravan = Caravan(
                    name=caravan_data['name'],
                    description=caravan_data['description'],
                    location=caravan_data['location'],
                    price=caravan_data['price'],
                    image=caravan_data['image']
                )
                session.add(caravan)

            await session.commit()
            print("Successfully seeded caravan data.")
        except Exception as e:
            await session.rollback()
            print(f"An error occurred during seeding: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
