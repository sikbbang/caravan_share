from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from sqlalchemy.engine import Engine
import asyncio

from app.core.config import settings

@event.listens_for(Engine, "connect")
def connect(dbapi_connection, connection_record):
    """
    Disables requirement for savepoints for `aiosqlite` connections.
    """
    dbapi_connection.isolation_level = None

@event.listens_for(Engine, "begin")
def begin(conn):
    """
    Sets the isolation level to "DEFERRED" for `aiosqlite` connections.
    """
    conn.exec_driver_sql("BEGIN DEFERRED")


engine = create_async_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session
