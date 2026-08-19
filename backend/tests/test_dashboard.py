import pytest


@pytest.mark.asyncio
async def test_dashboard_counts(client, analyst_headers):
    await client.post(
        "/api/detect",
        headers=analyst_headers,
        json={"generated_response": "Project Orion launches in October 2026.", "document_ids": []}
    )
    response = await client.get("/api/dashboard", headers=analyst_headers)
    assert response.status_code == 200
    assert response.json()["total_requests"] >= 1
