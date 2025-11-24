import asyncio
import json
import os
import sys # Import sys for path manipulation

# Store original working directory
original_cwd = os.getcwd()
# Change working directory to backend/
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

# Add backend_dir to sys.path if not already there, to ensure imports work
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Now import modules that depend on settings or relative paths
from app.db.database import SessionLocal, engine
from app.models.caravan import Caravan, Base
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.core import security
from app.crud import user as user_crud
from app.core.config import settings # Import the settings instance

# Restore original working directory
os.chdir(original_cwd)

async def seed_data():
    # Create tables
    async with engine.begin() as conn:
        # Drop all tables first to start fresh (optional, use with caution)
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        try:
            print("Starting seeding process...")
            # Create Admin User
            print(f"Checking for existing admin user: {settings.ADMIN_EMAIL}")
            existing_admin = await user_crud.get_user_by_email(session, email=settings.ADMIN_EMAIL)
            if not existing_admin:
                print("Admin user not found, creating...")
                admin_user_in = UserCreate(
                    name=settings.ADMIN_NAME,
                    email=settings.ADMIN_EMAIL,
                    password=settings.ADMIN_PASSWORD,
                    role=UserRole.admin
                )
                await user_crud.create_user(session, user=admin_user_in)
                print(f"Admin user '{settings.ADMIN_EMAIL}' created.")
            else:
                print(f"Admin user '{settings.ADMIN_EMAIL}' already exists.")

            print("Deleting existing caravan records...")
            # Delete all existing caravan records
            await session.execute(Caravan.__table__.delete())
            
            print("Loading data from JSON file...")
            # Load data from JSON file using absolute path
            caravans_json_path = os.path.join(original_cwd, 'caravans.json')
            with open(caravans_json_path, 'r') as f:
                caravans_data = json.load(f)

            print(f"Creating {len(caravans_data)} Caravan objects...")
            # Create Caravan objects and add them to the session
            for caravan_data in caravans_data:
                caravan = Caravan(
                    name=caravan_data['name'],
                    description=caravan_data['description'],
                    location=caravan_data['location'],
                    price=caravan_data['price'],
                    image=caravan_data['image'],
                    host_id=caravan_data.get('host_id') # Ensure host_id is handled
                )
                session.add(caravan)

            await session.commit()
            print("Successfully seeded caravan data.")
        except Exception as e:
            await session.rollback()
            print(f"An error occurred during seeding: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
