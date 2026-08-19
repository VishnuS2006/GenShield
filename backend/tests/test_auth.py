import uuid
import pytest


@pytest.mark.asyncio
async def test_registration_success(client):
    email = f"new_{uuid.uuid4().hex[:8]}@example.com"
    response = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "strongpass123", "full_name": "New User"}
    )
    assert response.status_code == 201
    assert response.json()["email"] == email


@pytest.mark.asyncio
async def test_duplicate_registration(client):
    email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": email, "password": "strongpass123", "full_name": "Dup User"}
    await client.post("/api/auth/register", json=payload)
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    email = f"login_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": email, "password": "strongpass123", "full_name": "Login User"}
    await client.post("/api/auth/register", json=payload)
    response = await client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_wrong_password(client):
    email = f"wrong_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": email, "password": "strongpass123", "full_name": "Wrong User"}
    await client.post("/api/auth/register", json=payload)
    response = await client.post("/api/auth/login", json={"email": payload["email"], "password": "badpass"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_endpoint_requires_token(client):
    response = await client.get("/api/protected-documents")
    assert response.status_code == 401
