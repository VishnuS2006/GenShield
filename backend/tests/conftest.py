import asyncio
import os
import uuid
from pathlib import Path

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

if hasattr(asyncio, "WindowsSelectorEventLoopPolicy"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

TEST_DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://genshield:change-me@localhost:5432/genshield"
)

os.environ["DATABASE_URL"] = TEST_DB_URL
os.environ["LLM_PROVIDER"] = "mock"
os.environ["ENVIRONMENT"] = "development"

from app.core.database import get_db
from app.main import app
from app.models.enums import UserRole
from app.models.user import User
from app.seed.synthetic_data import seed_synthetic_data

engine = create_async_engine(TEST_DB_URL, future=True, echo=False)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database():
    async with TestingSessionLocal() as session:
        await seed_synthetic_data(session)
    yield
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def auth_headers(client):
    uid = uuid.uuid4().hex[:8]
    register = {
        "email": f"employee_{uid}@example.com",
        "password": "strongpass123",
        "full_name": "Test Employee"
    }
    await client.post("/api/auth/register", json=register)
    response = await client.post("/api/auth/login", json={"email": register["email"], "password": register["password"]})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def analyst_headers(client):
    uid = uuid.uuid4().hex[:8]
    register = {
        "email": f"analyst_{uid}@example.com",
        "password": "strongpass123",
        "full_name": "Security Analyst"
    }
    await client.post("/api/auth/register", json=register)
    async with TestingSessionLocal() as session:
        user = await session.scalar(select(User).where(User.email == register["email"]))
        if user:
            user.role = UserRole.SECURITY_ANALYST
            await session.commit()
    response = await client.post("/api/auth/login", json={"email": register["email"], "password": register["password"]})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def admin_headers(client):
    uid = uuid.uuid4().hex[:8]
    register = {
        "email": f"admin_{uid}@example.com",
        "password": "strongpass123",
        "full_name": "System Administrator"
    }
    await client.post("/api/auth/register", json=register)
    async with TestingSessionLocal() as session:
        user = await session.scalar(select(User).where(User.email == register["email"]))
        if user:
            user.role = UserRole.ADMINISTRATOR
            await session.commit()
    response = await client.post("/api/auth/login", json={"email": register["email"], "password": register["password"]})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
