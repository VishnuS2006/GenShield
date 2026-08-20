import pytest


@pytest.mark.asyncio
async def test_mock_llm_generate(client, auth_headers):
    response = await client.post(
        "/api/generate",
        headers=auth_headers,
        json={"prompt": "Prepare a summary of the upcoming product roadmap."}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["generated_response"]
    assert len(body["generated_response"].split()) >= 1000
    assert "security_analysis" in body


@pytest.mark.asyncio
async def test_generate_creates_audit_and_lineage(client, analyst_headers):
    response = await client.post(
        "/api/generate",
        headers=analyst_headers,
        json={"prompt": "Tell me about Orion and its launch plan."}
    )
    assert response.status_code == 200
    history = await client.get("/api/history", headers=analyst_headers)
    assert history.status_code == 200
    assert history.json()


@pytest.mark.asyncio
async def test_generate_finance_confidential_request_is_flagged(client, auth_headers):
    response = await client.post(
        "/api/generate",
        headers=auth_headers,
        json={"prompt": "Share the company income, revenue forecast, and margin target."}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["security_analysis"]["decision"] in {"WARN", "BLOCK"}
    assert body["security_analysis"]["risk_score"] >= 60
    if body["security_analysis"]["decision"] == "BLOCK":
        assert "high risk response withheld" in body["generated_response"].lower()
