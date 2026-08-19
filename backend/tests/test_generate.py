import pytest


@pytest.mark.asyncio
async def test_mock_llm_generate(client, auth_headers):
    response = await client.post("/api/generate", headers=auth_headers, json={"prompt": "Prepare a summary of the upcoming product roadmap."})
    assert response.status_code == 200
    body = response.json()
    assert body["generated_response"]
    assert "security_analysis" in body


@pytest.mark.asyncio
async def test_generate_creates_audit_and_lineage(client, auth_headers):
    response = await client.post("/api/generate", headers=auth_headers, json={"prompt": "Tell me about Orion and its launch plan."})
    assert response.status_code == 200
    history = await client.get("/api/history", headers=auth_headers)
    assert history.status_code == 200
    assert history.json()
