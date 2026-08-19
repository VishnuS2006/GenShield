import pytest


@pytest.mark.asyncio
async def test_list_documents(client, auth_headers):
    response = await client.get("/api/protected-documents", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 6


@pytest.mark.asyncio
async def test_get_document(client, auth_headers):
    documents = await client.get("/api/protected-documents", headers=auth_headers)
    document_id = documents.json()[0]["id"]
    response = await client.get(f"/api/protected-documents/{document_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["facts"]


@pytest.mark.asyncio
async def test_document_facts_exist(client, auth_headers):
    response = await client.get("/api/protected-documents", headers=auth_headers)
    assert any(doc["facts"] for doc in response.json())
