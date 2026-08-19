import pytest

from app.models.enums import Decision


@pytest.mark.asyncio
async def test_unrelated_output_low_similarity(client, auth_headers):
    response = await client.post("/api/detect", headers=auth_headers, json={"generated_response": "The cafeteria menu includes soup and sandwiches.", "document_ids": []})
    assert response.status_code == 200
    assert response.json()["security_analysis"]["risk_score"] < 60


@pytest.mark.asyncio
async def test_direct_leakage_high_similarity(client, auth_headers):
    text = "Project Orion targets enterprise customers and launches in October 2026 with $84.5M expected revenue."
    response = await client.post("/api/detect", headers=auth_headers, json={"generated_response": text, "document_ids": []})
    assert response.status_code == 200
    assert response.json()["security_analysis"]["decision"] in {Decision.WARN.value, Decision.BLOCK.value}


@pytest.mark.asyncio
async def test_paraphrased_higher_than_unrelated(client, auth_headers):
    unrelated = await client.post("/api/detect", headers=auth_headers, json={"generated_response": "Public market commentary with no sensitive details.", "document_ids": []})
    paraphrased = await client.post("/api/detect", headers=auth_headers, json={"generated_response": "NovaTech plans to introduce Orion to enterprise buyers in October 2026.", "document_ids": []})
    assert paraphrased.json()["security_analysis"]["similarity_score"] >= unrelated.json()["security_analysis"]["similarity_score"]
