import pytest


@pytest.mark.asyncio
async def test_registration_success(client):
    response = await client.post("/api/auth/register", json={"email": "new@example.com", "password": "strongpass123", "full_name": "New User"})
    assert response.status_code == 201
    assert response.json()["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_duplicate_registration(client):
    payload = {"email": "dup@example.com", "password": "strongpass123", "full_name": "Dup User"}
    await client.post("/api/auth/register", json=payload)
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    payload = {"email": "login@example.com", "password": "strongpass123", "full_name": "Login User"}
    await client.post("/api/auth/register", json=payload)
    response = await client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_wrong_password(client):
    payload = {"email": "wrong@example.com", "password": "strongpass123", "full_name": "Wrong User"}
    await client.post("/api/auth/register", json=payload)
    response = await client.post("/api/auth/login", json={"email": payload["email"], "password": "badpass"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_endpoint_requires_token(client):
    response = await client.get("/api/protected-documents")
    assert response.status_code == 401
