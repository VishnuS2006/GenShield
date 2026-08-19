import pytest


@pytest.mark.asyncio
async def test_list_documents(client, analyst_headers):
    response = await client.get("/api/protected-documents", headers=analyst_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 6


@pytest.mark.asyncio
async def test_get_document(client, analyst_headers):
    documents = await client.get("/api/protected-documents", headers=analyst_headers)
    assert documents.status_code == 200
    document_id = documents.json()[0]["id"]
    response = await client.get(f"/api/protected-documents/{document_id}", headers=analyst_headers)
    assert response.status_code == 200
    assert response.json()["facts"]


@pytest.mark.asyncio
async def test_document_facts_exist(client, analyst_headers):
    response = await client.get("/api/protected-documents", headers=analyst_headers)
    assert response.status_code == 200
    assert any(doc["facts"] for doc in response.json())
