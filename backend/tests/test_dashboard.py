import pytest


@pytest.mark.asyncio
async def test_dashboard_counts(client, auth_headers):
    await client.post("/api/detect", headers=auth_headers, json={"generated_response": "Project Orion launches in October 2026.", "document_ids": []})
    response = await client.get("/api/dashboard", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total_requests"] >= 1
